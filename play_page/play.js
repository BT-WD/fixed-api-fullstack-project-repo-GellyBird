import { addStatToDb as addStatToDb, updateStatFromDb as updateStatFromDb, getIndvStatVal as getIndvStatVal } from "../index.js"

// ------------------------- Variables -------------------------
const metBaseUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects"
const vnaBaseUrl = "https://api.vam.ac.uk/v2/objects/search"

const artImg = document.getElementById("artImage")
const museumSelectionEl = document.getElementById("museumSelect")
const pickPieceButton = document.getElementById("selectPieceButton")
const attributionBox = document.getElementById("attribution")
const streakEl = document.getElementById("currentStreak")
const scoreEl = document.getElementById("score")
const piecesLeftEl = document.getElementById("remainingPieces")

let title = ""
let date = ""
let artist = ""
let category = ""
let museum = ""

let score = 0
let piecesLeft = 10
let currentStreakVal = 0
let bestStreakVal = 0

const vnaSearchOptions = ["sculpture","painting","other"]

// ------------------------- MET Art -------------------------
// Selects a random piece ID from the list of MET art
const getRandomMetID = async () => {
    let searchHalf = Math.random(Math.random() * 2)
    let randomPieceIndex = 0
    if (searchHalf == 1) {
            randomPieceIndex = Math.round(Math.random() * (250616)); // Index in the JSON list
    } else {
            randomPieceIndex = Math.round(Math.random() * (250616)) + 250616; // Index in the JSON list
    }
    try {
        let response = await fetch(metBaseUrl)
        if (response.ok) {
            let jsonResponse = await response.json()
            let pieceSelected = await jsonResponse.objectIDs[randomPieceIndex]
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

// Sets the game up if the MET is selected
const handleMetSelection = async () => {
    let metInfo = await getMetInfo()
    while ( metInfo[4] == "") {
        console.log("No Image For: " + metInfo[0])
        metInfo = await getMetInfo()
    }
    console.log("Piece Selected: " + metInfo[0])
    artImg.src = metInfo[4]
    title = metInfo[0]
    date = metInfo[1]
    artist = metInfo[2]
    if (metInfo[3].toLowerCase() != "painting" || metInfo[3].toLowerCase() != "sculpture") {
        category = "other"
    } else {
        category = metInfo[3]
    }
    console.log(title + " " + date + " " + artist + " " + category)
}

// ------------------------- VNA Art -------------------------
const getRandomVNAPiece = async () => {
    category = vnaSearchOptions[Math.round(Math.random() * 3)]
    let page = Math.round(Math.random() * 50)
    try {
        if (category == "other") {
            let response = await fetch(vnaBaseUrl+"?q_object_type=-sculpture&q_object_type=-painting&page="+page)
            if (response.ok) {
                let jsonResponse = await response.json()
                return (await jsonResponse.records[Math.round(Math.random() * (await jsonResponse.info.page_size - 1))]);
            }
        } else {
            let response = await fetch(vnaBaseUrl+"?q_object_type="+category+"&page="+page)
            if (response.ok) {
                let jsonResponse = await response.json()
                return (await jsonResponse.records[Math.round(Math.random() * (await jsonResponse.info.page_size - 1))]);
            }
        }
    } catch (error) {
        console.log(error)
    }
}

// Not entirely needed, just here to make formatting easier.
const getVNAInfo = async () => {
    let piece = await getRandomVNAPiece()
    let stringPiece = JSON.stringify(piece)
    if (stringPiece != undefined && stringPiece.includes("_images") && stringPiece.includes("_primary_thumbnail")) {
        return [await piece._primaryTitle,await piece._primaryDate,await piece._primaryMaker.name, await piece._images._primary_thumbnail]
    } else if (stringPiece != undefined) {
        return [await piece._primaryTitle,await piece._primaryDate,await piece._primaryMaker.name, ""]
    } else {
        return ["","","",""]
    }
}

const handleVNASelection = async () => {
    let VNAInfo = await getVNAInfo()
    while ( VNAInfo[3] == "") {
        console.log("No Image For: " + VNAInfo[0])
        VNAInfo = await getVNAInfo()
    }
    console.log("Piece Selected: " + VNAInfo[0])
    artImg.src = VNAInfo[3]
    title = VNAInfo[0]
    date = VNAInfo[1]
    artist = VNAInfo[2]
    console.log(title + " " + date + " " + artist + " " + category)
}

// ------------------------- Game -------------------------
const reset = async () => {
    if (sessionStorage.getItem("loggedIn") == "True") {
        await addStatToDb("userScore",score,JSON.parse(sessionStorage.getItem("user")))
        if (await getIndvStatVal("bestStreak"),JSON.parse(sessionStorage.getItem("user")) < bestStreakVal) {
            await updateStatFromDb("bestStreak",bestStreakVal,JSON.parse(sessionStorage.getItem("user")))
        }
    }
    artImg.src = "../global_assets/Empty-frame.png"
    scoreEl.innerHTML = "Score: 0/10 correct"
    piecesLeftEl.innerHTML = "Pieces Left: 10/10"
    streakEl.innerHTML = "Current Streak: "+currentStreakVal
    piecesLeft = 10
    score = 0
    bestStreakVal = 0
    title = ""
    date = ""
    artist = ""
    category = ""
}

const roundHandler = async () => {
    if ((piecesLeft - 1) == -1) {
        reset()
    } else {
        pickPieceButton.removeEventListener("click",roundHandler)
        museum = museumSelectionEl.value //met,nan,vna
        if (museum == "met") {
            await handleMetSelection()
        } else if (museum == "vna") {
            await handleVNASelection()
        } else {
            let selection = Math.round(Math.random() * 2)
            if (selection == 1) {
                await handleMetSelection()
                museum = "met"
            } else {
                await handleVNASelection()
                museum = "vna"
            }
        }
        console.log(museum)
        piecesLeft --;
        piecesLeftEl.innerHTML = "Pieces Left: "+piecesLeft+"/10"  
    }
}

const checkPoints = () => {
    let points = 0
    if (title != undefined && attributionBox.value.toLowerCase().includes(title.toLowerCase())) {
        points++;
    } else if (title == undefined && attributionBox.value.toLowerCase() == "unknown") {
        points ++;
    }
    if (date != undefined && attributionBox.value.toLowerCase().includes(date.toLowerCase())) {
        points++;
        if (points >= 2) {
            score ++;
            scoreEl.innerHTML = "Score: "+score+"/10 correct"
            currentStreakVal ++;
            streakEl.innerHTML = "Current Streak: "+currentStreakVal
            return points;
        } 
    } else if (date == undefined && attributionBox.value.toLowerCase() == "unknown") {
        if (points >= 2) {
            score ++;
            scoreEl.innerHTML = "Score: "+score+"/10 correct"
            currentStreakVal ++;
            streakEl.innerHTML = "Current Streak: "+currentStreakVal
            return points;
        } 
    }
    if (artist != undefined && attributionBox.value.toLowerCase().includes(artist.toLowerCase())) {
        points++;
        if (points >= 2) {
            score ++;
            scoreEl.innerHTML = "Score: "+score+"/10 correct"
            currentStreakVal ++;
            streakEl.innerHTML = "Current Streak: "+currentStreakVal
            return points;
        }
    } else if (artist == undefined && attributionBox.value.toLowerCase() == "unknown") {
        if (points >= 2) {
            score ++;
            scoreEl.innerHTML = "Score: "+score+"/10 correct"
            currentStreakVal ++;
            streakEl.innerHTML = "Current Streak: "+currentStreakVal
            return points;
        } 
    }
    pickPieceButton.addEventListener("click",roundHandler) 
    return points;
}

// this is a test, follow this format for dealing with the database (json parse and async required)
// window.onload = async function() {
//     if (sessionStorage.getItem("loggedIn") == "True") {
//         console.log(await getIndvStatVal("bestCatOther",JSON.parse(sessionStorage.getItem("user"))))
//     }
// }

//userImageEl.addEventListener("click",loginManager);
// ------------------------- Main Logic -------------------------
pickPieceButton.addEventListener("click",roundHandler)
attributionBox.addEventListener("keypress",async function(e) {
    if (e.key == "Enter") {
        let pointsGained = await checkPoints()
        if (pointsGained >= 2) {
            if (sessionStorage.getItem("loggedIn") == "True") {
                if (category == "other") {
                    await updateStatFromDb("bestCatOther","inc1",JSON.parse(sessionStorage.getItem("user")))
                } else if (category == "sculpture") {
                    await updateStatFromDb("bestCatSculpture","inc1",JSON.parse(sessionStorage.getItem("user")))
                } else {
                    await updateStatFromDb("bestCatPainting","inc1",JSON.parse(sessionStorage.getItem("user"))) 
                }
                if (museum == "met") {
                    await updateStatFromDb("favMuseumMet","inc1",JSON.parse(sessionStorage.getItem("user")))
                } else {
                    await updateStatFromDb("favMuseumVNA","inc1",JSON.parse(sessionStorage.getItem("user")))
                }
            } 
            console.log("pass")
        } else {
            if (currentStreakVal > bestStreakVal) {
                bestStreakVal = currentStreakVal;
            } else {
                currentStreakVal = 0;
                streakEl.innerHTML = "Current Streak: 0"
            }
            console.log("fail")
        }
    }
})