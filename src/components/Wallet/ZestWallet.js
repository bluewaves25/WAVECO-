// src/components/Wallet/ZestWallet.js
import React, { useState, useEffect } from 'react';
import { FaWallet } from 'react-icons/fa';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, addDoc, collection, getDocs, increment } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import '../../styles/Dashboard.css';

const ZestWallet = ({ user, walletExpanded, setWalletExpanded }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user || !user.uid) return;
      try {
        const walletDoc = await getDoc(doc(db, 'wallets', user.uid));
        if (walletDoc.exists()) {
          const walletData = walletDoc.data();
          setWalletBalance(walletData.balance || 0);
          setWalletAddress(walletData.address || '');
        }

        const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
        setTransactions(transactionsSnapshot.docs
          .map(doc => doc.data())
          .filter(t => t.from === user.uid || t.to === user.uid)
        );

        const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
        setPurchases(purchasesSnapshot.docs
          .map(doc => doc.data())
          .filter(p => p.userId === user.uid)
        );

        const assetsSnapshot = await getDocs(collection(db, 'users', user.uid, 'assets'));
        setAssets(assetsSnapshot.docs.map(doc => doc.data().name));
      } catch (error) {
        console.error('Wallet fetch error:', error.message);
      }
    };
    fetchWalletData();
  }, [user]);

  const handleZestTransaction = async () => {
    if (!user || !recipient || !amount || amount <= 0) {
      alert('Invalid recipient or amount');
      return;
    }
    try {
      const parsedAmount = parseFloat(amount);
      if (parsedAmount > walletBalance) {
        alert('Insufficient balance');
        return;
      }

      const supplyDoc = await getDoc(doc(db, 'zestSupply', 'global'));
      const currentSupply = supplyDoc.exists() ? supplyDoc.data().total : 0;
      if (currentSupply + parsedAmount > 21000000) {
        alert('Transaction exceeds total ZEST supply of 21M');
        return;
      }

      const recipientDoc = await getDoc(doc(db, 'wallets', recipient));
      if (!recipientDoc.exists()) {
        alert('Recipient wallet does not exist');
        return;
      }

      const senderWallet = await getDoc(doc(db, 'wallets', user.uid));
      const nonce = senderWallet.data().nonce || 0;

      const transactionData = {
        from: user.uid,
        to: recipient,
        amount: parsedAmount,
        timestamp: new Date().toISOString(),
        nonce: nonce + 1,
        signature: CryptoJS.SHA256(`${user.uid}_${recipient}_${parsedAmount}_${nonce + 1}`).toString()
      };

      const isValidSignature = CryptoJS.SHA256(`${user.uid}_${recipient}_${parsedAmount}_${transactionData.nonce}`).toString() === transactionData.signature;
      if (!isValidSignature) {
        alert('Invalid transaction signature');
        return;
      }

      await Promise.all([
        addDoc(collection(db, 'transactions'), transactionData),
        updateDoc(doc(db, 'wallets', user.uid), { balance: walletBalance - parsedAmount, nonce: increment(1) }),
        updateDoc(doc(db, 'wallets', recipient), { balance: increment(parsedAmount) }),
        updateDoc(doc(db, 'zestSupply', 'global'), { total: increment(parsedAmount) }, { merge: true })
      ]);

      setWalletBalance(prev => prev - parsedAmount);
      setTransactions(prev => [...prev, transactionData]);
      setRecipient('');
      setAmount('');
      alert('Transaction successful');
    } catch (error) {
      console.error('Transaction error:', error.message);
      alert('Transaction failed');
    }
  };

  const handleZestPurchase = async (item) => {
    if (!user || !item.price || item.price > walletBalance) {
      alert('Insufficient balance or invalid item');
      return;
    }
    try {
      const supplyDoc = await getDoc(doc(db, 'zestSupply', 'global'));
      const currentSupply = supplyDoc.exists() ? supplyDoc.data().total : 0;
      if (currentSupply + item.price > 21000000) {
        alert('Purchase exceeds total ZEST supply of 21M');
        return;
      }

      const purchase = {
        userId: user.uid,
        item: item.name,
        price: item.price,
        timestamp: new Date().toISOString()
      };
      await Promise.all([
        addDoc(collection(db, 'purchases'), purchase),
        updateDoc(doc(db, 'wallets', user.uid), { balance: walletBalance - item.price }),
        updateDoc(doc(db, 'zestSupply', 'global'), { total: increment(item.price) }, { merge: true }),
        addDoc(collection(db, 'users', user.uid, 'assets'), { name: item.name })
      ]);

      setWalletBalance(prev => prev - item.price);
      setPurchases(prev => [...prev, purchase]);
      setAssets(prev => [...prev, item.name]);
      alert('Purchase successful');
    } catch (error) {
      console.error('Purchase error:', error.message);
      alert('Purchase failed');
    }
  };

  return (
    <div className="info-item" onClick={() => setWalletExpanded(!walletExpanded)}>
      <FaWallet className="icon" />
      {walletExpanded && (
        <div className="detail prominent zest-wallet">
          <span>{walletBalance} ZEST</span>
          <p className="zest-address">Address: {walletAddress}</p>
          <div className="zest-transaction-form">
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="zest-transaction-input"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="zest-transaction-input"
            />
            <button className="zest-transaction-btn" onClick={handleZestTransaction}>Send</button>
          </div>
          <div className="zest-purchase">
            <h4>Marketplace</h4>
            {[
              { name: 'Virtual Land', price: 100 },
              { name: 'Event Ticket', price: 50 },
              { name: 'Premium Avatar', price: 200 }
            ].map((item, index) => (
              <div key={index} className="zest-purchase-item">
                <span className="zest-purchase-name">{item.name}</span>
                <span className="zest-purchase-price">{item.price} ZEST</span>
                <button className="zest-purchase-btn" onClick={() => handleZestPurchase(item)}>Buy</button>
              </div>
            ))}
          </div>
          <div className="zest-transaction">
            <h4>Recent Transactions</h4>
            {transactions.slice(0, 5).map((t, index) => (
              <div key={index} className="zest-transaction-item">
                <span className="zest-transaction-amount">{t.amount} ZEST {t.from === user.uid ? 'to' : 'from'} {t.to}</span>
                <span className="zest-transaction-date">{new Date(t.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZestWallet;