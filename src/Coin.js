import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import '../styles/Profile.css';

const Coin = () => {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const walletRef = doc(db, 'wallets', user.uid);
    const unsubscribe = onSnapshot(walletRef, async (docSnap) => {
      if (!docSnap.exists()) {
        const newAddress = `zest_${Math.random().toString(36).slice(2)}`;
        await setDoc(walletRef, {
          address: newAddress,
          balance: 100,
          createdAt: new Date(),
        });
        setAddress(newAddress);
        setBalance(100);
      } else {
        const data = docSnap.data();
        setAddress(data.address);
        setBalance(data.balance);
      }
    });

    const q = query(
      collection(db, 'transactions'),
      where('from', '==', user.uid)
    );
    const unsubscribeTx = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
    });

    return () => {
      unsubscribe();
      unsubscribeTx();
    };
  }, [user]);

  const sendZest = async (e) => {
    e.preventDefault();
    if (!recipient || !amount || amount <= 0) {
      setError('Invalid recipient or amount');
      return;
    }
    if (amount > balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      const walletsSnap = await getDocs(collection(db, 'wallets'));
      const recipientWallet = walletsSnap.docs.find(doc => doc.data().address === recipient);

      if (!recipientWallet) {
        setError('Recipient not found');
        return;
      }

      const senderRef = doc(db, 'wallets', user.uid);
      const recipientRef = doc(db, 'wallets', recipientWallet.id);
      await updateDoc(senderRef, { balance: balance - Number(amount) });
      await updateDoc(recipientRef, { balance: recipientWallet.data().balance + Number(amount) });

      await addDoc(collection(db, 'transactions'), {
        from: user.uid,
        to: recipientWallet.id,
        amount: Number(amount),
        timestamp: new Date(),
      });

      setRecipient('');
      setAmount('');
      setError('');
    } catch (err) {
      setError('Transaction failed: ' + err.message);
    }
  };

  const purchases = [
    { name: 'Profile Boost', price: 50, id: 'boost' },
    { name: 'Premium Chat', price: 30, id: 'chat' },
  ];

  const buyItem = async (item) => {
    if (balance < item.price) {
      setError('Insufficient balance for purchase');
      return;
    }

    try {
      const walletRef = doc(db, 'wallets', user.uid);
      await updateDoc(walletRef, { balance: balance - item.price });

      await addDoc(collection(db, 'purchases'), {
        userId: user.uid,
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        timestamp: new Date(),
      });

      setError('');
      alert(`Purchased ${item.name}!`);
    } catch (err) {
      setError('Purchase failed: ' + err.message);
    }
  };

  return (
    <div className="zest-wallet">
      <h3>Zest Wallet</h3>
      <div className="zest-balance">{balance} ZEST</div>
      <div className="zest-address">{address}</div>
      <form className="zest-transaction-form" onSubmit={sendZest}>
        <input
          type="text"
          className="zest-transaction-input"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          className="zest-transaction-input"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="zest-transaction-btn" type="submit">Send</button>
      </form>
      {error && <p style={{ color: '#ff4d4d' }}>{error}</p>}
      <div className="zest-purchase">
        <h4>In-App Purchases</h4>
        {purchases.map((item) => (
          <div className="zest-purchase-item" key={item.id}>
            <span className="zest-purchase-name">{item.name}</span>
            <span className="zest-purchase-price">{item.price} ZEST</span>
            <button className="zest-purchase-btn" onClick={() => buyItem(item)}>Buy</button>
          </div>
        ))}
      </div>
      <div>
        <h4>Transactions</h4>
        {transactions.map((tx) => (
          <div className="zest-transaction" key={tx.id}>
            <span className="zest-transaction-amount">{tx.amount} ZEST to {tx.to}</span>
            <span className="zest-transaction-date">
              {new Date(tx.timestamp.toDate()).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coin;