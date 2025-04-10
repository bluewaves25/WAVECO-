import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCt98vHVRiQS1h-GWKfklN2TyM1PsNpDAM",
  authDomain: "waveco-bluewaves.firebaseapp.com",
  projectId: "waveco-bluewaves",
  storageBucket: "waveco-bluewaves.appspot.com",
  messagingSenderId: "797425086005",
  appId: "1:797425086005:web:ae1a35fc83c6157747cb7c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };