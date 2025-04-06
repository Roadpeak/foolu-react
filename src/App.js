import React from 'react';
// 1. Import BrowserRouter
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
// 2. Import Header here for global rendering
import Header from './pages/Header'; // Adjust path if your Header is elsewhere (e.g., './Header')
import Home from './pages/home';
import VideoWatch from './pages/VideoWatch';
import Account from './pages/account';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import SubscribePage from './pages/SubscribePage';
import './App.css';

const App = () => {
  return (
    // AuthProvider wraps everything that needs auth state
    <AuthProvider>
        <Header />

        {/* Routes define the page content rendered below the Header */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/VideoWatch" element={<VideoWatch />} />
          <Route path="/account" element={<Account />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Signin" element={<Signin />} />
          <Route path="/SubscribePage" element={<SubscribePage />} />
          {/* Optional: Add a 404 Not Found route */}
          {/* <Route path="*" element={<div>404 - Page Not Found</div>} /> */}
        </Routes>
    </AuthProvider>
    // 5. Remove the unnecessary outer div if desired
    // </div>
  );
};

export default App;