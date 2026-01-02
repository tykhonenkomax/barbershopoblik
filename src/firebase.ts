// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAn8VsZcBe9_0Y97EyZVnfZFnGHXLtpvsw",
    authDomain: "barbershop-oblik.firebaseapp.com",
    projectId: "barbershop-oblik",
    storageBucket: "barbershop-oblik.firebasestorage.app",
    messagingSenderId: "1065653660758",
    appId: "1:1065653660758:web:0eb69b6168876ce63adff7",
    measurementId: "G-2DC8GGJQBE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
