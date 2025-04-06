import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
// import Header from './Header'; // <<< REMOVE THIS if Header is global in App.js

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper CSS class strings using Tailwind utilities
  const inputStyle = "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent shadow-sm sm:text-sm";
  const submitButtonStyle = `w-full bg-red-500 text-white py-2.5 px-4 rounded-md shadow hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-150 ease-in-out ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`; // Made dynamic based on isLoading
  const linkStyle = "font-medium text-pink-600 hover:text-pink-500 hover:underline";
  const welcomePanelStyle = "w-full md:w-1/2 bg-gradient-to-r from-pink-500 to-red-500 text-white hidden md:flex items-center justify-center flex-col p-8 text-center";


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError('Please fill in both username and password.');
      return;
    }
    setIsLoading(true);

    axios.post('http://localhost:5000/api/signin', formData)
      .then(response => {
        console.log('Sign in API success:', response.data);
        const { token, role, username: backendUsername, profilePictureUrl } = response.data;
        const finalUsername = backendUsername || formData.username;
        const userRole = role;

        if (!token || !userRole || !finalUsername) {
             console.error("SignIn Error: Token, role, or username missing", response.data);
             setError("Login failed: Invalid response from server.");
             setIsLoading(false);
             return;
        }
        console.log(`Calling AuthContext login with: User=${finalUsername}, Role=${userRole}, PicURL=${profilePictureUrl}`);
        login(finalUsername, token, userRole, profilePictureUrl);
        navigate("/");
      })
      .catch(error => {
        console.error('Sign in API error:', error.response || error.message);
        const errorMsg = error.response?.data?.message || error.response?.data || 'Sign in failed. Check credentials.';
        setError(errorMsg);
      })
      .finally(() => {
         setIsLoading(false);
      });
  };

  return (
    // Remove outer div if Header was removed and this is rendered by Router directly
    <div>
      {/* <Header /> <<< REMOVE THIS if Header is global in App.js */}

      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl my-8">
          {/* Left Section (Form) */}
          <div className="w-full md:w-1/2 p-6 sm:p-8">
             <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">Sign In</h1>
             <form onSubmit={handleSubmit}>
                {/* Username Input */}
                <div className="mb-4">
                    <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="username"> Username </label>
                    {/* Use the variable with {} */}
                    <input id="username" name="username" type="text" placeholder="Enter username" value={formData.username} onChange={handleChange} className={inputStyle} required disabled={isLoading}/>
                </div>
                {/* Password Input */}
                <div className="mb-4">
                    <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="password"> Password </label>
                    {/* Use the variable with {} */}
                    <input id="password" name="password" type="password" placeholder="Enter password" value={formData.password} onChange={handleChange} className={inputStyle} required disabled={isLoading}/>
                </div>
                {/* Error Message */}
                {error && (<p className="text-red-500 text-sm mb-4 text-center">{error}</p>)}
                {/* Remember/Forgot Row */}
                <div className="flex items-center justify-between mb-6 text-sm">
                    <div className="flex items-center">
                      <input id="rememberMe" type="checkbox" className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
                      <label htmlFor="rememberMe" className="text-gray-600"> Remember Me </label>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Forgot Password Clicked'); }} className={linkStyle}> {/* Use the variable with {} */}
                      Forgot Password?
                    </a>
                </div>
                {/* Submit Button */}
                {/* Use the variable with {} */}
                <button type="submit" disabled={isLoading} className={submitButtonStyle}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
             </form>
             {/* Sign Up Link */}
             <p className="text-sm text-center text-gray-500 mt-6">
                Don't have an account?{' '}
                {/* Use the variable with {} */}
                <button onClick={() => navigate('/signup')} className={linkStyle}>
                   Sign Up
                </button>
             </p>
          </div>
          {/* Right Section (Welcome) */}
          {/* Use the variable with {} */}
          <div className={welcomePanelStyle}>
            <h2 className="text-3xl font-bold mb-4">Welcome back to foolu</h2>
            <p className="text-base mb-8">Sign in to continue watching and earning, or manage your creator content!</p>
             <button
                className="bg-white text-pink-500 font-semibold py-2 px-6 rounded-md shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-pink-600 transition duration-150 ease-in-out" // Kept inline as it was different
                onClick={() => navigate('/signup')}
             >
                Sign Up Now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;