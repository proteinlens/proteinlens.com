// Friendly Error Messages
// Makes technical errors fun and human-readable

export interface FriendlyError {
  icon: string
  title: string
  subtitle: string
  tips: string[]
  retryText: string
  color: 'blue' | 'amber' | 'red' | 'purple' | 'green'
}

// Fun loading messages that rotate
export const loadingMessages = {
  uploading: [
    { text: "Beaming your photo to the cloud...", emoji: "🚀" },
    { text: "Teaching our AI about your meal...", emoji: "🤖" },
    { text: "Sending deliciousness...", emoji: "✨" },
    { text: "Almost there, hang tight!", emoji: "⏳" },
  ],
  analyzing: [
    { text: "Our AI is inspecting your plate...", emoji: "🔍" },
    { text: "Counting proteins like a pro...", emoji: "🧮" },
    { text: "Crunching the nutritional numbers...", emoji: "📊" },
    { text: "Almost done! Getting hungry here...", emoji: "🤤" },
    { text: "Identifying every tasty morsel...", emoji: "🍽️" },
  ],
}

// Funny success messages
export const successMessages = [
  { text: "Boom! Analysis complete!", emoji: "💥" },
  { text: "Nailed it! Here's your protein info!", emoji: "🎯" },
  { text: "Your meal has been scanned!", emoji: "✅" },
  { text: "Protein detected! Looking good!", emoji: "💪" },
]

// Get a random message from an array
export const getRandomMessage = (messages: Array<{ text: string; emoji: string }>) => {
  return messages[Math.floor(Math.random() * messages.length)]
}

// Categorize error types
export const categorizeError = (error: string): 'network' | 'server' | 'quota' | 'image' | 'database' | 'unknown' => {
  const lowerError = error.toLowerCase()
  
  // Database/Prisma errors
  if (lowerError.includes('prisma') || 
      lowerError.includes('database') || 
      lowerError.includes('datasource') ||
      lowerError.includes('postgresql') ||
      lowerError.includes('postgres') ||
      lowerError.includes('schema.prisma') ||
      lowerError.includes('validation error')) {
    return 'database'
  }
  
  // Network errors
  if (lowerError.includes('network') || 
      lowerError.includes('fetch') || 
      lowerError.includes('failed to fetch') ||
      lowerError.includes('connection') ||
      lowerError.includes('econnrefused') ||
      lowerError.includes('timeout')) {
    return 'network'
  }
  
  // Server errors (500, 503, etc.)
  if (lowerError.includes('500') || 
      lowerError.includes('503') || 
      lowerError.includes('server error') ||
      lowerError.includes('internal server') ||
      lowerError.includes('temporarily')) {
    return 'server'
  }
  
  // Quota errors (429)
  if (lowerError.includes('429') || 
      lowerError.includes('quota') || 
      lowerError.includes('rate limit') ||
      lowerError.includes('too many')) {
    return 'quota'
  }
  
  // Image errors
  if (lowerError.includes('image') || 
      lowerError.includes('file') ||
      lowerError.includes('invalid') ||
      lowerError.includes('format') ||
      lowerError.includes('size')) {
    return 'image'
  }
  
  return 'unknown'
}

// Get friendly error config
export const getFriendlyError = (error: string): FriendlyError => {
  const category = categorizeError(error)
  
  switch (category) {
    case 'database':
      return {
        icon: '🔧',
        title: "We're doing some maintenance",
        subtitle: "Our team is working on it right now!",
        tips: [
          "☕ Perfect time for a coffee break",
          "⏰ Usually back in a few minutes",
          "💾 Your data is completely safe",
        ],
        retryText: "Check Again",
        color: 'amber',
      }
    
    case 'network':
      return {
        icon: '📡',
        title: "Houston, we have a connection issue",
        subtitle: "Can't reach our servers right now",
        tips: [
          "📶 Check your WiFi or mobile data",
          "🔄 Try refreshing the page",
          "🌐 VPN might be causing issues",
        ],
        retryText: "Retry Connection",
        color: 'blue',
      }
    
    case 'server':
      return {
        icon: '😅',
        title: "Our servers are taking a quick nap",
        subtitle: "They work hard, sometimes they need a break!",
        tips: [
          "⏳ Wait a few seconds and try again",
          "🛠️ Our team has been notified",
          "💪 We're working on waking them up!",
        ],
        retryText: "Wake Them Up",
        color: 'amber',
      }
    
    case 'quota':
      return {
        icon: '🎉',
        title: "Wow, you're on fire!",
        subtitle: "You've used all your free scans for today",
        tips: [
          "⭐ Upgrade to Pro for unlimited scans",
          "🆓 Free scans reset tomorrow",
          "📊 Pro users get detailed insights too!",
        ],
        retryText: "Upgrade to Pro",
        color: 'purple',
      }
    
    case 'image':
      return {
        icon: '📸',
        title: "Hmm, that photo didn't work",
        subtitle: "No worries, let's try a different one!",
        tips: [
          "🖼️ Use JPG, PNG, or WebP format",
          "📏 Keep it under 10MB",
          "💡 Good lighting helps a lot!",
        ],
        retryText: "Choose Another Photo",
        color: 'blue',
      }
    
    default:
      return {
        icon: '🤔',
        title: "Oops! Something went sideways",
        subtitle: "Don't worry, this happens to the best of us",
        tips: [
          "🔄 Try again - often works!",
          "📸 Maybe try a different photo",
          "🆘 Still stuck? We're here to help!",
        ],
        retryText: "Try Again",
        color: 'red',
      }
  }
}

// Color variants for styling
export const errorColors = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    title: 'text-blue-800 dark:text-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    tipBg: 'bg-blue-100/50 dark:bg-blue-900/30',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
    title: 'text-amber-800 dark:text-amber-200',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    tipBg: 'bg-amber-100/50 dark:bg-amber-900/30',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30',
    border: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900',
    title: 'text-red-800 dark:text-red-200',
    button: 'bg-red-600 hover:bg-red-700 text-white',
    tipBg: 'bg-red-100/50 dark:bg-red-900/30',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    title: 'text-purple-800 dark:text-purple-200',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    tipBg: 'bg-purple-100/50 dark:bg-purple-900/30',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    border: 'border-green-200 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-900',
    title: 'text-green-800 dark:text-green-200',
    button: 'bg-green-600 hover:bg-green-700 text-white',
    tipBg: 'bg-green-100/50 dark:bg-green-900/30',
  },
}

// Empty state messages for different contexts
export const emptyStates = {
  meals: {
    icon: '🍽️',
    title: "No meals tracked yet",
    subtitle: "Start by uploading your first meal photo!",
    action: "Upload Your First Meal",
  },
  history: {
    icon: '📅',
    title: "Your protein journey starts here",
    subtitle: "Upload a meal to see your history and trends",
    action: "Let's Get Started",
  },
  search: {
    icon: '🔍',
    title: "No results found",
    subtitle: "Try a different search term",
    action: "Clear Search",
  },
}
