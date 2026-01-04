import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../../styles.css'; // Importing global styles (Tailwind if present there, or we might need to add Tailwind directives)

// Since we installed tailwindcss, we should probably ensure tailwind directives are available.
// If styles.css is the global one, it might already have them or we need a new one.
// The user said "Use Tailwind (or plain CSS if Tailwind exists)".
// I'll create a dedicated admin.css for Tailwind imports just in case.

import './admin.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
