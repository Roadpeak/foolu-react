import React, { useState, useRef, useEffect } from 'react';
import Header from './Header'; // Assuming Header component exists and is correctly imported
import { useAuth } from '../context/authContext'; // Assuming authContext.js is in ../context/
import { Briefcase, LayoutDashboard, Banknote, Settings, BarChartBig, UserCircle } from 'lucide-react'; // Ensure all needed icons are imported (Removed UserCog as it wasn't used)
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

const DashboardView = () => {
    const { username, profilePictureUrl } = useAuth();
    // TODO: Fetch dashboard data (balance, stats)
    const balance = 500.00; const videosWatchedTotal = 120; const videosToday = 20; const earningsToday = 50; const timeWatchedPercent = 75;
    const displayPic = profilePictureUrl || '/default-avatar.png';
    return (
        <div className="space-y-8">
          <div className="flex items-center space-x-4"> <img src={displayPic} alt="Profile" onError={(e) => { e.target.onerror = null; e.target.src='/default-avatar.png'}} className="w-16 h-16 rounded-full border-2 border-pink-300 shadow-sm object-cover bg-gray-100"/> <div> <h2 className="text-xl font-semibold text-gray-800">{username || 'User'}</h2> <p className="text-sm text-gray-500">Welcome back!</p> </div> </div>
          <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 rounded-lg shadow-md text-white"> <h3 className="text-sm font-medium uppercase tracking-wider mb-1">Account Balance</h3> <p className="text-3xl font-bold">${balance.toFixed(2)}</p> </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> <StatCard title="Total Videos Watched" value={videosWatchedTotal} icon={BarChartBig}/> <StatCard title="Today's Videos | Earnings" value={`${videosToday} | $${earningsToday.toFixed(2)}`} icon={Banknote} /> </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200"> <h3 className="text-lg font-semibold mb-3 text-gray-800">Time Watched Today</h3> <ProgressBar value={timeWatchedPercent} label={`${(timeWatchedPercent/25).toFixed(1)} Hours / 4 Hours Goal`} /> </div>
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

const CreatorDashboard = () => {
    // TODO: Fetch creator stats
    return (
    <div className="space-y-8">
       <div className="flex items-center space-x-4 pb-4 border-b border-gray-200"> <img src="/cat.jpg" alt="Creator Profile" className="w-16 h-16 rounded-full border-2 border-pink-300 shadow-sm"/> <div> <h2 className="text-xl font-semibold text-gray-800">Creator Name</h2> <p className="text-sm text-gray-500">Creator Stats</p> </div> </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> <StatCard title="Today Views" value="1,234" /> <StatCard title="New Subs Today" value="56" /> <StatCard title="Avg Watch Time" value="5m 12s" /> <StatCard title="Engagement" value="123 | 45" /> </div>
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6"> <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Goals</h3> <ProgressBar value={12} label="Views Goal (1k/10k)" /> <ProgressBar value={5} label="Subs Goal (56/1k)" /> </div>
    </div>
  );
  }

const CreatorSettings = () => {
    // TODO: Fetch settings & handle submit
    return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Creator Settings</h1>
      <form className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
        <div> <label htmlFor="channel-link" className="block text-sm font-medium text-gray-700 mb-1">Channel Link</label> <input id="channel-link" type="text" className="input-style" placeholder="https://..."/> </div>
        <fieldset> <legend className="block text-sm font-medium text-gray-700 mb-1">Goals</legend> <div className="space-y-3"> <div> <label htmlFor="views-goal" className="sr-only">Views</label> <input id="views-goal" type="number" min="0" className="input-style" placeholder="Monthly Views Goal"/> </div> <div> <label htmlFor="subs-goal" className="sr-only">Subs</label> <input id="subs-goal" type="number" min="0" className="input-style" placeholder="Monthly Subs Goal"/> </div> </div> </fieldset>
        <div> <label htmlFor="notifications" className="block text-sm font-medium text-gray-700 mb-1">Notifications</label> <select id="notifications" className="input-style bg-white"> <option>Enable</option> <option>Milestones</option> <option>Disable</option> </select> </div>
        <button type="submit" className="submit-button-style"> Save Settings </button> {/* Define shared styles */}
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
  const [view, setView] = useState('dashboard');
  const creatorViewNames = ['creator-dashboard', 'creator-settings', 'creator-promotions'];

  const baseNavigation = [ { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard }, { name: 'Withdrawal', view: 'withdrawal', icon: Banknote }, { name: 'User Settings', view: 'user-settings', icon: UserCircle }, ];
  const creatorNavigation = [ { name: 'Creator Dashboard', view: 'creator-dashboard', icon: BarChartBig }, { name: 'Creator Settings', view: 'creator-settings', icon: Settings }, { name: 'Video Promotions', view: 'creator-promotions', icon: Briefcase }, ];
  const navigation = isLoading || !isAuthenticated ? [] : [...baseNavigation, ...(role === 'creator' ? creatorNavigation : [])];

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        if (creatorViewNames.includes(view) && role !== 'creator') { setView('dashboard'); }
        else if (!navigation.some(item => item.view === view) && navigation.length > 0) { setView(navigation[0].view); }
    }
    if (!isAuthenticated && !isLoading) { setView('dashboard'); }
  }, [role, view, isLoading, isAuthenticated, navigation]);

  if (isLoading) return ( <div className="min-h-screen flex flex-col bg-gray-100"> <Header /> <div className="flex flex-1 justify-center items-center text-lg text-gray-600">Loading...</div> </div> );
  if (!isAuthenticated) return ( <div className="min-h-screen flex flex-col bg-gray-100"> <Header /> <div className="flex flex-1 justify-center items-center text-red-500">Please sign in.</div> </div> );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 overflow-hidden pt-4 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-7xl mx-auto border border-gray-200">
          <aside className="w-full md:w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4 md:p-6">
            <nav className="space-y-1">
              {navigation.map((item) => ( <NavItem key={item.name} icon={item.icon} label={item.name} isActive={view === item.view} onClick={() => setView(item.view)} /> ))}
              {role === 'viewer' && ( <button className="mt-6 w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-gradient" onClick={() => alert('Redirect')}> Become Creator </button> )} {/* Use reusable style */}
            </nav>
          </aside>
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            {view === 'dashboard' && <DashboardView />}
            {view === 'withdrawal' && <WithdrawalView />}
            {view === 'user-settings' && <UserSettingsView />}
            {role === 'creator' && view === 'creator-dashboard' && <CreatorDashboard />}
            {role === 'creator' && view === 'creator-settings' && <CreatorSettings />}
            {role === 'creator' && view === 'creator-promotions' && <CreatorBrokerageView />}
            {creatorViewNames.includes(view) && role !== 'creator' && ( <div className="access-denied-msg"> Access Denied. </div> )} {/* Use reusable style */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;