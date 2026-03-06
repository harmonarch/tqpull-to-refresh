import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style.css'; // 引入我们刚刚完善的全局样式

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);