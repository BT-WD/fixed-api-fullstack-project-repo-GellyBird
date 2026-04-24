/* === Imports === */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { updateDoc, serverTimestamp } from "https:https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { collection, query, where, getDocs  } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"; // Will be used to get alltime scores
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"; // Will be used to update alltime scores
import { use } from "react";

/* === Firebase Setup === */
  // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOLpLYaV-PefGH44HSxdtr2Y4NUQoCuHg",
  authDomain: "museumguesserapiproject.firebaseapp.com",
  projectId: "museumguesserapiproject",
  storageBucket: "museumguesserapiproject.firebasestorage.app",
  messagingSenderId: "535077651455",
  appId: "1:535077651455:web:d510c393292ca0f1f21dca"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Element Variables
const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")
const userImageEl = document.getElementById("userImg")

const museumStatEl = document.getElementById("favMuseumText")
const bestCategoryEl = document.getElementById("bestCategoryText")
const bestStreakEl = document.getElementById("bestStreakText")

// Variables
if (localStorage.getItem("loggedIn") == null) {
    localStorage.setItem("loggedIn", "False")
}
let loggedInStatus = localStorage.getItem("loggedIn");

// Event Listeners
signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

// Functions
function authSignInWithEmail() {
    console.log("Sign in with email and password")
    const email = emailInputEl.value;
    const password = passwordInputEl.value;
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("ERROR CODE: " + errorCode + " MESSAGE: " + errorMessage);
    });

}

function authCreateAccountWithEmail() {
    console.log("Sign up with email and password")
    const email = emailInputEl.value;
    const password = passwordInputEl.value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        showLoggedInView()
    })
        .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("ERROR CODE: " + errorCode + " MESSAGE: " + errorMessage);
    });
}

// Should work with all stats 
async function addStatToDb(statName, stat, user) {
   try {
       const docRef = await addDoc(collection(db, statName), {
           statVal: stat,
           uid: user.uid,
       })
       console.log("Document written with ID: ", docRef.id)
   } catch (error) {
       console.error(error.message)
   }
}

async function getIndvStatFromDb(statName, user) {
    const querySnapshot = await getDocs(query(collection(db,statName), where('uid','==',user)));
    return querySnapshot;
}

async function getTopStatsFromDb(statName, user) {
    const querySnapshot = await getDocs(query(collection(db,statName), where('uid','==',user)));
    let topFive = [];
    for (let i = 0; i < 5; i ++) {
        
    }
}
