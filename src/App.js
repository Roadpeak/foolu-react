import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import VideoWatch from './pages/VideoWatch';  
import Account from './pages/account';
import Signup from './pages/Signup';  
import Signin from './pages/Signin'; 
import SubscribePage from './pages/SubscribePage'; 
import './App.css';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/VideoWatch" element={<VideoWatch />} />
        <Route path="/account" element={<Account />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/SubscribePage" element={<SubscribePage />} />
      </Routes>
    </div>
  );
};

export default App;
