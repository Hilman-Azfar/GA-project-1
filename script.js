console.log('Loading script...');


//// HARD CODED GAME SETTINGS
// frames per second
let FPS = 1000 / 60;


// STATE MANAGER

// idle -- default waiting for user to start
let game = 'over';

// start -- when start button is clicked, begin game loop
// gameStart should not do anything if there is an ongoing game
let gameStart = () => {
    if (game === 'over' || game === 'win'){
        game = 'start';
        triggerStartOverlay();
        handleUserDifficulty();
        handleDataSet();
        reset();
        showSideBar();
        showCombo();
        startAllLoops();
        userInputText.focus();
        console.log(game,"--- gameStart")
    }
}
// over -- end all operations and reset to default and set back to
let gameOver = () => {
    game = 'over';
    console.log("--- gameOver")
}

// rest data and display to default values
let reset = () => {
    resetDisplay();
    resetData();
    resetInput();
    stage = 1;
}


// USER HANDLING
// during game start
// record the user input only onchange and compare to the exist

let userInputText = document.querySelector('#user-input');

userInputText.addEventListener('keypress',(event)=>{handleSpaceDown(event)});
userInputText.addEventListener('input',(event)=>{handleInput(event)});


let currentInput;
let handleSpaceDown = (event) => {
    if (game === 'start' && (event.key === " " || event.key === "Enter")) {
        currentInput = event.target.value;
        event.target.value = '';
        deleteBox(activeBox, currentInput)
        // force the new display
        //showActive()
        showSideBar()
    } else if (game !== 'start' && (event.key === " " || event.key === "Enter")) {
        event.target.value = '';
    }
}

let handleInput = (event) => {
    if (event.target.value === " "){
        event.target.value = '';
    }
}

let resetInput = () => {
    userInputText.value = '';
}

// get speed of boxes
let display = document.querySelector('.display-game');


let handleDataSet = () => {
    let dataSet = document.querySelector('#data-set').value;
    console.log(dataSet,"---handleUserSpeed")
    switch(dataSet){
        case 'test':
            textArr = testArr;
            combo = testCombo;
            endWord = testEndWord;
            break;
        case 'food':
            textArr = ['coke','candy','cake','ramen','double','down','burger'];
            combo = ['double','down','burger'];
            endWord = 'Boba'
            break;
        case 'harry':
            try{
                textArr = getTextArr();
                endGame = getEndgame();
                setCombo();
            } catch {
                textArr = testArr;
                combo = testCombo;
                endWord = testEndWord;
            }
            break;
    }
}

// refresh every ms data
// rate of boxes spawning
let refreshMS;
let handleUserDifficulty = () => {
    let difficulty = document.querySelector('#user-difficulty').value;
    switch(difficulty){
        case 'easy':
            refreshMS = 1500;
            userSpeed = 0.7;
            break;
        case 'moderate':
            refreshMS = 1000;
            userSpeed = 1;
            break;
        case 'hard':
            refreshMS = 800;
            userSpeed = 1.5;
            break;
        case 'insane':
            refreshMS = 300;
            userSpeed = 1.9;
            break;
    }
    console.log(difficulty,'---handleUserDifficulty')
}


///
// DATA HANDLING -- checks for changes in data
///

// use api to fetch data
// need to choose:
// data set
// combo
// trap word


let textArr = ['text'];
let combo = '';
let endWord = 'text';

let apiArr = [];
let testArr = ['get','it','right','rad','blu','gren'];
let testCombo = ['get','it','right'];
let testEndWord = 'trap';

async function getApiWords(){
    const path = "http://hp-api.herokuapp.com/api/characters"
    //let query = '';
    try {
        // get data
        const res = await fetch(path);
        apiArr = await res.json();
    } catch(err){
        textArr = testArr;
        console.error(err)
    }
}

let getTextArr = () => {
    let newArr = apiArr.map((obj)=>{
        var word = obj.patronus;
        if (word !== "" && word.length < 7){
            return word
        }
    }).filter((item)=>{
        return item ;
    })
    return newArr;
}

let getEndgame = () => {
    var index  = Math.floor(Math.random() * apiArr.length)
    var word = apiArr[index].name.split(' ')[0];
    return word;
}

let setCombo = () => {
    var comboArr = apiArr.map((obj)=>{
        return obj.wand.wood
    }).filter((item)=>{
        return item !== '';
    })
    for (var i = 0; i < combo.length; i++) {
        var index  = Math.floor(Math.random() * comboArr.length)
        combo[i] = comboArr[index];
    }
    textArr = textArr.concat(combo);
}

getApiWords();

let userSpeed = 0.9;
let color = ['green', 'blue', 'red']


class Box {
    // constructor chooses which type of box to be made
    constructor(boxType, velocity){
        var word = this.randomText(textArr)
        this.velocity = velocity
        switch(boxType){
            case 'normal':
                var newBox = this.createBox(word);
                newBox.style.color = 'white'
                this.word = word;
                this.box = newBox;
                break;
            case 'color':
                var newBox = this.createBox(word);
                var randColor = this.randomColor();
                this.word = randColor;
                newBox.style.color = 'white'
                newBox.style.backgroundColor = randColor;
                this.box = newBox;
                break;
            case 'trap':
                var newBox = this.createBox(endWord);
                newBox.style.color = 'white'
                this.word = endWord;
                this.box = newBox;
                break;
            case 'fast':
                var newBox = this.createBox('zoom');
                newBox.style.backgroundColor = 'fuchsia'
                this.word = 'zoom';
                newBox.style.color = 'white'
                this.velocity = this.velocity * 2;
                this.box = newBox;
        }
    }

    createBox (word) {
        var newBox = document.createElement('div');
        newBox.classList.add('move');
        var insideText = document.createElement('p')
        insideText.innerText = word;
        newBox.appendChild(insideText);

        // positioning
        this.x = 800;
        newBox.style.right = this.x + 'px';

        let y = Math.floor(Math.random() * 350);
        this.y = y;
        newBox.style.top = y + 'px';
        return newBox;
    }

    // display
    showBox () {
        display.appendChild(this.box);
    }


    // update position
    updatePosition () {
        this.x = this.x - this.velocity
        let newPos = this.x + 'px';

        this.box.style.right = newPos;
    }

    // create new boxes with random text
    randomText (arr) {
        var index  = Math.floor(Math.random() * arr.length)
        return arr[index];
    }

    randomColor () {
        var index  = Math.floor(Math.random() * color.length)
        return color[index];
    }
}


// add box to active every gameloop
let activeBox = [];


// add boxes according to stages
//
let updateBox = () => {
    // according to stage update diff things
    let boxType;
    let allBoxTypes = ['normal', 'color','trap','fast']
    switch (stage){
        case 1:
            // stage 1
            // normal
            boxType = allBoxTypes[0]
            break;
        case 2:
            // stage 2
            // color
            boxType = allBoxTypes[1]
            break;
        case 3:
            // stage 3
            // normal + trap
            // random
            var randNum = randomNumber(4);
            if (randNum === 3){
                boxType = allBoxTypes[2];
            } else {
                boxType = allBoxTypes[0];
            }
            break;
        case 4:
            // stage 4
            // all
            var randNum = randomNumber(5);
            if (randNum === 4){
                boxType = allBoxTypes[2];
            } else if (randNum === 3){
                boxType = allBoxTypes[1];
            } else {
                boxType = allBoxTypes[0];
            }
            break;
        case 5:
            // stage 5
            // speed up
            var randNum = randomNumber(4);
            if (randNum === 3){
                boxType = allBoxTypes[3];
            } else {
                boxType = allBoxTypes[0];
            }
            break;
    }
    var newBox = new Box(boxType, userSpeed);
    newBox.showBox();
    activeBox.push(newBox)
}

// NOTE: expensive to look up and delete in array
// consider hashmap with linked lists
// returns true if deleted false if not found indicating invalid input
let lastDelete = '';

let deleteBox = (arr, word) => {
    //check for first occurance and delete it
    let index = -1;
    let child = null;
    for (var i = 0; i < arr.length; i++) {
        console.log(arr[i].word, word,'--- deleteBox')
        if (arr[i].word === word){
            if (word === endWord) {
                handleGameEnd();
            }
            child = arr[i].box;
            index = i;
            break
        }
    }
    //if only word exists
    if (index > -1) {
        // remove from screen
        display.removeChild(child);

        // remove from array
        arr = arr.splice(index, 1)
        lastDelete = word;
        if (updateCombo()){
            console.log(activeCombo,'--- updateCombo')
            addScore(100);
        }
        addScore(10);
        console.log("Deleted ---",word,"--- deleteBox")
        return true
    } else {
        console.log(word + 'not found! --- deleteBox')
        return false
    }
}

let deleteTrapBox = () => {
    if (activeBox[0].word === endWord){
        display.removeChild(activeBox[0].box)
        activeBox.shift();
    }
}


// after deletion increment score
let score = 0;

let addScore = (num) => {
    score += num;
    handleStage();
}


// reset data to default
let resetData = () => {
    activeBox = [];
    score = 0;
    lastDelete = '';
}

// combo will be an array of deleted word in specific order

let activeCombo = [];

let updateCombo = () => {
    comboLength = activeCombo.length;
    if ( comboLength === 0 && lastDelete === combo[0]){
        activeCombo[0] = lastDelete;
        return false
    } else if ( comboLength !== 0 && lastDelete === combo[0]){
        activeCombo = [lastDelete];
        return false
    } else if ( comboLength === 1 && lastDelete === combo[1]){
        activeCombo[1] = lastDelete;
        return false
    } else if ( comboLength === 2 && lastDelete === combo[2]){
        activeCombo = [];
        console.log('combo successful! --- isCombo')
        return true
    }
    activeCombo = [];
    console.log(activeCombo,"--- updateCombo")
    return false
}


// DISPLAY HANDLING -- updates to show things
// show game state in the side bar
// show point system
let gameHeading = document.querySelector('.game-state>p');
let stageHeading = document.querySelector('.game-stage>p');
let scoreHeading = document.querySelector('.score>p');
let lastDelHeading = document.querySelector('.last-delete>p');
let comboHeading = document.querySelector('.combo>p');

let showSideBar = () => {
    var comboHeadingText = () => {
        var concat = '';
        for (var i = 0; i < activeCombo.length; i++) {
            concat = concat + ' ' + activeCombo[i];
        }
        return concat
    }
    gameHeading.innerText = game;
    stageHeading.innerText = stage;
    scoreHeading.innerText = score;
    lastDelHeading.innerText = lastDelete;
    comboHeading.innerText = comboHeadingText();
}

let showCombo = () => {
    var comboText = document.getElementById('table-combo');
    comboText.innerText = `${combo[0]} + ${combo[1]} + ${combo[2]}`;
}

// change the displays to the default
let resetDisplay = () => {
    display.innerHTML = ''
    gameHeading.innerText = game;
}


///// ALL LOOPS /////
let startAllLoops = () => {
    startStageLoop();
//    startStageTimer();
    startGameLoop();
}

let endAllLoops = () => {
    endStageLoop();
    endGameLoop();
}

// Data loops + stage tracker
let stage = 1;
let stageLoop;
let stageTimer;

let startStageLoop = () => {
    stageLoop = setInterval(()=>{updateData();},refreshMS)
    console.log('--- startStageLoop')
}

let endStageLoop = () => {
    clearInterval(stageLoop);
    console.log('--- endStageLoop')
}

let updateData = () => {
    updateBox(apiArr);
}

// progress stages till stage complete
let handleStage = () => {
    if (score > 600){
        game = 'win'
        handleGameWon();
        console.log('won ---handleStage')
    } else if (score > 500){
        stage = 5;
        console.log(stage,'---handleStage')
    } else if (score > 400){
        stage = 4;
        console.log(stage,'---handleStage')
    } else if (score > 300){
        stage = 3;
        console.log(stage,'---handleStage')
    } else if (score > 100){
        stage = 2;
        console.log(stage,'---handleStage')
    }
}


// GAME LOOP --
// check for changes in display, data and game state
let gameLoop;
let gameTimer;

let startGameLoop = () => {
    gameLoop = setInterval(()=>{updateDisplay();}, FPS);
    //gameTimer = setTimeout(()=> {isGameWon();}, timer)
    console.log("--- startGameLoop")
}

let endGameLoop = () => {
    clearInterval(gameLoop);
    console.log("--- endGameLoop")
}

//check won condition
let isGameWon = () => {
    // as long you have not lost, you won
    if (game !== 'over') {
        game = 'won';
        console.log(game,'--- isGameWon')
        handleGameWon();
        return true
    } else {
        return false
    }
}

let handleGameWon = () => {
    triggerGamewonOverlay()
    endAllLoops();
    console.log(game)
    showSideBar()
}

// double check logic when to check for endgame
let updateDisplay = () => {

    // go thru the array and update all the obj position
    // check if box at end of screen
    // if normal lose
    // if trap delete
    let endScreen = 0;
    for (var i = 0; i < activeBox.length; i++) {
        activeBox[i].updatePosition();
        if (activeBox[i].x < endScreen && activeBox[i].word === endWord){
            console.log('trap detected');
            deleteTrapBox();
        } else if (activeBox[i].x < endScreen){
            console.log('edge collision --- updateDisplay')
            handleGameEnd();
            return;
        }
    }
}

let handleGameEnd = () => {
    clearTimeout(gameTimer);
//    endStageTimer();
    endAllLoops();
    gameOver();
    triggerGameoverOverlay()
    showSideBar();
    console.log("--- handleGameEnd")
}


// Helper functions

let randomNumber = (num) => {
    return Math.floor(Math.random() * num);
}


// onload show first overlay √
let overlay;
let overlayOne = () => {
    let focusOnPanel = document.querySelector('.display-game');
    focusOnPanel.scrollIntoView({behavior: "smooth",block:"center", inline: "end"});
    overlay = document.getElementById('how-to-1');

    let boxCtn = document.querySelector('.box-ctn');

    let allBoxTypes = ['normal', 'color','trap','fast']

    for (var i = 0; i < allBoxTypes.length; i++) {

        var newBox = new Box(allBoxTypes[i], 0);
        newBox.box.style.position = 'initial';
        boxCtn.appendChild(newBox.box);
    }
}

// explain game concept
// when close √
// display none
// show next overlay and bring focus √

let overlayTwo = () => {
    let focusOnPanel = document.querySelector('.instructions');
    focusOnPanel.scrollIntoView({behavior: "smooth",block:"center", inline: "end"});
    overlay.style.display = 'none';
    overlay = document.getElementById('how-to-2');
    overlay.style.display = 'flex';

}

// explain special box type
// indicate special combinations below
// when close
// display none
// show next overlay and bring focus

let overlayThree = () => {
    let focusOnPanel = document.querySelector('.input-panel');
    focusOnPanel.scrollIntoView({behavior: "smooth",block:"center", inline: "end"});
        overlay.style.display = 'none';
    overlay = document.getElementById('how-to-3');
    overlay.style.display = 'flex';
}

// explain how to start game
// when close
// display none
// bring focus to game area

let overlayOver = () => {
    let focusOnPanel = document.querySelector('.display-game');
    focusOnPanel.scrollIntoView({behavior: "smooth",block:"center", inline: "end"});
        overlay.style.display = 'none';
    overlay = document.getElementById('how-to-3');
    overlay.style.display = 'none';
}

// ALL OVERLAYS HERE

let triggerStartOverlay = () => {
    var startOverlay = document.querySelector('#start-overlay');
    startOverlay.classList.add('fade');
    setTimeout(()=>{
        startOverlay.classList.remove('fade');
        console.log('---triggerStartOverlay')
    },2000);
}

let triggerGameoverOverlay = () => {
    var startOverlay = document.querySelector('#gameover-overlay');
    startOverlay.classList.add('translate');
    setTimeout(()=>{
        startOverlay.classList.remove('translate');
        console.log('---triggerStartOverlay')
    },3000);
}

let triggerGamewonOverlay = () => {
    var startOverlay = document.querySelector('#gamewon-overlay');
    startOverlay.classList.add('translate');
    setTimeout(()=>{
        startOverlay.classList.remove('translate');
        console.log('---triggerStartOverlay')
    },3000);
}

window.onload = () => {
    overlayOne();
}



console.log('Script loaded!');