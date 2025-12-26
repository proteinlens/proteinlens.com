// T088: Cost monitoring alerts for blob storage and AI usage
// Azure Bicep configuration for monitoring and alerting

@description('The location for all resources')
param location string = 'northeurope'

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

@description('Budget start date (first of month, e.g., 2025-01-01)')
param budgetStartDate string = '${substring(utcNow(), 0, 7)}-01'

@description('Storage account resource ID for storage alerts (optional - if not provided, storage alert is skipped)')
param storageAccountId string = ''

@description('Function App resource ID for function alerts (optional - if not provided, function alerts are skipped)')
param functionAppId string = ''

@description('Enable scheduled query alerts (requires Application Insights data to be flowing - set to false for initial deployment)')
param enableQueryAlerts bool = false

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
      startDate: budgetStartDate
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
    retentionInDays: 30              // Interactive/hot retention
    // Note: Archive retention (90 days) configured via workspace data export or Azure Policy
    // See: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-retention-archive
  }
}

// =====================================================
// Metric Alerts
// =====================================================

// Storage Account Alert - High transaction count
// Note: Storage account alerts require targeting a specific storage account, not resource group
resource storageTransactionAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (!empty(storageAccountId)) {
  name: '${prefix}-storage-transactions-alert'
  location: 'global'
  properties: {
    description: 'Alert when storage transactions exceed threshold (indicates high usage)'
    severity: 2
    enabled: true
    scopes: [
      storageAccountId
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
// Note: Function app alerts require targeting a specific function app, not resource group
resource functionExecutionAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (!empty(functionAppId)) {
  name: '${prefix}-function-execution-alert'
  location: 'global'
  properties: {
    description: 'Alert when function executions exceed threshold'
    severity: 2
    enabled: true
    scopes: [
      functionAppId
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
// Note: Function app alerts require targeting a specific function app, not resource group
resource functionErrorAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (!empty(functionAppId)) {
  name: '${prefix}-function-error-alert'
  location: 'global'
  properties: {
    description: 'Alert when function errors exceed threshold'
    severity: 1
    enabled: true
    scopes: [
      functionAppId
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
// Note: Requires Application Insights data to be flowing (customMetrics table)
// =====================================================
resource aiUsageAlert 'Microsoft.Insights/scheduledQueryRules@2022-06-15' = if (enableQueryAlerts) {
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
// Feature 011: Observability Alerts
// =====================================================

// T025: Observability Action Group (reuses existing email list)
resource observabilityActionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: '${prefix}-observability-ag'
  location: 'global'
  properties: {
    groupShortName: 'ObsAlerts'
    enabled: true
    emailReceivers: [for email in alertEmailAddresses: {
      name: 'Email_${replace(email, '@', '_')}'
      emailAddress: email
      useCommonAlertSchema: true
    }]
  }
}

// T022: API Error Rate Alert (>5% over 5min)
// Note: Requires specific function app ID - resource group level not supported for Microsoft.Web/sites
resource apiErrorRateAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (!empty(functionAppId)) {
  name: '${prefix}-api-error-rate-alert'
  location: 'global'
  properties: {
    description: 'Alert when API error rate exceeds 5% over 5 minutes (Feature 011: Observability)'
    severity: 1 // Critical
    enabled: true
    scopes: [
      functionAppId
    ]
    evaluationFrequency: 'PT1M'   // Evaluate every minute
    windowSize: 'PT5M'            // Over 5 minute window
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'APIErrorRate'
          metricName: 'Http5xx'
          metricNamespace: 'Microsoft.Web/sites'
          operator: 'GreaterThan'
          threshold: 5  // More than 5 errors in 5 minutes
          timeAggregation: 'Total'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    // T026c: Alert aggregation configuration
    autoMitigate: true  // Auto-resolve after 15 minutes
    actions: [
      {
        actionGroupId: observabilityActionGroup.id
      }
    ]
  }
}

// T023: API Latency Alert (P95 > 3s)
// Note: Requires specific function app ID - resource group level not supported for Microsoft.Web/sites
resource apiLatencyAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (!empty(functionAppId)) {
  name: '${prefix}-api-latency-alert'
  location: 'global'
  properties: {
    description: 'Alert when API P95 latency exceeds 3 seconds (Feature 011: Observability)'
    severity: 2 // Warning
    enabled: true
    scopes: [
      functionAppId
    ]
    evaluationFrequency: 'PT5M'   // Evaluate every 5 minutes
    windowSize: 'PT15M'           // Over 15 minute window
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'APILatency'
          metricName: 'HttpResponseTime'
          metricNamespace: 'Microsoft.Web/sites'
          operator: 'GreaterThan'
          threshold: 3000  // 3000ms = 3 seconds
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    autoMitigate: true
    actions: [
      {
        actionGroupId: observabilityActionGroup.id
      }
    ]
  }
}

// T024: Health Check Failure Alert (2 consecutive failures)
// Note: Requires Application Insights data to be flowing (requests table)
resource healthCheckAlert 'Microsoft.Insights/scheduledQueryRules@2022-06-15' = if (enableQueryAlerts) {
  name: '${prefix}-health-check-alert'
  location: location
  properties: {
    displayName: 'Health Check Failure Alert'
    description: 'Alert when health check fails 2 consecutive times (Feature 011: Observability)'
    severity: 1 // Critical
    enabled: true
    evaluationFrequency: 'PT5M'   // T026c: 5-minute evaluation
    scopes: [
      logAnalytics.id
    ]
    windowSize: 'PT10M'
    criteria: {
      allOf: [
        {
          query: '''
            requests
            | where name contains "health" and resultCode != "200"
            | summarize FailedCount = count() by bin(timestamp, 5m)
            | where FailedCount >= 2
          '''
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: {
            numberOfEvaluationPeriods: 2  // 2 consecutive failures
            minFailingPeriodsToAlert: 2
          }
        }
      ]
    }
    autoMitigate: true  // T026c: 15-minute auto-resolve
    actions: {
      actionGroups: [
        observabilityActionGroup.id
      ]
    }
  }
}

// Frontend Error Alert (> 50 errors/hour)
// Note: Requires Application Insights data to be flowing (exceptions table)
resource frontendErrorAlert 'Microsoft.Insights/scheduledQueryRules@2022-06-15' = if (enableQueryAlerts) {
  name: '${prefix}-frontend-error-alert'
  location: location
  properties: {
    displayName: 'Frontend Error Alert'
    description: 'Alert when frontend exceptions exceed 50 per hour (Feature 011: Observability)'
    severity: 2 // Warning
    enabled: true
    evaluationFrequency: 'PT15M'
    scopes: [
      logAnalytics.id
    ]
    windowSize: 'PT1H'
    criteria: {
      allOf: [
        {
          query: '''
            exceptions
            | where cloud_RoleName == "proteinlens-frontend"
            | summarize ExceptionCount = count() by bin(timestamp, 1h)
            | where ExceptionCount > 50
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
    autoMitigate: true
    actions: {
      actionGroups: [
        observabilityActionGroup.id
      ]
    }
  }
}

// LCP Degradation Alert (P75 > 2.5s)
// Note: Requires Application Insights data to be flowing (customMetrics table)
resource lcpAlert 'Microsoft.Insights/scheduledQueryRules@2022-06-15' = if (enableQueryAlerts) {
  name: '${prefix}-lcp-degradation-alert'
  location: location
  properties: {
    displayName: 'LCP Performance Degradation Alert'
    description: 'Alert when Largest Contentful Paint P75 exceeds 2.5 seconds (Feature 011: Observability)'
    severity: 3 // Informational
    enabled: true
    evaluationFrequency: 'PT30M'
    scopes: [
      logAnalytics.id
    ]
    windowSize: 'PT1H'
    criteria: {
      allOf: [
        {
          query: '''
            customMetrics
            | where name == "WebVitals.LCP"
            | summarize P75_LCP = percentile(value, 75) by bin(timestamp, 1h)
            | where P75_LCP > 2500
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
    autoMitigate: true
    actions: {
      actionGroups: [
        observabilityActionGroup.id
      ]
    }
  }
}

// Database Latency Alert (P95 > 500ms)
// Note: Requires Application Insights data to be flowing (dependencies table)
resource databaseLatencyAlert 'Microsoft.Insights/scheduledQueryRules@2022-06-15' = if (enableQueryAlerts) {
  name: '${prefix}-database-latency-alert'
  location: location
  properties: {
    displayName: 'Database Latency Alert'
    description: 'Alert when database P95 latency exceeds 500ms (Feature 011: Observability)'
    severity: 2 // Warning
    enabled: true
    evaluationFrequency: 'PT5M'
    scopes: [
      logAnalytics.id
    ]
    windowSize: 'PT15M'
    criteria: {
      allOf: [
        {
          query: '''
            dependencies
            | where type == "PostgreSQL" or type == "SQL"
            | summarize P95_Duration = percentile(duration, 95) by bin(timestamp, 15m)
            | where P95_Duration > 500
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
    autoMitigate: true
    actions: {
      actionGroups: [
        observabilityActionGroup.id
      ]
    }
  }
}

// =====================================================
// Outputs
// =====================================================
output actionGroupId string = actionGroup.id
output observabilityActionGroupId string = observabilityActionGroup.id
output logAnalyticsWorkspaceId string = logAnalytics.id
output budgetName string = budget.name
output apiErrorRateAlertId string = !empty(functionAppId) ? apiErrorRateAlert.id : ''
output apiLatencyAlertId string = !empty(functionAppId) ? apiLatencyAlert.id : ''
output healthCheckAlertId string = enableQueryAlerts ? healthCheckAlert.id : ''
