import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import VideoWatch from './pages/VideoWatch';  
import Account from './pages/account';
import './App.css';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Default to home page */}
        <Route path="/VideoWatch" element={<VideoWatch />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
};

export default App;
