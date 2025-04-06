import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
};

// 3. Provider Component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState(null);
    const [role, setRole] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState(null); // State for pic URL
    const [isLoading, setIsLoading] = useState(true);

    // Effect for initial load from localStorage
    useEffect(() => {
        console.log("AuthProvider: Checking local storage...");
        const storedToken = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        // Define storedPicUrl *within this scope*
        const storedPicUrl = localStorage.getItem('profilePictureUrl');

        if (storedToken && storedUsername && storedRole) {
            console.log("AuthProvider: Found stored credentials for", storedUsername, "Role:", storedRole);
            setIsAuthenticated(true);
            setUsername(storedUsername);
            setRole(storedRole);
            // Set state using the variable defined in this scope
            setProfilePictureUrl(storedPicUrl); // <<< Use storedPicUrl here
        } else {
             console.log("AuthProvider: No stored credentials found.");
        }
        setIsLoading(false);
    }, []);

    // Login function
    // <<< FIX: Add picUrl parameter back to the function signature >>>
    const login = (newUsername, token, userRole, picUrl) => {
        console.log("Auth Context: Login triggered for", newUsername, "Role:", userRole, "PicURL:", picUrl);
        try {
            localStorage.setItem('token', token);
            localStorage.setItem('username', newUsername);
            localStorage.setItem('role', userRole);

            // <<< FIX: Use the 'picUrl' parameter passed to the function >>>
            if (picUrl) { // Check if a picUrl was actually provided during login
                localStorage.setItem('profilePictureUrl', picUrl);
                console.log("Auth Context: Stored profilePictureUrl:", picUrl);
            } else {
                // If no picUrl provided on login, remove any old one from storage
                localStorage.removeItem('profilePictureUrl');
                console.log("Auth Context: No picUrl provided on login, removed any existing from storage.");
            }

            // Update state
            setUsername(newUsername);
            setRole(userRole);
            // <<< FIX: Set state using the 'picUrl' parameter >>>
            setProfilePictureUrl(picUrl || null); // Set state to provided picUrl or null
            setIsAuthenticated(true);
            console.log("Auth Context: State updated. isAuthenticated:", true);

        } catch (error) {
             console.error("Auth Context: Error during login storage/state update:", error);
        }
    };

    // Logout function
    const logout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            localStorage.removeItem('profilePictureUrl'); // Clear pic URL on logout
            setUsername(null);
            setRole(null);
            setProfilePictureUrl(null); // Clear pic URL state
            setIsAuthenticated(false);
            console.log("Auth Context: User logged out");
        } catch (error) {
             console.error("Auth Context: Error during logout storage removal:", error);
        }
    };

    // Function to update only the profile picture URL state and storage
    const updateProfilePicture = (newUrl) => {
         try {
            if (newUrl) { // Only store if a valid new URL is given
                localStorage.setItem('profilePictureUrl', newUrl);
                setProfilePictureUrl(newUrl);
                console.log("Auth Context: Profile picture updated in context and storage.");
            } else { // If null/undefined URL is passed, clear it
                 localStorage.removeItem('profilePictureUrl');
                 setProfilePictureUrl(null);
                 console.log("Auth Context: Profile picture cleared in context and storage.");
            }
         } catch(error) {
             console.error("Auth Context: Error updating profile picture URL storage:", error);
         }
   };

    // Value provided by context
    const value = {
        isAuthenticated,
        username,
        role,
        profilePictureUrl, // Provide pic URL state
        isLoading,
        login,
        logout,
        updateProfilePicture, // Provide update function
    };

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? <div>Loading Authentication...</div> : children}
        </AuthContext.Provider>
    );
};