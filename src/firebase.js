import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

console.log("🔥 ENV CHECK", process.env.REACT_APP_FIREBASE_API_KEY); // Must NOT be undefined

const firebaseConfig = {
  apiKey: "AIzaSyDEjGXl3VEvTZ_QfEXckDu0kHc796PmQg4",
  authDomain: "routine-server-ict.firebaseapp.com",
  projectId: "routine-server-ict",
  storageBucket: "routine-server-ict.firebasestorage.app",
  messagingSenderId: "685936903766",
  appId: "1:685936903766:web:57705bbb6cada791dd9df7"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
