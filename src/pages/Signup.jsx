import React, { useState } from 'react';
import Header from './Header';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'viewer', // Default value set to 'viewer'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:5000/api/signup', formData)
      .then((response) => {
        console.log('User registered successfully');
      })
      .catch((error) => {
        console.error('There was an error registering the user!', error);
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <div className="flex-1 bg-purple-100 flex items-center justify-center">
          <img src="ty.jpg" alt="Illustration" className="w-4/5" />
        </div>

        <div className="flex-1 bg-white flex items-center justify-center px-8">
          <form className="w-full max-w-md" onSubmit={handleSubmit}>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign up to foolu</h1>

            <div className="flex flex-col gap-4 mb-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <select
                name="role"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                value={formData.role}
                onChange={handleChange}
              >
                <option value="creator">Creator</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="flex items-start gap-2 mb-6">
              <input type="checkbox" id="terms" className="mt-1" required />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree with foolu's{' '}
                <a href="#" className="text-red-500 hover:underline">
                  Terms of Service
                </a>
                ,{' '}
                <a href="#" className="text-red-500 hover:underline">
                  Privacy Policy
                </a>
                , and default{' '}
                <a href="#" className="text-red-500 hover:underline">
                  Notification Settings
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Create Account
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <a href="#" className="text-red-500 hover:underline">
                Sign In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
