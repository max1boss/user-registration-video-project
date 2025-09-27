import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Cache cleared: removed Google Sheets dependencies
createRoot(document.getElementById("root")!).render(<App />);