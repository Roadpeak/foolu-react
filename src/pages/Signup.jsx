import React from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation hook

const Signup = () => {
    const location = useLocation();
    return (
        <div className='container'>
            <form action="">
                <h1>Sign In</h1>
                <div className='input'>
                    <input type='text' placeholder='Username' required />
                </div>
                <div className='input'>
                    <input type='text' placeholder='Password' required />
                </div>
            </form>
        </div>
  )   
}
 export default Signup;