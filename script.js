var FRAMES = 10;
var SPEED = 1000 / FRAMES;
var intervalId = null;
var algorithm = "bfs";

var puzzle = new Puzzle([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0]
]);

function getRandomHexColor() {
  let HEX = "0123456789ABCDEF";
  let color = ["#"];
  for (let i = 0; i < 6; i++)
    color.push(HEX.charAt(Math.floor(Math.random() * 16)));
  return color.join("");
}

function setSpeed(frames) {
  SPEED = 1000 / frames;
}

function initPuzzle() {
  let messageSpan = document.getElementById("message");
  messageSpan.style.color = "#138496";
  messageSpan.innerHTML = "choose puzzle dimensions and click scramble!";

  let rows = parseInt(document.getElementById("rows").value);
  let cols = parseInt(document.getElementById("cols").value);
  let state = generateSolvedState(rows, cols);
  puzzle.setStartState(state);
  puzzle.setEndState(state);
  puzzle.rows = rows;
  puzzle.cols = cols;
  _renderPuzzle(state);
}

function renderPuzzle() {
  let state = document.getElementById("stateInput").value;
  let rows = parseInt(document.getElementById("rows").value);
  let cols = parseInt(document.getElementById("cols").value);
  state = validatedState(state);

  _renderPuzzle(state);
  puzzle.setStartState(state);
  puzzle.setEndState(generateSolvedState(rows, cols));
}

function validatedState(state) {
  let rows = parseInt(document.getElementById("rows").value);
  let cols = parseInt(document.getElementById("cols").value);

  state = puzzle.deserialize(state);
  puzzle.rows = rows;
  puzzle.cols = cols;

  if (state.length != rows || state[0].length != cols) {
    state = generateSolvedState(rows, cols);
    document.getElementById("stateInput").value = state;
    return state;
  } else {
    return puzzle.serialize(state);
  }
}

function generateSolvedState(rows, cols) {
  let state = [];
  for (let i = 0; i < rows * cols; i++) state.push(i + 1);

  state[rows * cols - 1] = 0;

  return state.join(":");
}

function _renderPuzzle(state) {
  let puzzleContainer = document.getElementById("puzzle");

  while (puzzleContainer.firstChild)
    puzzleContainer.removeChild(puzzleContainer.firstChild);

  let rows = parseInt(document.getElementById("rows").value);
  let cols = parseInt(document.getElementById("cols").value);
  let boxSize = 50;

  state = puzzle.deserialize(state);


  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let box = document.createElement("div");
      state[i][j] == 0 ?
        box.setAttribute("class", "box empty") :
        box.setAttribute("class", "box filled");

      let y = i + 1;
      let x = j + 1;

      box.style.backgroundColor = getRandomHexColor();

      box.setAttribute("id", `${state[i][j]}`);
      box.style.lineHeight = boxSize + "px";
      box.style.top = y * boxSize + "px";
      box.style.left = x * boxSize + "px";
      box.style.width = boxSize + "px";
      box.style.height = boxSize + "px";

      puzzleContainer.appendChild(box);
      box.innerHTML = state[i][j] + "";
    }
  }
}

function setAlgorithm(option) {
  algorithm = option;

}

function scramblePuzzle() {
  let messageSpan = document.getElementById("message");
  messageSpan.style.color = "yellow";
  messageSpan.innerHTML = "The puzzle is being scrambled. Please wait.";

  let states = puzzle.scramble(100);
  document.getElementById("stateInput").value = states[states.length - 1];
  puzzle.startState = states[states.length - 1];

  setTimeout(() => {
    messageSpan.style.color = "green";
    messageSpan.innerHTML = "is all scrumbled up. You may try solving it with the algorithm of your choice.";
  }, SPEED * states.length + 40)


  playSteps(states);
  // renderPuzzle();
}

function solve() {
  let messageSpan = document.getElementById("message");
  messageSpan.style.color = "darkgrey";
  messageSpan.innerHTML = `${algorithm} is searching for a solution...`;

  //added setTimeout because the search algorithm would start before updating innerHTML messageSpan
  setTimeout(() => {
    let result = puzzle.solve(algorithm);

    if (result < 0) {
      messageSpan.style.color = "red";
      messageSpan.innerHTML = `${algorithm} search failed after ${-result} iterations`;
    } else {
      messageSpan.style.color = "green";
      messageSpan.innerHTML = `${algorithm} found a path of length ${
        puzzle.path.length
      } after ${result} iterations! Now playing solution.`;
      playSteps(puzzle.path);
    }
  }, 100);
}

function playSteps(steps) {
  let i = 0;
  let puzzleContainer = document.getElementById("puzzle");
  let {
    x: offsetX,
    y: offsetY
  } = puzzleContainer.getBoundingClientRect();

  intervalId = setInterval(() => {
    if (i == steps.length - 1) clearInterval(intervalId);
    else {
      let newId = getNextStep(steps[i], steps[i + 1]);
      let box1 = document.getElementById("0");
      let box2 = document.getElementById(newId);
      let {
        x: x1,
        y: y1
      } = box1.getBoundingClientRect();
      let {
        x: x2,
        y: y2
      } = box2.getBoundingClientRect();

      box1.style.top = y2 - offsetY + "px";
      box1.style.left = x2 - offsetX + "px";

      box2.style.top = y1 - offsetY + "px";
      box2.style.left = x1 - offsetX + "px";

      i++;
    }
  }, SPEED);
}

function getNextStep(oldState, newState) {
  let matrixOld = puzzle.getDeserialized(oldState);
  let matrixNew = puzzle.getDeserialized(newState);

  for (let i = 0; i < matrixOld.length; i++)
    for (let j = 0; j < matrixOld[i].length; j++)
      if (matrixOld[i][j] == 0) return matrixNew[i][j];
}

function stopPlaying() {
  clearInterval(intervalId);
}