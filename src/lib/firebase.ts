'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  "projectId": "learnsense-ai-3x7be",
  "appId": "1:731268515924:web:efd25b77aa26088e4305c1",
  "storageBucket": "learnsense-ai-3x7be.firebasestorage.app",
  "apiKey": "AIzaSyCNk6wt_oDN3MElTBSROPtL2BZLgfYzULc",
  "authDomain": "learnsense-ai-3x7be.firebaseapp.com",
  "messagingSenderId": "731268515924"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
