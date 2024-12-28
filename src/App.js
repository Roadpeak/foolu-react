import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';  // Correct imports
import Home from './pages/home'; 
import Watch from './pages/watch'; 
import Account from './pages/account'; 
import './App.css';

const App = () => {
  return (
    <div>
      <header>
        <h1>Foolu</h1>
      </header>

      <nav>
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/watch">Watch</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
};

export default App;
