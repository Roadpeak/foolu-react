import React from 'react';
import Header from './Header'; // Import Header component

const SignIn = () => {
  return (
    <div>
      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex bg-white shadow-lg rounded-lg overflow-hidden w-3/4 max-w-4xl">
          {/* Left Section */}
          <div className="w-1/2 p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign In</h1>
            <div className="flex justify-start mb-4 space-x-4">
              <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <i className="fab fa-twitter"></i>
              </button>
            </div>
            <form>
              {/* Username */}
              <div className="mb-4">
                <label className="block text-gray-600 mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-gray-600 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <input id="rememberMe" type="checkbox" className="mr-2" />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Remember Me
                  </label>
                </div>
                <a href="#" className="text-sm text-pink-500 hover:underline">
                  Forgot Password
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Right Section */}
          <div className="w-1/2 bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center flex-col p-8">
            <h2 className="text-3xl font-bold mb-4">Welcome back to foolu</h2>
            <p className="text-sm mb-8">Don't have an account?</p>
            <button
              className="bg-white text-pink-500 py-2 px-4 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => alert('Redirect to Sign Up')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
