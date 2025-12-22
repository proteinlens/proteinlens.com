// T088: Cost monitoring alerts for blob storage and AI usage
// Azure Bicep configuration for monitoring and alerting

@description('The location for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, staging, prod)')
param environment string = 'prod'

@description('Monthly budget threshold in EUR')
param monthlyBudgetEur int = 100

@description('AI monthly usage threshold (API calls)')
param aiCallsThreshold int = 10000

@description('Storage monthly threshold in GB')
param storageThresholdGb int = 50

@description('Email addresses for cost alerts')
param alertEmailAddresses array = []

// Resource naming convention
var prefix = 'proteinlens-${environment}'

// =====================================================
// Action Group for Alerts
// =====================================================
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: '${prefix}-cost-alerts-ag'
  location: 'global'
  properties: {
    groupShortName: 'CostAlerts'
    enabled: true
    emailReceivers: [for email in alertEmailAddresses: {
      name: 'Email_${replace(email, '@', '_')}'
      emailAddress: email
      useCommonAlertSchema: true
    }]
  }
}

// =====================================================
// Budget Alert
// =====================================================
resource budget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: '${prefix}-monthly-budget'
  properties: {
    category: 'Cost'
    amount: monthlyBudgetEur
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: '${substring(utcNow(), 0, 7)}-01' // First of current month
    }
    notifications: {
      Actual_GreaterThan_50_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        contactEmails: alertEmailAddresses
        thresholdType: 'Actual'
      }
      Actual_GreaterThan_80_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: alertEmailAddresses
        thresholdType: 'Actual'
      }
      Actual_GreaterThan_100_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        contactEmails: alertEmailAddresses
        thresholdType: 'Actual'
      }
      Forecasted_GreaterThan_100_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        contactEmails: alertEmailAddresses
        thresholdType: 'Forecasted'
      }
    }
  }
}

// =====================================================
// Log Analytics Workspace (for custom metrics)
// =====================================================
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${prefix}-law'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// =====================================================
// Metric Alerts
// =====================================================

// Storage Account Alert - High transaction count
resource storageTransactionAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${prefix}-storage-transactions-alert'
  location: 'global'
  properties: {
    description: 'Alert when storage transactions exceed threshold (indicates high usage)'
    severity: 2
    enabled: true
    scopes: [
      resourceGroup().id
    ]
    evaluationFrequency: 'PT1H'
    windowSize: 'PT1H'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighTransactions'
          metricName: 'Transactions'
          metricNamespace: 'Microsoft.Storage/storageAccounts'
          operator: 'GreaterThan'
          threshold: 10000
          timeAggregation: 'Total'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Function App Alert - High execution count
resource functionExecutionAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${prefix}-function-execution-alert'
  location: 'global'
  properties: {
    description: 'Alert when function executions exceed threshold'
    severity: 2
    enabled: true
    scopes: [
      resourceGroup().id
    ]
    evaluationFrequency: 'PT1H'
    windowSize: 'PT1H'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighExecutionCount'
          metricName: 'FunctionExecutionCount'
          metricNamespace: 'Microsoft.Web/sites'
          operator: 'GreaterThan'
          threshold: 5000
          timeAggregation: 'Total'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Function App Alert - Errors
resource functionErrorAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${prefix}-function-error-alert'
  location: 'global'
  properties: {
    description: 'Alert when function errors exceed threshold'
    severity: 1
    enabled: true
    scopes: [
      resourceGroup().id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighErrorRate'
          metricName: 'Http5xx'
          metricNamespace: 'Microsoft.Web/sites'
          operator: 'GreaterThan'
          threshold: 50
          timeAggregation: 'Total'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// =====================================================
// Custom Scheduled Query Alert for AI Usage
// =====================================================
resource aiUsageAlert 'Microsoft.Insights/scheduledQueryRules@2022-06-15' = {
  name: '${prefix}-ai-usage-alert'
  location: location
  properties: {
    displayName: 'AI API Usage Alert'
    description: 'Alert when AI API calls approach monthly limit'
    severity: 2
    enabled: true
    evaluationFrequency: 'PT1H'
    scopes: [
      logAnalytics.id
    ]
    windowSize: 'P1D'
    criteria: {
      allOf: [
        {
          query: '''
            customMetrics
            | where name == "AI.TokenUsage.Total"
            | summarize TotalTokens = sum(value) by bin(timestamp, 1d)
            | where TotalTokens > ${aiCallsThreshold * 100}
          '''
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [
        actionGroup.id
      ]
    }
  }
}

// =====================================================
// Outputs
// =====================================================
output actionGroupId string = actionGroup.id
output logAnalyticsWorkspaceId string = logAnalytics.id
output budgetName string = budget.name
