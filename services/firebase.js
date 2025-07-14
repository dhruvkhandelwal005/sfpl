// services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBH37YlNexzD3rwXL_J_UAH5X3agoN21GA",
  authDomain: "sfpl-7b77a.firebaseapp.com",
  projectId: "sfpl-7b77a",
  storageBucket: "sfpl-7b77a.firebasestorage.app",
  messagingSenderId: "866774532540",
  appId: "1:866774532540:web:169806b7eaded8745c6bb9",
  measurementId: "G-WWMGF2XJW0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
