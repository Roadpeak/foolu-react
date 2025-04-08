import React, { useState, useRef, useEffect } from 'react';
import Header from './Header'; // Assuming Header component exists and is correctly imported
import { useAuth } from '../context/authContext'; // Assuming authContext.js is in ../context/
import {
  Briefcase, LayoutDashboard, Banknote, Settings, BarChartBig, UserCircle,
  LinkIcon, TargetIcon, BellIcon, CheckCircleIcon, PlayCircleIcon, ClockIcon, UsersIcon, EyeIcon  // <<< ADDED THESE ICONS
} from 'lucide-react'; // Ensure all needed icons are imported (Removed UserCog as it wasn't used)
import axios from 'axios'; // Import axios

// --- Shared UI Components ---

const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-left text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group ${isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1`}
    >
      {Icon && <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-pink-600' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" />}
      {label}
    </button>
);

const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
       {Icon && <Icon className="h-8 w-8 text-pink-500 flex-shrink-0" />}
      <div>
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
);

const ProgressBar = ({ value, label }) => (
    <div>
      <div className="flex justify-between mb-1">
         <span className="text-sm font-medium text-gray-700">{label}</span>
         <span className="text-sm font-medium text-pink-600">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
        <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
);

const FormInput = ({ id, label, type = 'text', placeholder, readOnly = false, value, onChange, labelClassName, ...props }) => (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>{label}</label>
      <input
        type={type}
        id={id}
        name={id}
        readOnly={readOnly}
        value={value || ''}
        onChange={onChange}
        className={`w-full p-3 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-pink-500 focus:border-pink-500 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        {...props}
      />
    </div>
);

const SubmitButton = ({ children, onClick, type = "submit", disabled = false, isLoading = false }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-150 ${(disabled || isLoading) ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'}`}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
);

// --- Page-Specific View Components ---

const MpesaForm = () => (
    <form className="space-y-5">
       <h3 className="text-lg font-semibold text-gray-800 mb-3">Mpesa Details</h3>
       <FormInput id="mpesa-amount" label="Amount to Withdraw" type="number" placeholder="e.g., 1000" min="0" />
       <FormInput id="mpesa-phone" label="Mpesa Phone Number" type="tel" placeholder="e.g., 0712345678" />
      <SubmitButton>Proceed with Mpesa</SubmitButton>
    </form>
);

const BankForm = () => (
    <form className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Bank Details</h3>
        <FormInput id="bank-amount" label="Amount to Withdraw" type="number" placeholder="e.g., 5000" min="0" />
        <FormInput id="bank-holder" label="Account Holder Name" value="" placeholder="Account Holder Name" readOnly /> {/* TODO: Fetch real data */}
        <FormInput id="bank-card" label="Card Number (Last 4 Digits)" value="" placeholder="**** **** **** 0000" readOnly /> {/* TODO: Fetch real data */}
        <SubmitButton>Preview & Withdraw</SubmitButton>
    </form>
);

const UserSettingsView = () => {
  // *** Destructure updateProfilePicture correctly from useAuth ***
  const {
      username: currentUsername,
      email: currentEmail,
      profilePictureUrl: currentPicUrl,
      updateProfilePicture // <<< Ensure this is destructured
  } = useAuth();

  const [profilePicPreview, setProfilePicPreview] = useState(''); // Initialize empty
  const [profilePicFile, setProfilePicFile] = useState(null);
  const fileInputRef = useRef(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [detailsMessage, setDetailsMessage] = useState({ type: '', text: '' });
  const [picMessage, setPicMessage] = useState({ type: '', text: '' });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isPicLoading, setIsPicLoading] = useState(false);

  // Effect to sync local state with context/fetched data
  useEffect(() => {
      console.log("UserSettingsView: Syncing state from context.");
      setUsername(currentUsername || '');
      setEmail(currentEmail || '');
      setProfilePicPreview(currentPicUrl || '/default-avatar.png');
      // Reset file selection if context URL changes (e.g., after successful upload elsewhere)
      setProfilePicFile(null);
  }, [currentUsername, currentEmail, currentPicUrl]); // Dependencies ensure sync

  // --- Handlers ---
  const handleProfilePicChange = (event) => {
      const file = event.target.files[0];
      const FIVE_MB = 5 * 1024 * 1024;
      setPicMessage({ type: '', text: '' });
      setProfilePicFile(null); // Reset previous file selection

      if (file) {
          if (file.size > FIVE_MB) { setPicMessage({ type: 'error', text: 'File too large (Max 5MB).' }); return; }
          if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) { setPicMessage({ type: 'error', text: 'Invalid file type (PNG, JPG, GIF).' }); return; }

          setProfilePicFile(file); // Store the valid file

          // Generate local preview
          const reader = new FileReader();
          reader.onloadend = () => {
              setProfilePicPreview(reader.result); // Show preview from selected file
          };
          reader.readAsDataURL(file);
      } else {
           // If no file selected, revert preview to context URL or default
           setProfilePicPreview(currentPicUrl || '/default-avatar.png');
      }
       // Reset the input value so selecting the same file again triggers onChange
       if (event.target) event.target.value = null;
  };

  const handleProfilePicUpload = async (event) => {
      event.preventDefault();
      if (!profilePicFile) {
           setPicMessage({ type: 'info', text: 'Please select an image file first.' });
           return;
      };
      if (!updateProfilePicture) { // Defensive check for context function
           console.error("UserSettingsView Error: updateProfilePicture function not found in AuthContext.");
           setPicMessage({ type: 'error', text: 'An application error occurred.' });
           return;
      }

      setIsPicLoading(true); setPicMessage({ type: '', text: '' });
      console.log("Uploading profile picture:", profilePicFile.name);

      const formData = new FormData();
      formData.append('profileImage', profilePicFile);

      try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error("Auth token not found.");

          const response = await axios.post('http://localhost:5000/api/user/profile-picture', formData, { // Ensure endpoint is correct
              headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
          });

          if (response.data && response.data.newImageUrl) {
              const newUrl = response.data.newImageUrl;
              console.log("Upload successful, calling updateProfilePicture with:", newUrl);
              // *** Call the context update function ***
              updateProfilePicture(newUrl);
              // Local preview state will update via the useEffect hook when context changes
              setProfilePicFile(null); // Clear selected file
              setPicMessage({ type: 'success', text: response.data.message || 'Profile picture updated!' });
          } else {
              console.error("Invalid server response after upload:", response.data);
              throw new Error(response.data?.message || "Invalid server response.");
          }
      } catch (error) {
          console.error("Pic upload error:", error);
          // Provide more specific feedback if possible
          const errorMsg = error.response?.data?.message || error.message || 'Upload failed.';
          setPicMessage({ type: 'error', text: errorMsg });
          // Do NOT revert local preview here - let user see the error first
      } finally {
          setIsPicLoading(false);
      }
  };

  // --- (handleProfileDetailsSubmit and handlePasswordSubmit with API calls as before) ---
  const handleProfileDetailsSubmit = async (event) => { /* ... Implement API call ... */ };
  const handlePasswordSubmit = async (event) => { /* ... Implement API call ... */ };

  // --- Component Render ---
  return (
      <div className="space-y-10">
          <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">User Settings</h1>

          {/* Profile Picture Section */}
          <section aria-labelledby="profile-picture-heading" className="bg-white p-6 rounded-lg shadow border border-gray-200">
               <h2 id="profile-picture-heading" className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h2>
               <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
                  <img
                      src={profilePicPreview} // Always reflects current state (context or local file preview)
                      alt="Profile Preview"
                      onError={(e) => { e.target.onerror = null; e.target.src='/cat.jpg'}}
                      className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex flex-col space-y-2 w-full sm:w-auto items-center sm:items-start">
                      <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} accept="image/png, image/jpeg, image/gif" className="hidden"/>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"> Change Picture </button>
                      {/* Show Save button only when a NEW file is selected */}
                      {profilePicFile && (
                          <SubmitButton onClick={handleProfilePicUpload} type="button" disabled={isPicLoading} isLoading={isPicLoading}> Save Picture </SubmitButton>
                      )}
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB.</p>
                       {picMessage.text && (<p className={`text-sm mt-1 ${picMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}> {picMessage.text} </p>)}
                  </div>
              </div>
          </section>

            <section aria-labelledby="profile-details-heading" className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 id="profile-details-heading" className="text-xl font-semibold text-gray-800 mb-4">Profile Details</h2>
                <form onSubmit={handleProfileDetailsSubmit} className="space-y-4 max-w-lg">
                    <FormInput id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isDetailsLoading}/>
                    <FormInput id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isDetailsLoading}/>
                    {detailsMessage.text && (<p className={`text-sm ${detailsMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}> {detailsMessage.text} </p>)}
                    <SubmitButton isLoading={isDetailsLoading} disabled={isDetailsLoading}>Save Profile Changes</SubmitButton>
                </form>
            </section>
            <section aria-labelledby="change-password-heading" className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 id="change-password-heading" className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                    <FormInput id="currentPassword" label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isPasswordLoading}/>
                    <FormInput id="newPassword" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isPasswordLoading}/>
                    <FormInput id="confirmPassword" label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isPasswordLoading}/>
                    {passwordMessage.text && (<p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}> {passwordMessage.text} </p>)}
                    <SubmitButton isLoading={isPasswordLoading} disabled={isPasswordLoading}> {isPasswordLoading ? 'Requesting...' : 'Request Password Change'} </SubmitButton>
                    <p className="text-xs text-gray-500 mt-2"> For security, you'll receive an email to confirm this change. </p>
                </form>
            </section>
        </div>
    );
};

const ViewerDashboardView = () => {
  const { username, profilePictureUrl } = useAuth();
  // TODO: Fetch VIEWER dashboard data (balance, watch stats)
  const balance = 500.00; // Placeholder
  const videosWatchedTotal = 120; // Placeholder
  const videosToday = 20; // Placeholder
  const earningsToday = 50; // Placeholder
  const timeWatchedPercent = 75; // Placeholder
  const displayPic = profilePictureUrl || '/default-avatar.png';

  return (
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <img src={displayPic} alt="Profile" onError={(e) => { e.target.onerror = null; e.target.src='/default-avatar.png'}} className="w-16 h-16 rounded-full border-2 border-pink-300 shadow-sm object-cover bg-gray-100"/>
          <div>
             <h2 className="text-xl font-semibold text-gray-800">{username || 'User'}</h2>
             <p className="text-sm text-gray-500">Welcome back, Viewer!</p> {/* Specific title */}
          </div>
        </div>
        {/* Account Balance */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow-md text-white"> {/* Different color maybe */}
          <h3 className="text-sm font-medium uppercase tracking-wider mb-1">Your Earnings Balance</h3>
          <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
           <p className="text-xs mt-2 opacity-80">Withdrawals available above $5.00</p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <StatCard title="Total Videos Watched" value={videosWatchedTotal.toLocaleString()} icon={PlayCircleIcon}/> {/* Example Icon */}
           <StatCard title="Today: Videos | Earnings" value={`${videosToday} | $${earningsToday.toFixed(2)}`} icon={Banknote} />
        </div>
         {/* Time Watched */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center"><ClockIcon className="w-5 h-5 mr-2 text-indigo-500"/>Time Watched Today</h3>
            <ProgressBar value={timeWatchedPercent} label={`${(timeWatchedPercent/25).toFixed(1)} Hours / 4 Hours Goal`} />
        </div>
      </div>
    );
};

const WithdrawalView = () => {
    const [withdrawMethod, setWithdrawMethod] = useState('bank');
    return (
       <div className="space-y-8">
         <h2 className="text-2xl font-bold text-gray-900 border-b pb-3">Withdraw Funds</h2>
         <div> <label className="block text-sm font-medium text-gray-700 mb-2">Select Method</label> <div className="flex flex-wrap gap-3"> <button onClick={() => setWithdrawMethod('mpesa')} className={`px-6 py-3 rounded-md text-sm font-medium border T... ${withdrawMethod === 'mpesa' ? 'active' : 'inactive'} ...`}> Mpesa </button> <button onClick={() => setWithdrawMethod('bank')} className={`px-6 py-3 rounded-md text-sm font-medium border T... ${withdrawMethod === 'bank' ? 'active' : 'inactive'} ...`}> Bank </button> </div> </div>
         <div className="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-lg"> {withdrawMethod === 'mpesa' ? <MpesaForm /> : <BankForm />} </div>
       </div>
    );
};

const CreatorDashboardView = () => {
  const { username, profilePictureUrl } = useAuth();
  // TODO: Fetch CREATOR stats (views, subs, earnings *from their content*, promo balance link?)
  const viewsToday = 1234;
  const subsToday = 56;
  const avgWatchTime = "5m 12s";
  const engagement = "123 | 45";
  const viewsGoalProgress = 12;
  const subsGoalProgress = 5;
  const displayPic = profilePictureUrl || '/default-avatar.png'; // Or creator-specific default

  return (
  <div className="space-y-8">
     {/* Creator Header */}
     <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
      <img src={displayPic} alt="Creator Profile" onError={(e) => { e.target.onerror = null; e.target.src='/default-avatar.png'}} className="w-16 h-16 rounded-full border-2 border-pink-300 shadow-sm object-cover bg-gray-100"/>
      <div>
         <h2 className="text-xl font-semibold text-gray-800">{username || 'Creator'}</h2>
         <p className="text-sm text-gray-500">Your Creator Dashboard</p>
      </div>
    </div>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <StatCard title="Today's Video Views" value={viewsToday.toLocaleString()} icon={EyeIcon}/>
      <StatCard title="New Subscribers Today" value={`+${subsToday}`} icon={UsersIcon}/>
      <StatCard title="Average Watch Time" value={avgWatchTime} icon={ClockIcon}/>
      <StatCard title="Engagement (Likes | Comments)" value={engagement} icon={BarChartBig}/>
    </div>
    {/* Goals Section */}
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center"><TargetIcon className="w-5 h-5 mr-2 text-pink-600"/>Goals Progress</h3>
        <ProgressBar value={viewsGoalProgress} label={`Views Goal (${(viewsToday * 30).toLocaleString()} / 10,000 Est.)`} />
        <ProgressBar value={subsGoalProgress} label={`Subscribers Goal (${(subsToday * 30).toLocaleString()} / 1,000 Est.)`} />
    </div>
  </div>
);
}

  const CreatorSettings = () => {
    // TODO: Fetch current settings in useEffect and set initial state
    const [channelLink, setChannelLink] = useState('');
    const [viewsGoal, setViewsGoal] = useState('');
    const [subsGoal, setSubsGoal] = useState('');
    const [notifications, setNotifications] = useState('enable'); // Default value
    const [isLoading, setIsLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setSaveMessage({ type: '', text: ''});
        console.log("Saving Creator Settings:", { channelLink, viewsGoal, subsGoal, notifications });
        // --- TODO: Implement API call to save settings ---
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            // Assume success
            setSaveMessage({ type: 'success', text: 'Settings saved successfully!'});
        } catch (error) {
            console.error("Error saving settings:", error);
            setSaveMessage({ type: 'error', text: 'Failed to save settings.'});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Use max-width for better readability on large screens
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 pb-4 border-b border-gray-200">
                Creator Settings
            </h1>
            <p className="text-sm text-gray-500 mb-8">
                Manage your channel information, set goals for your promotions, and configure notification preferences.
            </p>

            {/* Use a card-like structure for the form */}
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">

                {/* Channel Link Section */}
                <div className="space-y-2">
                     <label htmlFor="channel-link" className="flex items-center text-lg font-semibold text-gray-700 mb-1">
                       <LinkIcon className="w-5 h-5 mr-2 text-pink-600" />
                       Your Channel
                     </label>
                     <p className="text-sm text-gray-500 mb-2">Link your primary YouTube channel to display on your profile.</p>
                    <FormInput
                        id="channel-link"
                        type="url" // Use type="url" for better semantics/validation
                        placeholder="https://youtube.com/c/YourChannel"
                        value={channelLink}
                        onChange={(e) => setChannelLink(e.target.value)}
                        // Add required if necessary
                    />
                </div>

                {/* Goals Section - using fieldset for grouping */}
                 <fieldset className="border-t border-gray-200 pt-6">
                    <legend className="flex items-center text-lg font-semibold text-gray-700 mb-1">
                      <TargetIcon className="w-5 h-5 mr-2 text-pink-600" />
                      Promotion Goals
                    </legend>
                    <p className="text-sm text-gray-500 mb-4">Set monthly goals for your video promotions (optional).</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            id="views-goal"
                            type="number"
                            label="Monthly Views Goal"
                            min="0"
                            placeholder="e.g., 10000"
                            value={viewsGoal}
                            onChange={(e) => setViewsGoal(e.target.value)}
                        />
                        <FormInput
                            id="subs-goal"
                            type="number"
                            label="Monthly Subscribers Goal"
                            min="0"
                            placeholder="e.g., 1000"
                            value={subsGoal}
                            onChange={(e) => setSubsGoal(e.target.value)}
                        />
                    </div>
                </fieldset>

                {/* Notifications Section */}
                 <div className="border-t border-gray-200 pt-6 space-y-2">
                     <label htmlFor="notifications" className="flex items-center text-lg font-semibold text-gray-700 mb-1">
                       <BellIcon className="w-5 h-5 mr-2 text-pink-600" />
                       Notifications
                     </label>
                      <p className="text-sm text-gray-500 mb-2">Choose how you want to be notified about campaign progress and milestones.</p>
                    <select
                        id="notifications"
                        value={notifications}
                        onChange={(e) => setNotifications(e.target.value)}
                        // Reuse FormInput's styling or create a dedicated Select component style
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-white appearance-none"
                    >
                        <option value="enable">Enable All Platform Notifications</option>
                        <option value="milestones">Campaign Milestones Only</option>
                        <option value="disable">Disable All Platform Notifications</option>
                    </select>
                </div>

                 {/* Save Button and Message Area */}
                 <div className="border-t border-gray-200 pt-6">
                      {saveMessage.text && (
                        <p className={`text-sm mb-4 text-center ${saveMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                          {saveMessage.text}
                        </p>
                      )}
                    <SubmitButton isLoading={isLoading} disabled={isLoading}>
                        <CheckCircleIcon className="w-5 h-5 mr-2 -ml-1"/> {/* Example icon */}
                        Save Settings
                    </SubmitButton>
                 </div>
            </form>
        </div>
    );
}

const CreatorBrokerageView = () => {
    // TODO: Fetch data
    const [promoBalance, setPromoBalance] = useState(0);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [campaigns, setCampaigns] = useState([]);
    const [newCampaignUrl, setNewCampaignUrl] = useState('');
    const [newCampaignBudget, setNewCampaignBudget] = useState('');
    const [isLoadingAddFunds, setIsLoadingAddFunds] = useState(false);
    const [isLoadingCreateCamp, setIsLoadingCreateCamp] = useState(false);
    const [messageAddFunds, setMessageAddFunds] = useState({ type: '', text: '' });
    const [messageCreateCamp, setMessageCreateCamp] = useState({ type: '', text: '' });
    const handleAddFunds = async (event) => { /* ... */ };
    const handleCreateCampaign = async (event) => { /* ... */ };

    return (
      <div className="space-y-10">
        <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Video Promotions</h1>
        <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
           <h2 className="text-xl font-semibold text-gray-800 mb-4">Funds</h2>
           <div className="flex flex-wrap items-center justify-between gap-4 mb-6"> <div> <p className="text-sm text-gray-500">Balance</p> <p className="text-3xl font-bold text-green-600">${promoBalance.toFixed(2)}</p> </div> <form onSubmit={handleAddFunds} className="flex items-center gap-2"> <FormInput id="add-funds" label="Add" type="number" placeholder="50.00" value={amountToAdd} onChange={(e) => setAmountToAdd(e.target.value)} min="1" step="0.01" className="w-32" labelClassName="sr-only"/> <SubmitButton type="submit" isLoading={isLoadingAddFunds} disabled={isLoadingAddFunds || !amountToAdd}> Add Funds </SubmitButton> </form> </div>
           {messageAddFunds.text && ( <p className={`text-sm mt-2 ${messageAddFunds.type === 'error' ? 'text-red-600' : 'text-green-600'}`}> {messageAddFunds.text} </p> )}
        </section>
        <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">New Promotion</h2>
          <form onSubmit={handleCreateCampaign} className="space-y-4 max-w-xl">
            <FormInput id="camp-url" label="YouTube URL/ID" value={newCampaignUrl} onChange={(e) => setNewCampaignUrl(e.target.value)} placeholder="https://..." required/>
            <FormInput id="camp-budget" label="Budget ($)" type="number" value={newCampaignBudget} onChange={(e) => setNewCampaignBudget(e.target.value)} placeholder={`Available: $${promoBalance.toFixed(2)}`} min="5" step="0.01" required/>
            <SubmitButton isLoading={isLoadingCreateCamp} disabled={isLoadingCreateCamp || !newCampaignUrl || !newCampaignBudget}> Create Campaign </SubmitButton>
             {messageCreateCamp.text && ( <p className={`text-sm mt-2 ${messageCreateCamp.type === 'error' ? 'text-red-600' : 'text-green-600'}`}> {messageCreateCamp.text} </p> )}
             <p className="text-xs text-gray-500 mt-1"> Budget deducted upon creation. </p>
          </form>
        </section>
        <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Campaigns</h2>
           <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"> <thead className="bg-gray-50"> <tr> <th>Video</th> <th>Status</th> <th>Budget/Spent</th> <th>Views</th> <th>Actions</th> </tr> </thead> <tbody className="bg-white divide-y divide-gray-200"> {campaigns.length === 0 ? ( <tr> <td colSpan="5" className="empty-table-msg">No campaigns.</td> </tr> ) : ( campaigns.map((c) => ( <tr key={c.id}> <td>{c.videoTitle}</td> <td>{c.status}</td> <td>${c.budget}/${c.spent}</td> <td>{c.views}</td> <td><button>Pause</button></td> </tr> )))} </tbody> </table> </div>
        </section>
      </div>
     );
};


// --- Main Account Page Component ---
const AccountPage = () => {
  const { role, isLoading, isAuthenticated } = useAuth();

  // Determine the 'main' dashboard view name based on role
  const mainDashboardView = role === 'creator' ? 'creator-dashboard' : 'viewer-dashboard';
  const [view, setView] = useState(mainDashboardView); // Default to the role-appropriate dashboard

  // Define view names accessible only to creators
  const creatorOnlyViews = ['creator-dashboard', 'creator-settings', 'creator-promotions'];
  // Define view names accessible only to viewers (excluding settings)
  const viewerOnlyViews = ['viewer-dashboard', 'withdrawal'];

  // --- Define Navigation Items ---
  const viewerNavigation = [
    { name: 'Dashboard', view: 'viewer-dashboard', icon: LayoutDashboard },
    { name: 'Withdrawal', view: 'withdrawal', icon: Banknote },
    { name: 'User Settings', view: 'user-settings', icon: UserCircle },
  ];
  const creatorNavigation = [
    { name: 'Creator Dashboard', view: 'creator-dashboard', icon: BarChartBig },
    { name: 'Video Promotions', view: 'creator-promotions', icon: Briefcase },
    { name: 'Creator Settings', view: 'creator-settings', icon: Settings },
    { name: 'User Settings', view: 'user-settings', icon: UserCircle }, // Creators also have user settings
  ];

  // Select the correct navigation based on role
  const navigation = isLoading || !isAuthenticated ? [] : (role === 'creator' ? creatorNavigation : viewerNavigation);

  // Effect to handle initial view setting and role changes
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        const defaultView = role === 'creator' ? 'creator-dashboard' : 'viewer-dashboard';
        // If current view is not in the allowed navigation for the role, reset to default
        if (!navigation.some(item => item.view === view)) {
            console.log(`View ${view} invalid for role ${role}, resetting to ${defaultView}`);
            setView(defaultView);
        }
    }
     // Reset if logged out
    if (!isAuthenticated && !isLoading) {
        setView('viewer-dashboard'); // Default to viewer dash view name conceptually
    }
  // Rerun when role or loading state changes (navigation changes automatically with role/loading)
  }, [role, view, isLoading, isAuthenticated, navigation]);

  // --- Render Loading / Not Authenticated States ---
  if (isLoading) return ( <div className="page-container"> <Header /> <div className="content-center">Loading...</div> </div> );
  if (!isAuthenticated) return ( <div className="page-container"> <Header /> <div className="content-center text-red-500">Please sign in.</div> </div> );

  // --- Render Main Account Page ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 overflow-hidden pt-4 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-7xl mx-auto border border-gray-200">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4 md:p-6">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} icon={item.icon} label={item.name} isActive={view === item.view} onClick={() => setView(item.view)} />
              ))}
              {role === 'viewer' && (
                <button className="mt-6 w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-gradient" onClick={() => alert('Redirect to Become Creator')}> Become Creator </button>
              )}
            </nav>
          </aside>
          {/* Main Content */}
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            {/* Render the correct dashboard based on role */}
            {role === 'viewer' && view === 'viewer-dashboard' && <ViewerDashboardView />}
            {role === 'creator' && view === 'creator-dashboard' && <CreatorDashboardView />}

            {/* Render other views */}
            {role === 'viewer' && view === 'withdrawal' && <WithdrawalView />}
            {view === 'user-settings' && <UserSettingsView />}
            {role === 'creator' && view === 'creator-settings' && <CreatorSettings />}
            {role === 'creator' && view === 'creator-promotions' && <CreatorBrokerageView />}

            {/* Optional: Add a more robust fallback/error message if view state is somehow invalid */}
            {/* { !navigation.some(item => item.view === view) && <div>Error: Invalid view selected.</div> } */}

          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;