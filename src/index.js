// Default CSS 
import './index.css';
// Third party dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
// Routes
import Routes from './routes.js';
// Providers
import UserProvider from './providers/UserProvider.js';
import FoldersProvider from './providers/FoldersProvider.js';


ReactDOM.render(
  <React.StrictMode>
    <UserProvider>
      <FoldersProvider>
        <Routes />
      </FoldersProvider>
    </UserProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
