import React, { useState } from 'react';
import Header from './Header';

const AccountPage = () => {
  const [view, setView] = useState('dashboard');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex bg-white shadow-lg rounded-lg overflow-hidden w-3/4 max-w-4xl">
          <div className="w-1/4 bg-red-500 text-white p-8">
            <a
              href="#dashboard"
              onClick={() => setView('dashboard')}
              className="block py-2 hover:underline"
            >
              Dashboard
            </a>
            <a
              href="#withdrawal"
              onClick={() => setView('withdrawal')}
              className="block py-2 hover:underline"
            >
              Withdrawal
            </a>
            <a
              href="#creator-dashboard"
              onClick={() => setView('creator-dashboard')}
              className="block py-2 hover:underline"
            >
              Creator Dashboard
            </a>
            <a
              href="#creator-settings"
              onClick={() => setView('creator-settings')}
              className="block py-2 hover:underline"
            >
               Creator Settings
            </a>
          </div>
          <div className="w-3/4 p-8">
              {view === 'dashboard' ? (
                <DashboardView />
              ) : view === 'withdrawal' ? (
                <WithdrawalView
                withdrawMethod={withdrawMethod}
                setWithdrawMethod={setWithdrawMethod}
            />
                ) : view === 'creator-dashboard' ? (
                  <CreatorDashboard />
                ) : view === 'creator-settings' ? (
                  <CreatorSettings />
                ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView = () => (
  <div>
    <div className="flex items-center space-x-4 mb-6">
      <img
        src="/cat.jpg"
        alt="Profile Picture"
        className="w-20 h-20 rounded-full border-4 border-pink-400"
      />
      <h2 className="text-2xl font-bold">Username</h2>
    </div>
    <div className="text-2xl font-bold mb-6">
      Account Balance: <span className="text-pink-500">$500.00</span>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-4 bg-gray-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold">Number of Videos Watched</h3>
        <p className="text-2xl font-bold">120</p>
      </div>
      <div className="p-4 bg-gray-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold">Today's Videos Watched & Earnings</h3>
        <p className="text-2xl font-bold">20 | $50</p>
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">Time Watched Today</h3>
      <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
        <div
          className="bg-pink-500 h-6 text-white text-center"
          style={{ width: '75%' }}
        >
          3 Hours
        </div>
      </div>
    </div>
  </div>
);

const CreatorDashboard = () => (
  <div>
    <div className="flex items-center space-x-4 mb-6">
      <img
        src="/cat.jpg"
        alt="Creator Profile"
        className="w-20 h-20 rounded-full border-4 border-pink-400"
      />
      <h2 className="text-2xl font-bold">Creator Name</h2>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-4 bg-gray-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold">Today's Views</h3>
        <p className="text-2xl font-bold">1,234</p>
      </div>
      <div className="p-4 bg-gray-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold">New Subscribers</h3>
        <p className="text-2xl font-bold">56</p>
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">Views Goal Progress</h3>
      <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden mb-4">
        <div
          className="bg-pink-500 h-6 text-white text-center"
          style={{ width: '12%' }}
        >
          12% Achieved
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">Subscribers Goal Progress</h3>
      <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
        <div
          className="bg-pink-500 h-6 text-white text-center"
          style={{ width: '5%' }}
        >
          5% Achieved
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="p-4 bg-gray-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold">Average Watch Time</h3>
        <p className="text-2xl font-bold">5 minutes</p>
      </div>
      <div className="p-4 bg-gray-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold">Engagement</h3>
        <p className="text-2xl font-bold">Likes: 123 | Comments: 45</p>
      </div>
    </div>
  </div>
);


const CreatorSettings = () => (
<div>
  <h1 className="text-2xl font-bold text-gray-800 mb-6">Creator Settings</h1>
  <form className="space-y-4">
    <div>
      <label className="block text-gray-600">Channel</label>
      <input
        type="text"
        className="w-full p-3 border border-gray-300 rounded"
        placeholder="Link to Your Channel"
      />
    </div>
    <div>
      <label className="block text-gray-600">Set Goals</label>
      <div className="space-y-2">
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded"
          placeholder="Views Goal"
        />
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded"
          placeholder="Subscribers Goal"
        />
      </div>
    </div>
    <div>
      <label className="block text-gray-600">Notifications</label>
      <select className="w-full p-3 border border-gray-300 rounded">
        <option>Enable</option>
        <option>Disable</option>
      </select>
    </div>
    <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-pink-600">
      Save Settings
    </button>
  </form>
</div>
);

const WithdrawalView = ({ withdrawMethod, setWithdrawMethod }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Withdraw To</h2>
    <div className="flex justify-start mb-4 space-x-4">
      <button
        className={`w-40 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 ${withdrawMethod === 'mpesa' ? 'ring-2 ring-pink-400' : ''}`}
        onClick={() => setWithdrawMethod('mpesa')}
      >
        Mpesa
      </button>
      <button
        className={`w-40 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 ${withdrawMethod === 'bank' ? 'ring-2 ring-pink-400' : ''}`}
        onClick={() => setWithdrawMethod('bank')}
      >
        Bank
      </button>
    </div>
    {withdrawMethod === 'mpesa' ? <MpesaForm /> : <BankForm />}
  </div>
);

const MpesaForm = () => (
  <form className="space-y-4">
    <div>
      <label className="block text-gray-600">Amount</label>
      <input type="number" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400" />
    </div>
    <div>
      <label className="block text-gray-600">Phone Number</label>
      <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400" />
    </div>
    <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-pink-600 focus:ring-2 focus:ring-pink-400">
      Proceed with Mpesa
    </button>
  </form>
);

const BankForm = () => (
  <form className="space-y-4">
    <div>
      <label className="block text-gray-600">Amount</label>
      <input type="number" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400" />
    </div>
    <div>
      <label className="block text-gray-600">Account Holder Name</label>
      <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400" value="Dipu Poul" readOnly />
    </div>
    <div>
      <label className="block text-gray-600">Card Number</label>
      <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400" readOnly />
    </div>
    <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-pink-600 focus:ring-2 focus:ring-pink-400">
      Preview & Withdraw
    </button>
  </form>
);

export default AccountPage;
