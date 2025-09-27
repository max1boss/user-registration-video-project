import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Cache cleared: simplified admin panel works - v5
createRoot(document.getElementById("root")!).render(<App />);