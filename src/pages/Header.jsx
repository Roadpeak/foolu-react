import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 shadow-md bg-white">
      {/* Logo */}
      <div className="text-2xl font-bold text-red-500">Foolu</div>

      {/* Language Dropdown */}
      <div className="relative">
        <select className="text-gray-600 bg-transparent border-none focus:outline-none">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow ml-6">
        <ul className="flex space-x-6 text-gray-700 font-medium">
        <li className="hover:text-red-500 cursor-pointer">Home</li>
         <li className="hover:text-red-500 cursor-pointer">Subscribe</li>
          <li className="hover:text-red-500 cursor-pointer">Account</li>
        </ul>
      </nav>

      {/* Search Bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search..."
          className="p-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <i className="fas fa-search absolute left-3 text-gray-500"></i>
      </div>

      {/* Buttons */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-700 hover:text-red-500" onClick={() =>
                {navigate('/Signup')}}>Sign in</button>
        <button className="bg-red-500 text-white py-2 px-4 rounded-full">
          Join - Earn $5
        </button>
      </div>
    </header>
  );
};

export default Header;
