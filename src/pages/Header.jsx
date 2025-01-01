import React from 'react';
import { useNavigate } from 'react-router-dom'; 

const Header = () => {
  const navigate = useNavigate(); 

  return (
    <header className="flex items-center justify-between p-4 shadow-md bg-white">
      
      <div className="text-2xl ml-2 font-bold text-red-500 cursor-pointer" onClick={() => navigate('/')}>
        Foolu
      </div>

      
      <div className="relative ml-4">
        <select className="text-gray-600 bg-transparent border-none focus:outline-none">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      
      <nav className="flex-grow ml-6">
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li
            className="hover:text-red-500 cursor-pointer"
            onClick={() => navigate('/')}
          >
            Home
          </li>
          <li
            className="hover:text-red-500 cursor-pointer"
            onClick={() => navigate('/SubscribePage')}
          >
            Subscribe
          </li>
          <li
            className="hover:text-red-500 cursor-pointer"
            onClick={() => navigate('/account')}
          >
            Account
          </li>
        </ul>
      </nav>

      
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search..."
          className="p-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <i className="fas fa-search absolute left-3 text-gray-500"></i>
      </div>

      
      <div className="flex items-center space-x-4 ml-6">
        <button 
          className="text-gray-700 hover:text-red-500" 
          onClick={() => navigate('/Signin')} 
        >
          Sign in
        </button>
        <button 
          className="bg-red-500 text-white py-2 px-4 rounded-full"
          onClick={() => navigate('/Signup')} 
        >
          Join - Earn $5
        </button>
      </div>
    </header>
  );
};

export default Header;
