import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter here
import App from './App';
import './index.css';


ReactDOM.render(
  <BrowserRouter>  {/* Wrap the whole app in Router here */}
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
