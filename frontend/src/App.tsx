// Main App Component
// T048: Root component integration

import React from 'react';
import { MealUpload } from './components/MealUpload';
import './App.css';

function App() {
  return (
    <div className="app">
      <MealUpload />
    </div>
  );
}

export default App;
