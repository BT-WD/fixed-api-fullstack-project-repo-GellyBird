import { getIndvStatVal as getIndvStatVal } from "../index.js"

const artImg = document.getElementById("artImage")
// artImg.src="../global_assets/default_pfp.svg";

// ------------------------- Element Variables -------------------------

// copy over the updatestat and getstat functions from index.js as well as firestore setup

// this is a test, follow this format for dealing with data (json parse and async required)
window.onload = async function() {
    if (sessionStorage.getItem("loggedIn") == "True") {
        console.log(await getIndvStatVal("bestCatOther",JSON.parse(sessionStorage.getItem("user"))))
    }
}