import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Cache cleared: fixed duplicate Index declaration - v2
createRoot(document.getElementById("root")!).render(<App />);