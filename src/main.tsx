import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Cache cleared: restored admin panel with Excel export - v4
createRoot(document.getElementById("root")!).render(<App />);