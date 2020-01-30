// Anton Danylenko

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var selected;
var columns;
var rows;
var cols_width;
var rows_width;
var full_height;
var full_width;
var cur_board;
var unlocked = true;

var timer;
var t;
var timer_active;
var boardRef = document.querySelector(".board");
var pauseRef = document.querySelector(".pauseMenu");

// MAIN FUNCTIONS

function newGame(){
  selected = null;
  var counts = document.getElementById("puzzle").innerHTML.split("|");
  columns = countToArray(counts[0]);
  rows = countToArray(counts[1]);
  // console.log(columns);
  // console.log(rows);
  cols_width = getLongest(columns);
  rows_width = getLongest(rows);
  full_height = cols_width + rows.length;
  full_width = rows_width + columns.length;
  var square_size = Math.floor(600/full_width);
  if (full_height>full_width){
    square_size = Math.floor(600/full_height);
  }
  canvas.width = full_width*square_size;
  canvas.height = full_height*square_size;
  canvas.style.border = "6px solid #000000";
  unlocked = true;
  timer = 0;
  clearTimeout(t);
  timer_active = false;
  setupBoard();
  timer_active = true;
  // console.log("setupBoard startTimer");
  startTimer();
  // checkPause();
  closeModal();
}

function setupBoard(){
  /* Draws the gridlines for the sudoku board */
  // console.log("SETUP BOARD");
  // console.log(cur_board);
  context.clearRect(0,0,canvas.width,canvas.height);
  placeNonogram();
  context.strokeStyle = 'black';

  for (var i=rows_width; i<full_width; i++){
    // console.log("i: ", i);
    context.lineWidth = 1;
    if ((i-rows_width)%5==0){
      context.lineWidth = 3;
    }
    context.beginPath();
    context.moveTo(i*canvas.width/full_width, 0);
    context.lineTo(i*canvas.width/full_width, canvas.height);
    context.stroke();
  }
  for (var i=cols_width; i<full_height; i++){
    context.lineWidth = 1;
    if ((i-cols_width)%5==0){
      context.lineWidth = 3;
    }
    context.beginPath();
    context.moveTo(0, i*canvas.height/full_height);
    context.lineTo(canvas.width, i*canvas.height/full_height);
    context.stroke();
  }
}

// window.addEventListener('focus', startTimer);
// window.addEventListener('blur', pauseTimer);

document.addEventListener('click', function(event) {
  /* Determines what to do when user clicks inside the board */
  // console.log("CLICK EVENT");
  var rect = canvas.getBoundingClientRect(canvas, event);
  var mousePos = [event.clientX - rect.left, event.clientY - rect.top];
  // console.log(mousePos);
  if (mousePos[0]>=(rows_width*canvas.width/full_width) && mousePos[1]>=(cols_width*canvas.height/full_height) &&
      mousePos[0]<=canvas.width && mousePos[1]<=canvas.height &&
      unlocked){
    var sectorX = findSector(mousePos[0], canvas.width);
    var sectorY = findSector(mousePos[1], canvas.height);
    // console.log("selected: "+selected)
    // console.log("sectorX: " + sectorX + ", sectorY: " + sectorY);
    if (selected && selected[0]==sectorX && selected[1]==sectorY) {
      unselectSquare(selected[0], selected[1]);
    } else if (selected) {
      unselectSquare(selected[0], selected[1]);
      selectSquare(mousePos[0], mousePos[1]);
    } else {
      selectSquare(mousePos[0], mousePos[1]);
    }
  }
  else if (selected && unlocked){
    unselectSquare(selected[0], selected[1]);
  }
}, false);

document.addEventListener('keydown', function(event) {
  /* If a square is selected and the user presses a number
     from 1 to 9, the number is placed in that square.
     If the user presses any of the arrow keys,
     the selected square is changed. */
  // console.log"KEYPRESS EVENT");
  key = event.keyCode;
  // console.log("Key: " + key);
  num = parseInt(String.fromCharCode(key));
  // console.log("Num: " + num);
  // console.log("isNum? "+([1,2,3,4,5,6,7,8,9].includes(num)));
  if (selected && unlocked){
    // console.log("Index: " + index);
    if (37<=key && key<=40){
      moveSelected(canvas, key);
    }
    // else if (key==8){
    //   if (cur_board[index]=='_') {
    //     clearPencilCell(selected[0], selected[1]);
    //   }
    //   else {
    //     clearCell(selected[0], selected[1]);
    //   }
    // }
    // else if ([1,2,3,4,5,6,7,8,9].includes(num)) {
    //   if (init_board[index]=='_'){
    //     if (utensil){
    //       // console.log("debug: " + pencil_board[index][num-1]);
    //       if (cur_board[index]!='_') {
    //         clearCell(selected[0],selected[1]);
    //         pencilFullCell(selected[0],selected[1]);
    //       }
    //       if (num==pencil_board[index][num-1]){
    //         clearPencil(num, selected[0], selected[1]);
    //       }
    //       else {
    //         pencilNumber(num, selected[0], selected[1]);
    //       }
    //     }
    //     else {
    //       if (num==cur_board[index]){
    //         clearCell(selected[0], selected[1]);
    //       }
    //       else {
    //         writeNumber(num, selected[0], selected[1], error_cells=checkCell(num, index));
    //         if (checkWin()){
    //           winTime();
    //         }
    //       }
    //     }
    //   }
    // }
  }
  // if (key==32 && unlocked){
  //   // console.log("!utensil: " + !utensil);
  //   switchUtensil(!utensil);
  // }
  else if (key==27) {
    if (selected) {
      unselectSquare(selected[0],selected[1]);
    }
    checkPause();
  }
}, false);




// HELPER FUNCTIONS


function countToArray(string){
  var result = [];
  var index = 0;
  while (index<string.length){
    if (string[index]=="["){
      var sub = [];
      index+=1;
      while (index<string.length && string[index]!="]"){
        if (string[index]!=","){
          sub.push(string[index]);
        }
        index+=1;
      }
      // console.log(sub);
      result.push(sub);
    }
    index+=1;
  }
  return result;
}

function getLongest(array){
  var longest = 0;
  for (var i=0; i<array.length; i++){
    if (array[i].length>longest){
      longest = array[i].length;
    }
  }
  return longest;
}

function placePermNum(num, cell, index, nums_length, type){
  /* places a number into nonogram board */
  var offset = ((type) ? (rows_width-nums_length)*(canvas.width/full_width) : (cols_width-nums_length)*(canvas.height/full_height));
  var sub_offset = Math.floor(canvas.width/(full_width*4))
  // console.log(sub_offset);
  var sectorX = ((type) ? offset+Math.floor(index*canvas.width/full_width)+sub_offset : Math.floor(cell*canvas.width/full_width)+sub_offset);
  var sectorY = ((type) ? Math.floor(cell*canvas.height/full_height)-sub_offset : offset+Math.floor(index*canvas.height/full_height)-sub_offset);
  // console.log("" + sectorX + ", " + sectorY);

  context.font = (Math.floor(canvas.height/full_height)-sub_offset).toString() + 'px Arial';
  context.fillStyle = 'black';
  context.fillText(num, sectorX, sectorY+(canvas.height/full_height));
}

function placeNonogram(){
  /* places all numbers into nonogram board */
  context.fillStyle = 'lightgrey';
  context.fillRect(0,0,(rows_width*canvas.width)/full_width,canvas.height);
  context.fillRect(0,0,canvas.width,(cols_width*canvas.height)/full_height);
  for (var cell=rows_width; cell<full_width; cell++){
    for (var index=0; index<columns[cell-rows_width].length; index++){
      // console.log(columns[cell-rows_width][index]);
      placePermNum(columns[cell-rows_width][index], cell, index, columns[cell-rows_width].length, 0);
    }
  }
  for (var cell=cols_width; cell<full_height; cell++){
    for (var index=0; index<rows[cell-cols_width].length; index++){
      // console.log(rows[cell-cols_width][index]);
      placePermNum(rows[cell-cols_width][index], cell, index, rows[cell-cols_width].length, 1);
    }
  }
}

// function placeAll() {
//   // console.log("PLACE ALL");
//   for (var i=0; i<81; i++) {
//     x = getX(i);
//     y = getY(i);
//     if (cur_board[i]!='_' && init_board[i]=='_') {
//       writeNumber(cur_board[i], x, y, checkCell(cur_board[i], i));
//     }
//     else {
//       pencilFullCell(x, y);
//     }
//   }
// }

function findSector(coord, total, divisor) {
  /* Determines which square the coordinate belongs too */
  // console.log("FIND SECTOR");
  return Math.floor(coord*divisor/total)*(total/divisor);
}

function getX (ind) {
  return (ind%9)*(canvas.width/9);
}

function getY (ind) {
  return Math.floor(ind/9)*(canvas.height/9);
}

function clearCell(x, y) {
  /* Clears the cell at coordinates x, y */
  // console.log("CLEAR CELL");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  // console.log("" + sectorX + ", " + sectorY)
  context.clearRect(sectorX+9, sectorY+9, canvas.width/9-18, canvas.height/9-18);
  pencilFullCell(x,y);
  cur_board[index] = '_';
}

// function pencilNumber(num, x, y) {
//   // console.log("PENCIL NUMBER");
//   var sectorX = findSector(x, canvas.width);
//   var sectorY = findSector(y, canvas.height);
//   var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
//   context.font = '15px Arial';
//   context.fillStyle = 'black';
//   context.fillText(num, sectorX+10+20*((num-1)%3), sectorY+20+18*Math.floor((num-1)/3));
//   pencil_board[index][num-1] = num;
// }

// function clearPencil (number, x, y) {
//   // console.log("CLEAR PENCIL");
//   var sectorX = findSector(x, canvas.width);
//   var sectorY = findSector(y, canvas.height);
//   var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
//   context.clearRect(sectorX+10+20*((num-1)%3), sectorY+9+18*Math.floor((num-1)/3), 8, 12);
//   pencil_board[index][num-1] = '_';
// }

// function pencilFullCell (x, y) {
//   // console.log("PENCIL FULL CELL");
//   var sectorX = findSector(x, canvas.width);
//   var sectorY = findSector(y, canvas.height);
//   var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
//   for (var i=0; i<9; i++) {
//     if (pencil_board[index][i]!='_') {
//       pencilNumber(i+1, x, y);
//     }
//   }
// }

// function clearPencilCell (x, y) {
//   // console.log("CLEAR PENCIL CELL");
//   var sectorX = findSector(x, canvas.width);
//   var sectorY = findSector(y, canvas.height);
//   var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
//   context.clearRect(sectorX+9, sectorY+9, canvas.width/9-18, canvas.height/9-18);
//   for (var i=0; i<9; i++) {
//     pencil_board[index][i]='_'
//   }
// }

function selectSquare(x, y) {
  /* Selects the square that coresponds to the
     given x and y coordinates and outlines it */
  // console.log("SELECT SQUARE");
  var sectorX = findSector(x, canvas.width, full_width);
  var sectorY = findSector(y, canvas.height, full_height);
  var sub_offset = Math.floor(canvas.width/(full_width*6));
  // console.log("sectorX: " + sectorX + ", sectorY: " + sectorY);
  context.lineWidth = 3;
  context.strokeStyle = "#50AEEE";
  context.strokeRect(sectorX+sub_offset, sectorY+sub_offset, canvas.width/full_width-2*sub_offset, canvas.height/full_height-2*sub_offset);
  selected = [sectorX, sectorY];
}

function unselectSquare(x, y) {
  /* Unselects the square and removes outline */
  // console.log("UNSELECT SQUARE");
  var sectorX = findSector(x, canvas.width, full_width);
  var sectorY = findSector(y, canvas.height, full_height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  var sub_offset = Math.floor(canvas.width/(full_width*8));
  // console.log("sectorX: " + sectorX + ", sectorY: " + sectorY);
  // console.log("Index: " + index)
  context.fillStyle = 'white';
  context.fillRect(sectorX+sub_offset, sectorY+sub_offset, canvas.width/full_width-2*sub_offset, 2*sub_offset);
  context.fillRect(sectorX+sub_offset, sectorY+sub_offset, 2*sub_offset, canvas.height/full_height-2*sub_offset);
  context.fillRect(sectorX+sub_offset, sectorY+canvas.height/full_height-3*sub_offset, canvas.width/full_width-2*sub_offset, 2*sub_offset);
  context.fillRect(sectorX+canvas.width/full_width-3*sub_offset, sectorY+sub_offset, 2*sub_offset, canvas.height/full_height-2*sub_offset);
  // context.clearRect(sectorX+3, sectorY+3, canvas.width/9-6, canvas.height/9-6);
  selected = null;
}

function moveSelected(canvas, key) {
  /* Change the square selected based off the
     arrow key pressed. */
  // console.log("MOVE SELECTED");
  var context = canvas.getContext('2d');
  curX = selected[0];
  curY = selected[1];
  // console.log(curX);
  // console.log(curY);
  unselectSquare(selected[0], selected[1]);
  if (key==37){ // left arrow
    if (curX>rows_width*canvas.width/full_width) {
      curX-=canvas.width/full_width;
    }
    else {
      curX=canvas.width-(canvas.width/full_width);
    }
  }
  else if (key==38){ // up arrow
    if (curY>cols_width*canvas.height/full_height) {
      curY-=canvas.height/full_height;
    }
    else {
      curY=canvas.height-(canvas.height/full_height);
    }
  }
  else if (key==39){ // right arrow
    if (curX!=canvas.width-(canvas.width/full_width)) {
      curX+=canvas.width/full_width;
    }
    else {
      curX=cols_width*canvas.width/full_width;
    }
  }
  else if (key==40){ // down arrow
    if (curY!=canvas.height-(canvas.height/full_height)) {
      curY+=canvas.height/full_height;
    }
    else {
      curY=rows_width*canvas.height/full_height;
    }
  }
  selectSquare(curX, curY);
}






function changeTimer(){
  document.getElementById("time").innerHTML = displayTime(timer);
  t = setTimeout(function(){ changeTimer() }, 1000);
  timer = timer + 1;
}

function displayTime(calcTime){
  var hours = Math.floor(calcTime / 3600);
  calcTime = calcTime % 3600;
  var minutes = Math.floor(calcTime / 60);
  calcTime = calcTime % 60;
  var seconds = Math.floor(calcTime);

  seconds = addZeros(seconds);
  minutes = addZeros(minutes);

  return `${hours}:${minutes}:${seconds}`
}

function startTimer(){
  if (unlocked){
    timer_active = true;
    changeTimer();
    document.querySelector(".pauseMenu").style.display = "none";
  }
  else {
    openModal();
  }
}

function pauseTimer(){
  clearTimeout(t);
  timer_active = false;
  if (unlocked){
    document.querySelector(".pauseMenu").style.display = "block";
  }
}

function checkPause(){
  if(timer_active){
    pauseTimer();
  }
  else {
    startTimer();
  }
  if (unlocked) {
    boardRef.classList.toggle("hidden");
  }
}

function addZeros(i){
  if(i < 10){
    i = "0" + i;
  }
  return i;
}

function switchUtensil(button) {
  /* Swith utensil depending on what button user clicks */
  if (button==1) {
    utensil=1; // pencil
    document.getElementById("pen").className = "";
    document.getElementById("pencil").className = "active";
  }
  else {
    utensil=0; // pen
    document.getElementById("pencil").className = "";
    document.getElementById("pen").className = "active";
  }
}

function openModal(){
  // console.log("OPEN MODAL");
  // console.log(unlocked);
  document.getElementById("winAlert").style.display = "block";
  document.getElementById("finalTime").innerHTML = "Time: " + displayTime(timer-1);
}

function closeModal(){
  // console.log("CLOSE MODAL");
  document.getElementById("winAlert").style.display = "none";
}

var cliques = [[0,1,2,3,4,5,6,7,8],
[9,10,11,12,13,14,15,16,17],
[18,19,20,21,22,23,24,25,26],
[27,28,29,30,31,32,33,34,35],
[36,37,38,39,40,41,42,43,44],
[45,46,47,48,49,50,51,52,53],
[54,55,56,57,58,59,60,61,62],
[63,64,65,66,67,68,69,70,71],
[72,73,74,75,76,77,78,79,80],
[0,9,18,27,36,45,54,63,72],
[1,10,19,28,37,46,55,64,73],
[2,11,20,29,38,47,56,65,74],
[3,12,21,30,39,48,57,66,75],
[4,13,22,31,40,49,58,67,76],
[5,14,23,32,41,50,59,68,77],
[6,15,24,33,42,51,60,69,78],
[7,16,25,34,43,52,61,70,79],
[8,17,26,35,44,53,62,71,80],
[0,1,2,9,10,11,18,19,20],
[3,4,5,12,13,14,21,22,23],
[6,7,8,15,16,17,24,25,26],
[27,28,29,36,37,38,45,46,47],
[30,31,32,39,40,41,48,49,50],
[33,34,35,42,43,44,51,52,53],
[54,55,56,63,64,65,72,73,74],
[57,58,59,66,67,68,75,76,77],
[60,61,62,69,70,71,78,79,80]];

function checkCell(num, cell_num){
  error_cells = new Set();
  for (var i=0; i<cliques.length; i++) {
    if (cliques[i].includes(cell_num)) {
      for (var ii=0; ii<9; ii++) {
        if (cliques[i][ii]!=cell_num && cur_board[cliques[i][ii]]==num) {
          error_cells.add(cliques[i][ii]);
        }
      }
    }
  }
  // console.log(error_cells);
  return error_cells;
}

function checkWin(){
  // console.log(cur_board);
  if (! cur_board.includes('_')){
    for (var i=0; i<cliques.length; i++) {
      var nums = [1,2,3,4,5,6,7,8,9];
      // console.log("nums: "+nums);
      for (var ii=0; ii<9; ii++) {
        index = nums.indexOf(parseInt(cur_board[cliques[i][ii]]));
        if (index>-1){
          nums.splice(index,1);
        }
        else{
          // console.log("has error");
          // console.log(i*9+ii);
          return false;
        }
      }
    }
    return true;
  }
  // console.log("has empty spaces");
  return false;
}

function winTime(){
  unlocked = false;
  pauseTimer();
  unselectSquare(selected[0],selected[1]);
  openModal();
}

function difficulty(dif){
  var difs = ["easy", "medium", "hard"];
  for (var x=0; x<3; x++){
    document.getElementById(difs[x]).className = "";
  }
  document.getElementById(difs[dif]).className = "active";
  newGame();
}
