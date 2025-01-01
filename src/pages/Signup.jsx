import React from 'react';
import Header from './Header';

const Signup = () => {
    return (
        <div className="min-h-screen flex flex-col">
            
            <Header />

            
            <div className="flex flex-1">
                
                <div className="flex-1 bg-purple-100 flex items-center justify-center">
                    <img
                        src="ty.jpg"
                        alt="Illustration"
                        className="w-4/5"
                    />
                </div>

                
                <div className="flex-1 bg-white flex items-center justify-center px-8">
                    <form className="w-full max-w-md">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">
                            Sign up to foolu
                        </h1>

                        
                        <div className="flex flex-col gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                       
                        <div className="flex items-start gap-2 mb-6">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1"
                                required
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree with foolu's{' '}
                                <a
                                    href="#"
                                    className="text-red-500 hover:underline"
                                >
                                    Terms of Service
                                </a>
                                ,{' '}
                                <a
                                    href="#"
                                    className="text-red-500 hover:underline"
                                >
                                    Privacy Policy
                                </a>
                                , and default{' '}
                                <a
                                    href="#"
                                    className="text-red-500 hover:underline"
                                >
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
                            <a
                                href="#"
                                className="text-red-500 hover:underline"
                            >
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
