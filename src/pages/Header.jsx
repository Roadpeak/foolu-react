// Example src/components/Header.jsx (or wherever your Header is)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // Import useAuth

const Header = () => {
  const { isAuthenticated, username, logout } = useAuth(); // Get auth state and functions
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout from context
    navigate('/signin'); // Redirect to signin page after logout
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Logo or Brand Name */}
      <Link to="/" className="text-2xl font-bold text-pink-500">
        Foolu
      </Link>

      {/* Navigation Links */}
      <nav className="flex items-center space-x-4">
        <Link to="/" className="text-gray-600 hover:text-pink-500">Home</Link>
        {/* Add other general navigation links here */}

        {isAuthenticated ? (
          // --- User is Signed In ---
          <>
            <span className="text-gray-700">Welcome, {username}!</span>
             {/* Link to Account Page */}
            <Link to="/account" className="text-gray-600 hover:text-pink-500">
                Account
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          // --- User is Signed Out ---
          <Link
            to="/signin"
            className="bg-pink-500 text-white py-1 px-3 rounded text-sm hover:bg-pink-600"
          >
            Sign In
          </Link>
          // Optionally show Sign Up link as well
          // <Link to="/signup" className="text-gray-600 hover:text-pink-500">Sign Up</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;