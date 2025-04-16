import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocs, updateDoc, increment, addDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC14J4tdmLktm7QyTDoBOvyVDKEWnkptRA",
  authDomain: "waveco-df820.firebaseapp.com",
  projectId: "waveco-df820",
  storageBucket: "waveco-df820.firebasestorage.app",
  messagingSenderId: "751785780421",
  appId: "1:751785780421:web:c802769c8de92949613cac"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, doc, getDoc, getDocs, updateDoc, increment, addDoc, collection, query, orderBy, onSnapshot };
