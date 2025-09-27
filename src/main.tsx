import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Cache cleared: added Excel export function - v6
createRoot(document.getElementById("root")!).render(<App />);