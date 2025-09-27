import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Cache cleared: working CSV export without external hooks - v7
createRoot(document.getElementById("root")!).render(<App />);