import { addStatToDb as addStatToDb, updateStatFromDb as updateStatFromDb } from "../index.js"

// ------------------------- Variables -------------------------
const metBaseUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects"
const vnaBaseUrl = "https://api.vam.ac.uk/v2/objects/search"

const artImg = document.getElementById("artImage")


// ------------------------- MET Art -------------------------
// Selects a random piece ID from the list of MET art
const getRandomMetID = async () => {
    let randomPieceIndex = Math.floor(Math.random() * (501232)); // Index in the JSON list
    try {
        let response = await fetch(metBaseUrl)
        if (response.ok) {
            let jsonResponse = await response.json()
            let pieceSelected = await jsonResponse.objectIDs[randomPieceIndex]
            console.log("Selected Piece ID: " + pieceSelected)
            return pieceSelected;
        }
    }
    catch (error) {
        console.log(error)
    }
}

// Returns all information of the randomly selected piece
const getMetInfo = async () => {
    let randomMetId = await getRandomMetID()
    try {
        let response = await fetch(metBaseUrl+"/"+randomMetId)
        if (response.ok) {
            let jsonResponse = await response.json()
            return [(await jsonResponse.title),await jsonResponse.objectDate,await jsonResponse.artistDisplayName, await jsonResponse.classification, await jsonResponse.primaryImage]
        }
    }
    catch (error) {
        console.log(error)
    }
}

// this is a test, follow this format for dealing with the database (json parse and async required)
// window.onload = async function() {
//     if (sessionStorage.getItem("loggedIn") == "True") {
//         console.log(await getIndvStatVal("bestCatOther",JSON.parse(sessionStorage.getItem("user"))))
//     }
// }

window.onload = async function () {
    let metInfo = await getMetInfo()
    while ( metInfo[4] == "") {
        console.log("No Image For: " + metInfo[0])
        metInfo = await getMetInfo()
    }
    console.log("Piece Selected: " + metInfo[0])
}