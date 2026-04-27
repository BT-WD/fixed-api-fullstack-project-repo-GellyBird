// ------------------------- Imports -------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { collection, addDoc, updateDoc, serverTimestamp, increment, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { query, where, getDocs  } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"; // Will be used to get alltime scores
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"; // Will be used to update alltime scores

// ------------------------- Firebase Setup -------------------------
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

// ------------------------- Element Variables -------------------------
const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")
const userImageEl = document.getElementById("pfp")
const loginDiv = document.getElementById("userLogin")
const loginBlurEl = document.getElementById("blurForLogin")

const museumStatEl = document.getElementById("favMuseumText")
const bestCategoryEl = document.getElementById("bestCategoryText")
const bestStreakEl = document.getElementById("bestStreakText")

// ------------------------- localStorage -------------------------
if (sessionStorage.getItem("loggedIn") == null) {
    sessionStorage.setItem("loggedIn", "False")
}

console.log("Logged In: " + sessionStorage.getItem("loggedIn"))

// ------------------------- Event Listeners -------------------------
signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

// ------------------------- Functions -------------------------
function authSignInWithEmail() {
    console.log("Sign in with email and password")
    const email = emailInputEl.value;
    const password = passwordInputEl.value;
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        sessionStorage.setItem("loggedIn", "True")
        sessionStorage.setItem("user",JSON.stringify(user))
        updateStatDisplay(user)
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
        sessionStorage.setItem("loggedIn", "True")
        sessionStorage.setItem("user",JSON.stringify(user))
        updateStatDisplay(user)
    })
        .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("ERROR CODE: " + errorCode + " MESSAGE: " + errorMessage);
    });
}

function loginManager() {
    if (loginDiv.style.display=='') {
        loginDiv.style.display='flex'
        loginBlurEl.style.display='inline'
    } else {
        loginDiv.style.display=''
        loginBlurEl.style.display=''
    }
}

// ------------------------- Add Stats -------------------------
export async function addStatToDb(statName, stat, user) {
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

// ------------------------- Get Stats -------------------------
async function getIndvStatFromDb(statName, user) {
    const querySnapshot = await getDocs(query(collection(db,statName), where('uid','==',user.uid)));
    return querySnapshot;
}

async function getTopStatsFromDb(statName, user) {
    const querySnapshot = await getDocs(query(collection(db,statName), where('uid','==',user.uid), orderBy("statVal","desc"), limit(5)));
    return querySnapshot
}

// get stat values
export async function getIndvStatVal(statName, user) {
    const snapshot = await getIndvStatFromDb(statName,user);
    const vals = [];
        snapshot.forEach(async (doc) => {
                vals.push(doc.data('statVal')['statVal'])
        });
        return vals[0]
}

async function getTopStatvals(statName, user) {
    const snapshot = await getTopStatsFromDb(statName,user);
    const vals = [];
        snapshot.forEach(async (doc) => {
                vals.push(doc.data('statVal')['statVal'])
        });
        return vals;
}

// ------------------------- Update Stats -------------------------
// when increasing values by 1, just say "inc1" as the newval
export async function updateStatFromDb(statName,newVal,user) {
    const snapshot = await getIndvStatFromDb(statName,user);
   try {
        snapshot.forEach(async (doc) => {
            if (newVal == "inc1") {
                await updateDoc(doc.ref, {
                    statVal: increment(1)
                })
            } else {
                await updateDoc(doc.ref, {
                    statVal: newVal
                })
            }
        }); 
   } catch (error) {
       console.error(error.message)
   }
}

async function updateStatDisplay(user) {
    const bestCatOther = await getIndvStatVal("bestCatOther",user)
    const bestCatPainting = await getIndvStatVal("bestCatPainting",user)
    const bestCatSculpture = await getIndvStatVal("bestCatSculpture",user)

    const bestStreak = await getIndvStatVal("bestStreak",user)

    const favMuseumMet = await getIndvStatVal("favMuseumMet",user)
    const favMuseumVNA = await getIndvStatVal("favMuseumVNA",user)

    const userScores = await getTopStatvals("userScore",user)

    if (bestCatOther > bestCatPainting & bestCatOther > bestCatSculpture) {
        bestCategoryEl.innerHTML = "Other"
    } else if (bestCatPainting > bestCatOther & bestCatPainting > bestCatSculpture) {
        bestCategoryEl.innerHTML = "Painting"
    } else if (bestCatSculpture > bestCatOther & bestCatSculpture > bestCatPainting) {
        bestCategoryEl.innerHTML = "Sculpture"
    }

    if (bestStreak != null) {
        bestStreakEl.innerHTML = bestStreak
    }

    if (favMuseumMet > favMuseumVNA) {
        museumStatEl.innerHTML = "The MET"
    } else if (favMuseumMet < favMuseumVNA) {
        museumStatEl.innerHTML = "The V&A"
    }

    for (let i = 1; i < 6; i ++) {
        if (userScores[i - 1] != null) {
            document.getElementById("score"+i).innerHTML = ""+i+" - " + userScores[i-1] + " Points"
        } else {
            document.getElementById("score"+i).innerHTML = ""+i+" - NO SCORE"
        }
    }
}
// ------------------------- Testing -------------------------

// async function testAddStats(user) {
//     addStatToDb("favMuseumMet",2,user);
//     addStatToDb("favMuseumVNA",3,user);
//     addStatToDb("bestCatPainting",8,user);
//     addStatToDb("bestCatSculpture",2,user);
//     addStatToDb("bestCatOther",10,user);
//     addStatToDb("bestStreak",5,user);
//     addStatToDb("userScore",1,user);
//     addStatToDb("userScore",10,user);
//     addStatToDb("userScore",3,user);
// }

// async function testUpdateStats(user) {
//     await updateStatFromDb("favMuseumMet",'inc1',user);
//     console.log(await getIndvStatVal("favMuseumMet",user));
// }

// ------------------------- Main Code -------------------------
userImageEl.addEventListener("click",loginManager);

window.onload = function() {
    if (sessionStorage.getItem("loggedIn") == "True") {
        updateStatDisplay(JSON.parse(sessionStorage.getItem("user")))
    }
}