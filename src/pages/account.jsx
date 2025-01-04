import React, { useState } from 'react';
import './account.css';
import Header from './Header';

function AccountPage() {
  const [view, setView] = useState('dashboard');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');

  return (
    <>
      <Header />
      <div className="App">
        <Sidebar setView={setView} />
        
        <div className="content">
          {view === 'withdrawal' ? (
            <Card>
              <div className='text'>
                <h2>Withdraw To</h2>
              </div>
              <hr className='divider' />
              <div className='buttons'>
                <button 
                  className={`withdraw-button ${withdrawMethod === 'mpesa' ? 'active' : ''}`}
                  onClick={() => setWithdrawMethod('mpesa')}>Mpesa
                </button>
                <button 
                  className={`withdraw-button ${withdrawMethod === 'bank' ? 'active' : ''}`}
                  onClick={() => setWithdrawMethod('bank')}>Bank Account
                </button>
              </div>
              <hr className='divider' />
              {withdrawMethod === 'mpesa' ? <MpesaForm /> : <BankForm />}
            </Card>
          ) : (
            <Card>
              <h2>Dashboard Content Goes Here</h2>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function MpesaForm() {
  return (
    <div className='withdrawal-form'>
      <form>
        <div className='form-group'>
          <label>Amount</label>
          <select className='input-field'>
            {[...Array(100).keys()].map(i => (i + 1) * 100).map(amount => (
              <option key={amount} value={amount}>{amount}</option>
            ))}
          </select>
        </div>
        <div className='form-group'>
          <label>Phone Number</label>
          <input type='text' className='input-field' placeholder='Enter Mpesa Number' />
        </div>
        <button className='submit-button'>Proceed with Mpesa</button>
      </form>
    </div>
  );
}

function BankForm() {
  return (
    <div className='withdrawal-form'>
      <form>
        <div className='form-group'>
          <label>Amount</label>
          <div className='input-group'>
          <select className='input-field'>
            {[...Array(100).keys()].map(i => (i + 1) * 100).map(amount => (
              <option key={amount} value={amount}>{amount}</option>
            ))}
          </select>
            <label>Ksh</label>
          </div>
        </div>
        <div className='form-group'>
          <label>Account Holder Name</label>
          <input type='text' placeholder='Dipu Poul' readOnly className='input-field' />
        </div>
        <div className='form-group'>
          <label>Card Number</label>
          <div className='input-group'>
            <input type='text' readOnly className='input-field' />
            <img src='/visa-logo.png' alt='Visa' className='card-logo' />
          </div>
        </div>
        <button className='submit-button'>Preview & Withdraw</button>
      </form>
    </div>
  );
}

function Sidebar({ setView }) {
  return (
    <div className="sidebar">
      <a href="#dashboard" onClick={() => setView('dashboard')}>Dashboard</a>
      <a href="#withdrawal" onClick={() => setView('withdrawal')}>Withdrawal</a>
    </div>
  );
}

function Card({ children }) {
  return <div className="card">{children}</div>;
}

export default AccountPage;
