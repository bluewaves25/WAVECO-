import React from 'react';

const WalletPopup = ({ showWalletPopup, setShowWalletPopup, walletBalance, walletAddress, isWalletLoading, handleWalletAction, recipient, setRecipient, amount, setAmount, transactionHistory, user }) => {
  return (
    showWalletPopup && walletAddress && (
      <div className="wallet-popup">
        <button className="wallet-close" onClick={() => setShowWalletPopup(false)}>
          ✖
        </button>
        <h3>Zest Wallet</h3>
        <p>Balance: {walletBalance} ZEST</p>
        <p>Address: {walletAddress.slice(0, 8)}...</p>
        <div className="wallet-actions">
          <button onClick={() => handleWalletAction('send')} disabled={isWalletLoading}>
            {isWalletLoading ? 'Processing...' : 'Send'}
          </button>
          <button onClick={() => handleWalletAction('deposit')} disabled={isWalletLoading}>
            {isWalletLoading ? 'Processing...' : 'Deposit'}
          </button>
          <button onClick={() => handleWalletAction('receive')} disabled={isWalletLoading}>
            {isWalletLoading ? 'Processing...' : 'Receive'}
          </button>
          <button onClick={() => handleWalletAction('withdraw')} disabled={isWalletLoading}>
            {isWalletLoading ? 'Processing...' : 'Withdraw'}
          </button>
          <button onClick={() => handleWalletAction('earn')} disabled={isWalletLoading}>
            {isWalletLoading ? 'Processing...' : 'Earn'}
          </button>
        </div>
        <div className="wallet-form">
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isWalletLoading}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            disabled={isWalletLoading}
          />
        </div>
        <div className="wallet-history">
          <h4>Transaction History</h4>
          {transactionHistory.length > 0 ? (
            <ul>
              {transactionHistory.slice(0, 5).map((tx) => (
                <li key={tx.id}>
                  {tx.from === user.uid ? 'Sent' : 'Received'} {tx.amount} ZEST
                  {tx.from === user.uid ? ' to ' : ' from '}
                  {tx.from === user.uid ? tx.to.slice(0, 8) : tx.from.slice(0, 8)}...
                  <br />
                  <small>{new Date(tx.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions yet</p>
          )}
        </div>
      </div>
    )
  );
};

export default WalletPopup;