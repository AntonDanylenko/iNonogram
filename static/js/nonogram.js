var test_img_board = [["_", "_", "*", "*", "*", "*", "*", "*", "_", "_"],
                      ["_", "*", "*", "*", "*", "*", "*", "*", "*", "_"],
                      ["_", "*", "*", "*", "*", "*", "*", "*", "*", "_"],
                      ["_", "*", "*", "*", "*", "*", "*", "*", "*", "_"],
                      ["_", "*", "*", "*", "*", "*", "*", "*", "*", "_"],

                      ["_", "*", "*", "*", "*", "*", "*", "*", "*", "_"],
                      ["*", "*", "*", "*", "*", "*", "*", "*", "*", "*"],
                      ["_", "*", "_", "_", "_", "_", "_", "_", "*", "_"],
                      ["_", "*", "*", "*", "_", "_", "*", "*", "*", "_"],
                      ["*", "*", "_", "*", "_", "_", "*", "_", "*", "*"],

                      ["*", "*", "_", "_", "*", "*", "_", "_", "*", "*"],
                      ["_", "*", "_", "_", "_", "_", "_", "_", "*", "_"],
                      ["_", "*", "_", "*", "*", "*", "*", "_", "*", "_"],
                      ["_", "*", "*", "_", "_", "_", "_", "*", "*", "_"],
                      ["_", "_", "*", "*", "*", "*", "*", "*", "_", "_"]];

function makeCounts(board, type){ // 0 for cols, 1 for rows
  var counts = [];
  var num_lanes = ((type) ? board.length : board[0].length);
  var num_cells = ((type) ? board[0].length : board.length);
  for (var lane=0; lane<num_lanes; lane++){
    var filled = [];
    var cell = 0;
    while (cell<num_cells){
      var line_length = 0;
      while (cell<num_cells && "*" == ((type) ? board[lane][cell] : board[cell][lane])){
        line_length+=1;
        cell+=1;
      }
      if (line_length>0){filled.push(line_length);}
      cell+=1;
    }
    counts.push(filled);
  }
  return counts;
}



function countsToString(count){
  var result = "";
  for (var x=0; x<count.length; x++){
    result = result + "[" + count[x] + "],";
  }
  return result.slice(0,-1);
}

function generateNonogram(args){
  var board = test_img_board.slice();
  var columns = makeCounts(board,0);
  var rows = makeCounts(board,1);
  // console.log(columns);
  // console.log(rows);

  // Empty      Columns
  // Rows       Img_board
  return countsToString(columns) + "|" + countsToString(rows);
}

function insertPuzzle(args){
  document.getElementById("puzzle").innerHTML = generateNonogram(args);
}
