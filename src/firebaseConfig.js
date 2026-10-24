import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Unoda Expo app-la irukka athe config inga podu
const firebaseConfig = {
    apiKey: "AIzaSyBU9R2xrYjBPF2mla6JQ5LQX7xPatBpdHg",
    authDomain: "waterpurifierapp-b160d.firebaseapp.com",
    projectId: "waterpurifierapp-b160d",
    storageBucket: "waterpurifierapp-b160d.firebasestorage.app",
    messagingSenderId: "791528105272",
    appId: "1:791528105272:web:ab0ba79870ceeab6958dcd",
    measurementId: "G-K3T01NW5CE"
  };
  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);