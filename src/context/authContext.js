import React, { createContext, useState, useEffect, useContext, useRef } from 'react'; // <<< Add useRef

// --- Configuration ---
const MIN_SPLASH_DISPLAY_TIME = 3000; // Milliseconds (e.g., 1500 = 1.5 seconds)

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
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading

    // --- Refs for splash screen logic ---
    const minTimePassed = useRef(false);
    const authCheckDone = useRef(false);

    // Effect for initial load AND minimum display time
    useEffect(() => {
        console.log("AuthProvider: Starting auth check and splash timer...");
        setIsLoading(true); // Ensure loading is true initially
        minTimePassed.current = false;
        authCheckDone.current = false;

        // --- Timer for Minimum Splash Duration ---
        const timerId = setTimeout(() => {
            console.log(`AuthProvider: Minimum splash time (${MIN_SPLASH_DISPLAY_TIME}ms) passed.`);
            minTimePassed.current = true;
            // If auth check already finished, set loading to false
            if (authCheckDone.current) {
                console.log("AuthProvider: Auth check was already done, setting loading false (timer finished last).");
                setIsLoading(false);
            }
        }, MIN_SPLASH_DISPLAY_TIME);

        // --- Perform Authentication Check (localStorage) ---
        // Encapsulate in a function for clarity
        const performAuthCheck = () => {
            console.log("AuthProvider: Checking local storage...");
            try {
                const storedToken = localStorage.getItem('token');
                const storedUsername = localStorage.getItem('username');
                const storedRole = localStorage.getItem('role');
                const storedPicUrl = localStorage.getItem('profilePictureUrl');

                if (storedToken && storedUsername && storedRole) {
                    console.log("AuthProvider: Found stored credentials.");
                    setIsAuthenticated(true);
                    setUsername(storedUsername);
                    setRole(storedRole);
                    setProfilePictureUrl(storedPicUrl);
                } else {
                    console.log("AuthProvider: No valid stored credentials found.");
                    // Explicitly clear state if storage is missing/invalid
                    setIsAuthenticated(false);
                    setUsername(null);
                    setRole(null);
                    setProfilePictureUrl(null);
                }
            } catch (error) {
                console.error("AuthProvider: Error reading from localStorage", error);
                 setIsAuthenticated(false); // Clear state on error
                 setUsername(null);
                 setRole(null);
                 setProfilePictureUrl(null);
            } finally {
                console.log("AuthProvider: Auth check finished.");
                authCheckDone.current = true;
                // If the timer already finished, set loading to false
                if (minTimePassed.current) {
                    console.log("AuthProvider: Min splash time was already done, setting loading false (auth check finished last).");
                    setIsLoading(false);
                }
            }
        };

        performAuthCheck(); // Execute the check

        // --- Cleanup Function ---
        return () => {
            clearTimeout(timerId); // Clear timer if component unmounts
            console.log("AuthProvider: Cleanup effect.");
        };
    }, []); // Run only once on mount

    // --- Login function (remains the same as your provided version) ---
    const login = (newUsername, token, userRole, picUrl) => {
        console.log("Auth Context: Login triggered for", newUsername, "Role:", userRole, "PicURL:", picUrl);
        try {
            localStorage.setItem('token', token);
            localStorage.setItem('username', newUsername);
            localStorage.setItem('role', userRole);
            if (picUrl) {
                localStorage.setItem('profilePictureUrl', picUrl);
                console.log("Auth Context: Stored profilePictureUrl:", picUrl);
            } else {
                localStorage.removeItem('profilePictureUrl');
                console.log("Auth Context: No picUrl provided on login, removed any existing from storage.");
            }
            setUsername(newUsername);
            setRole(userRole);
            setProfilePictureUrl(picUrl || null);
            setIsAuthenticated(true);
            console.log("Auth Context: State updated. isAuthenticated:", true);
        } catch (error) {
             console.error("Auth Context: Error during login storage/state update:", error);
        }
    };

    // --- Logout function (remains the same) ---
    const logout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            localStorage.removeItem('profilePictureUrl');
            setUsername(null);
            setRole(null);
            setProfilePictureUrl(null);
            setIsAuthenticated(false);
            console.log("Auth Context: User logged out");
        } catch (error) {
             console.error("Auth Context: Error during logout storage removal:", error);
        }
    };

    // --- updateProfilePicture function (remains the same) ---
    const updateProfilePicture = (newUrl) => {
         try {
            if (newUrl) {
                localStorage.setItem('profilePictureUrl', newUrl);
                setProfilePictureUrl(newUrl);
                console.log("Auth Context: Profile picture updated.");
            } else {
                 localStorage.removeItem('profilePictureUrl');
                 setProfilePictureUrl(null);
                 console.log("Auth Context: Profile picture cleared.");
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
        profilePictureUrl,
        isLoading, // isLoading is now controlled by BOTH timer and auth check
        login,
        logout,
        updateProfilePicture,
    };

    // Provider still just returns the Provider component with the value.
    // The consuming component (App.js -> AppContent) handles the loading UI.
    return (
        <AuthContext.Provider value={value}>
            {children}
            {/* REMOVED the loading check from here - App.js will handle it */}
            {/* {isLoading ? <div>Loading Authentication...</div> : children} */}
        </AuthContext.Provider>
    );
};