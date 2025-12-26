import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeTelemetry } from './utils/telemetry'
import { initWebVitals, observeLongTasks } from './utils/webVitals'

// Initialize Application Insights before React renders (T017)
// This ensures all telemetry is captured from the start
initializeTelemetry();

// Initialize Web Vitals tracking after telemetry (T029)
// Tracks LCP, INP, CLS, FCP, TTFB metrics
initWebVitals();

// Observe long tasks for performance debugging
observeLongTasks();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
