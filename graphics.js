// TODO: UI for moving checkers

var checkerDiameter = 30;
var gapBetweenCheckers = 5;
var barLength = 40;
var doublingCubeSize = 30;
var doublingCubeOffset = 5;
var dieSize = 30;
var dieDotRadius = 3;
var gapBetweenDice = 4;
var maxCheckersShown = 5;
var maxBarCheckersShown = 4;

var resignFlagPoleLength = 36;
var resignFlagSize = 20;

var verticalGap = 50;
var pointHeight = maxCheckersShown * checkerDiameter;

var barLeftBoundary = checkerDiameter * 6 + gapBetweenCheckers * 7;
var barRightBoundary = barLeftBoundary + barLength;
var barCenter = (barLeftBoundary + barRightBoundary) / 2;
var boardWidth = barRightBoundary + checkerDiameter * 6 + gapBetweenCheckers * 7;
var boardHeight = maxCheckersShown * checkerDiameter * 2 + verticalGap;

var playerLeftDieStartPoint = (barRightBoundary + boardWidth - gapBetweenDice) / 2 - dieSize;
var playerRightDieStartPoint = (barRightBoundary + boardWidth + gapBetweenDice) / 2;
var opponentLeftDieStartPoint = (barLeftBoundary - gapBetweenDice) / 2 - dieSize;
var opponentRightDieStartPoint = (barLeftBoundary + gapBetweenDice) / 2;
var diceVerticalStartPoint = (boardHeight - dieSize) / 2;

var playerColor = "red";
var opponentColor = "blue";

import { Gammonground } from './gammonground.js';
const config = {};

var ground = Gammonground(document.getElementById('gammonground'), config);

        ground.set({
              highlight: {
             lastMove: false, // add last-move class to squares
            },
            draggable: {
                enabled:true,
                showGhost: true,
            },


          turnColor: 'white',
           events: {
             select: tryRoll(ground) 
           },
          movable: {
           events: { after: printLegalMoves() } ,
            dests:  new Map([]),
            showDests: true,
            free: false
          }
        });

var legalMoves = new Array([]);

export function printLegalMoves(Api) {
    return (orig, dest, metadata) => {
        if (legalMoves) {
            legalMoves.forEach(el => {
                if (el.length > 0) {
                    console.log(el);
        
                }
            });
        }
    }
}

window.getRolls = function(rawHint) {
      var moves = rawHint.split('.')[1].split('   ')[1].trim().split(' ');
      legalMoves.push(cleanMoves(moves));
     }

function addGroundMove(g, p1, p2) {
     console.log("NEW", ground.lastMove);
    if (!g.state.movable.dests) {
         g.set({
          movable: {
               dests: new Map([]),
               showDests: true,
           }
       });
    }
    var m = g.state.movable.dests;
    const squares1 = pip2squares(p1);
    const squares2 = pip2squares(p2);
    if (m.get(squares1[0])?.includes(squares2[0])) {
        console.log("skipping add");
        return;
    }

    squares1.forEach(el1 => {

        var k = m.get(el1);
        if (k) {
            squares2.forEach(el2 => {
                if (!k.includes(el2)) {
                    k.push(el2); 
                }   
            });
        } else {
            m.set(el1, squares2);
        }
    });
    g.set({ movable: { dests: m } });
}

function pip2squares(pip) {
    var r = new Array();
    if (parseInt(pip) <= 12) {
        //console.log("PIP is ",pip);
        let c = String.fromCharCode('a'.charCodeAt() + (parseInt(pip)-1) + (parseInt(pip)/7>>0));
        for (var i = 1; i <= 6; i++) {
            r.push(c + i);
        }
    } else {
        let c2 = String.fromCharCode('a'.charCodeAt() + (24-parseInt(pip)) +  (((25-parseInt(pip))/7)>>0) );
        //console.log("C2 is ", c2);
        for (var j = 8; j <= 13; j++) {
            r.push(c2 +  String.fromCharCode('0'.charCodeAt() + j));
        }
    }
   return r;
}


export function tryRoll(Api) {
    return (orig, dest) => {
        if (orig == "c7" || orig == "d7" || orig == "j7" || orig == "k7") {
            if (legalMoves.length != 0) {
                legalMoves = [];
                gnubgCommand("roll");

                // TODO get legal moves
                gnubgCommand("hint 200");
                legalMoves.forEach(el => {
                    if (el.length > 0) {
                        console.log(el);
                        el.forEach(el2 => {
                             addGroundMove(ground, el2.substr(0, el2.indexOf("/")), el2.substr(el2.indexOf("/") + 1));
                        })
                    }
                });
            }

        // undo
        } else if (orig == "m7") {
            gnubgCommand("show board");
        }

    }
}

function cleanMoves(a) {
    let b = new Array();
    a.forEach(el => {
       // b.push(el.replace('*',''));
        if (!el.includes('(') && !el.includes('bar')) {
            b.push((el.replace('*','').split('/').slice(0,2).join('/')));
        }
    });
    return b;
}

function isPip(val) {
    return (val[0] != 'g' && val[1] != '7');
}

function countPieces (val) {

    var pstart = 0;
    var pend = 0;
    if (parseInt(val[1]) > 7) {
        pstart = 7;
        pend = 13;
    }
    for (var i = pstart; i < pend; i++) {
        console.log(val[0] + i);
    }

}

function logMapElements(value, key, map) {
 // console.log(`m[${key}] = ${value}`);
}


var lastDice1;
var lastDice2;

function drawCheckers(ctx, numCheckers, pointStart, direction) {
    if (numCheckers == 0) {
        return;
    }
     
    var checkerCenterVertical;
    if (direction == 1) { // top of board
	checkerCenterVertical = checkerDiameter / 2;
    } else {
	checkerCenterVertical = boardHeight - checkerDiameter / 2;
    }

    if (numCheckers > 0) {
        ctx.fillStyle = playerColor;
    } else {
        ctx.fillStyle = opponentColor;
    }

    for (var i=0; i<Math.min(Math.abs(numCheckers), maxCheckersShown); i++) {
        ctx.beginPath();
        ctx.arc(pointStart + checkerDiameter / 2, checkerCenterVertical, checkerDiameter / 2, 0, 2*Math.PI);
        ctx.fill();
        
        checkerCenterVertical += (direction * checkerDiameter);
    }

    if (Math.abs(numCheckers) > maxCheckersShown) {
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "white";
        var text = Math.abs(numCheckers);
        ctx.fillText(text, pointStart + checkerDiameter / 2 - ctx.measureText(text).width / 2, checkerCenterVertical - direction * checkerDiameter + 2);
    }

    ctx.fillStyle = "grey";
}

function drawBarCheckers(ctx, numCheckers, direction) {
    if (numCheckers == 0) {
        return;
    }

    if (numCheckers > 0) {
        ctx.fillStyle = playerColor;
    } else {
        ctx.fillStyle = opponentColor;
    }

    var checkerCenterVertical = boardHeight / 2 + direction * (gapBetweenCheckers + checkerDiameter / 2);
    for (var i=0; i<Math.min(Math.abs(numCheckers), maxBarCheckersShown); i++) {
        ctx.beginPath();
        ctx.arc(barCenter, checkerCenterVertical, checkerDiameter / 2, 0, 2*Math.PI);
        ctx.fill();

        checkerCenterVertical += (direction * checkerDiameter);
    }

    if (Math.abs(numCheckers) > maxBarCheckersShown) {
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "white";
        var text = Math.abs(numCheckers);
        ctx.fillText(Math.abs(numCheckers), barCenter - ctx.measureText(text).width/2, checkerCenterVertical - direction * checkerDiameter + 2);
    }

    ctx.fillStyle = "grey";
}

 window.drawBoard = function(backgroundOnly,
                   board,
                   boardString,
		   matchLength,
		   myScore,
		   opponentScore,
		   turn,
		   dice1,
		   dice2,
		   cubeValue,
		   iMayDouble,
		   opponentMayDouble,
		   wasDoubled,
		   myPiecesOff,
		   opponentPiecesOff,
		   crawford,
                   resignationOffered,
		   resignationValue) {
    var backgammonBoard = document.getElementById("backgammonBoard");
    //var ground = Chessground(document.getElementById('chessground'), config);
    console.log(boardString);
    if (dice1 > 0) {
        lastDice1 = dice1;
        lastDice2 = dice2;
    }

    console.log(lastDice1, lastDice2);
   // var legalMoves = new Map([]);

   // legalMoves.set('a1', ['f1','f2','f3','f4', 'f5', 'f6']);
   ground.set({fen: boardString});
    if (dice1 <= 0) {
        console.log("gets here", boardString[33]);
         // var turn = parseInt(boardString[32]);
        //ground.newPiece(pos2key([3,6]), {role: 'd1', color:  turn > 0 ? 'black' : 'white',});
        ground.newPiece({role:'d'+lastDice1, color:'white'}, 'c7');
        ground.newPiece({role:'d'+lastDice2, color:'white'}, 'd7');
         ground.newPiece({role:'undo', color:'black'}, 'd7');
        //boardString[33] = lastDice1;
        //boardString[34] = lastDice2;
   }
   //ground.newPiece({role:'d'+lastDice2, color:'white'}, 'a0');
   // ground.

    //ground.set


    //ground.set()



    var ctx = backgammonBoard.getContext("2d");
    ctx.strokeStyle = "black";
    ctx.fillStyle = "grey";
    ctx.clearRect(0,0,backgammonBoard.width,backgammonBoard.height);

    // 1-12 = lower, 13-24 = upper
    // for now, we will draw it so that the player always plays counterclockwise
    // so the 1-point is in the lower left hand corner

    // draw outer boundary of board
    ctx.beginPath();
    ctx.rect(0,0,boardWidth,boardHeight);

    // draw bar
    ctx.moveTo(barLeftBoundary, 0);
    ctx.lineTo(barLeftBoundary, boardHeight);
    ctx.moveTo(barRightBoundary, 0);
    ctx.lineTo(barRightBoundary, boardHeight);
      
    ctx.stroke();

    // draw upper left points
    var pointStart = gapBetweenCheckers;
    for (var i=0; i<6; i++) {
        ctx.beginPath();
        ctx.moveTo(pointStart, 0);
        ctx.lineTo(pointStart + checkerDiameter / 2, pointHeight);
        ctx.lineTo(pointStart + checkerDiameter, 0);
        if (i % 2 == 0) {
	    ctx.stroke();
        } else {
	    ctx.fill();
        }
	if (!backgroundOnly) {
	    drawCheckers(ctx, board[24-i], pointStart, 1);
	}

        pointStart += (checkerDiameter + gapBetweenCheckers);
    }

    // draw upper right points
    pointStart += (barLength + gapBetweenCheckers);
    for (var i=0; i<6; i++) {
        ctx.beginPath();
        ctx.moveTo(pointStart, 0);
        ctx.lineTo(pointStart + checkerDiameter / 2, pointHeight);
        ctx.lineTo(pointStart + checkerDiameter, 0);
        if (i % 2 == 0) {
	    ctx.stroke();
        } else {
	    ctx.fill();
        }
	if (!backgroundOnly) {
	    drawCheckers(ctx, board[18-i], pointStart, 1);
	}

        pointStart += (checkerDiameter + gapBetweenCheckers);
    }


    // draw lower left points
    var pointStart = gapBetweenCheckers;
    for (var i=0; i<6; i++) {
        ctx.beginPath();
        ctx.moveTo(pointStart, boardHeight);
        ctx.lineTo(pointStart + checkerDiameter / 2, boardHeight - pointHeight);
        ctx.lineTo(pointStart + checkerDiameter, boardHeight);
        if (i % 2 == 1) {
	    ctx.stroke();
        } else {
	    ctx.fill();
        }
	if (!backgroundOnly) {
	    drawCheckers(ctx, board[i+1], pointStart, -1);
	}
        pointStart += (checkerDiameter + gapBetweenCheckers);
    }

    // draw lower right points
    pointStart += (barLength + gapBetweenCheckers);
    for (var i=0; i<6; i++) {
        ctx.beginPath();
        ctx.moveTo(pointStart, boardHeight);
        ctx.lineTo(pointStart + checkerDiameter / 2, boardHeight - pointHeight);
        ctx.lineTo(pointStart + checkerDiameter, boardHeight);
	if (i % 2 == 1) {
	    ctx.stroke();
        } else {
	    ctx.fill();
        }
        if (!backgroundOnly) {
	    drawCheckers(ctx, board[i+7], pointStart, -1);
	}

        pointStart += (checkerDiameter + gapBetweenCheckers);
    }

    if (backgroundOnly) {
	return;
    }

    // draw bar checkers
    // my bar checkers start slightly above the center of the bar and each successive one goes up
    // opponent's bar checkers start slightly below the center of the bar and each successive one goes down
    drawBarCheckers(ctx, board[25], -1);
    drawBarCheckers(ctx, board[0], 1);

    // draw dice
    if (dice1 > 0) {
	drawDice(ctx, dice1, dice2, turn);
    }

    if (!crawford) {
        ctx.strokeStyle = "black";
        var cubeVertical;
	var cubeHorizontal;
	var cubeValueToShow;
        if (wasDoubled) {
	    cubeValueToShow = cubeValue * 2;
	    cubeVertical = (boardHeight - doublingCubeSize) / 2;
	    if (wasDoubled > 0) {  // opponent doubled player
		cubeHorizontal = (barLeftBoundary - doublingCubeSize) / 2;
	    } else {  // player doubled opponent
		cubeHorizontal = (barRightBoundary + boardWidth - doublingCubeSize) / 2;
	    }
	} else {
	    cubeValueToShow = cubeValue;
	    cubeHorizontal = boardWidth + doublingCubeOffset;
	    if (iMayDouble && opponentMayDouble) { // centered cube
		cubeVertical = (boardHeight - doublingCubeSize) / 2;
	    } else if (iMayDouble) {
		cubeVertical = boardHeight - doublingCubeSize;
	    } else if (opponentMayDouble) {
		cubeVertical = 2;
	    }
	}
        ctx.strokeRect(cubeHorizontal, cubeVertical, doublingCubeSize, doublingCubeSize);
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText(cubeValueToShow, cubeHorizontal + (doublingCubeSize - ctx.measureText(cubeValueToShow).width) / 2, cubeVertical + doublingCubeSize/2 + 4);
    }

    if (myPiecesOff > 0) {
	ctx.fillStyle = playerColor;
	var checkerOffHorizontal = boardWidth + doublingCubeOffset + doublingCubeSize / 2;
	var checkerOffVertical = boardHeight - doublingCubeSize - gapBetweenCheckers - checkerDiameter / 2;
	ctx.beginPath();
	ctx.arc(checkerOffHorizontal, checkerOffVertical, checkerDiameter / 2, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = "white";
	ctx.font = "14px sans-serif";
	ctx.fillText(myPiecesOff, checkerOffHorizontal - ctx.measureText(myPiecesOff).width/2, checkerOffVertical + 4);
    }

    if (opponentPiecesOff > 0) {
	ctx.fillStyle = opponentColor;
	var checkerOffHorizontal = boardWidth + doublingCubeOffset + doublingCubeSize / 2;
	var checkerOffVertical = 2 + doublingCubeSize + gapBetweenCheckers + checkerDiameter / 2;
	ctx.beginPath();
	ctx.arc(checkerOffHorizontal, checkerOffVertical, checkerDiameter / 2, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = "white";
	ctx.font = "14px sans-serif";
	ctx.fillText(opponentPiecesOff, checkerOffHorizontal - ctx.measureText(opponentPiecesOff).width/2, checkerOffVertical + 4);
    }

    if (resignationOffered) {
	var resignationFlagHorizontal;
	if (turn == 1) {  // player offered resignation to opponent
	    resignationFlagHorizontal = barLeftBoundary / 2;
	} else {  // opponent offered resignation to player
	    resignationFlagHorizontal = (barRightBoundary + boardWidth)/2;
	}

	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.moveTo(resignationFlagHorizontal, (boardHeight - resignFlagPoleLength)/2);
	ctx.lineTo(resignationFlagHorizontal, (boardHeight + resignFlagPoleLength)/2);
	ctx.stroke();
	ctx.strokeRect(resignationFlagHorizontal, (boardHeight - resignFlagPoleLength)/2, resignFlagSize, resignFlagSize);
	ctx.fillStyle = "black";
	ctx.font = "14px sans-serif";
	ctx.fillText(resignationValue, resignationFlagHorizontal + resignFlagSize / 2 - ctx.measureText(resignationValue).width / 2,  (boardHeight - resignFlagPoleLength + resignFlagSize)/2 + 4);
    }

    var info = document.getElementById("info");
    info.innerHTML = "Score: " + myScore + "-" + opponentScore + (matchLength > 0 ? " Match to: " + matchLength : "") + (crawford ? " Crawford" : "");
    var instructions = document.getElementById("instructions");
    if (turn == 0) {
	instructions.innerHTML = "";
    } else {
	if (dice1 > 0) {
	    instructions.innerHTML = "Enter your move below";
	    document.getElementById("roll").disabled = true;
	    document.getElementById("double").disabled = true;
	    document.getElementById("accept").disabled = true;
	    document.getElementById("reject").disabled = true;
	    document.getElementById("beaver").disabled = true;
	    document.getElementById("resign").disabled = false;
	} else if (wasDoubled) {
	    instructions.innerHTML = "Accept or reject the double";
	    document.getElementById("roll").disabled = true;
	    document.getElementById("double").disabled = true;
	    document.getElementById("accept").disabled = false;
	    document.getElementById("reject").disabled = false;
	    document.getElementById("beaver").disabled = (matchLength > 0);
	    document.getElementById("resign").disabled = true;
        } else if (resignationOffered) {
	    instructions.innerHTML = "Accept or reject the resignation";
	    document.getElementById("roll").disabled = true;
	    document.getElementById("double").disabled = true;
	    document.getElementById("accept").disabled = false;
	    document.getElementById("reject").disabled = false;
	    document.getElementById("beaver").disabled = true;
	    document.getElementById("resign").disabled = true;
	} else {
	    instructions.innerHTML = "Roll or double";
	    document.getElementById("roll").disabled = false;
	    document.getElementById("double").disabled = false;
	    document.getElementById("accept").disabled = true;
	    document.getElementById("reject").disabled = true;
	    document.getElementById("beaver").disabled = true;
	    document.getElementById("resign").disabled = false;
	}
    }
}

function intermediatePoint(a, b, t) {
    return (1-t)*a + b*t;
}
/*
  -----
 |     |
 |  .  |
 |     |
  -----     
 */
function drawDieCenterDot(ctx, dieStartPoint) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.5),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.fill();
}

/*
  -----
 | .   |
 |     |
 |    .|
  -----     
 */
function drawDieMainDiagonalDots(ctx, dieStartPoint) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.25),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.75),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.fill();
}

/*
  -----
 |    .|
 |     |
 | .   |
  -----     
 */
function drawDieAntiDiagonalDots(ctx, dieStartPoint) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.25),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.75),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.fill();
}

/*
  -----
 |     |
 | .  .|
 |     |
  -----     
 */
function drawDieMiddleDots(ctx, dieStartPoint) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.25),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.arc(
	    intermediatePoint(dieStartPoint, dieStartPoint + dieSize, 0.75),
	    intermediatePoint(diceVerticalStartPoint, diceVerticalStartPoint + dieSize, 0.5),
	    dieDotRadius, 0, 2*Math.PI);
    ctx.fill();
}


function drawDie(ctx, dieStartPoint, color, dieValue) {
    ctx.fillStyle = color;
    ctx.fillRect(dieStartPoint, diceVerticalStartPoint, dieSize, dieSize);
    switch (dieValue) {
       case 1:
	   drawDieCenterDot(ctx, dieStartPoint);
           break;
       case 2:
           drawDieMainDiagonalDots(ctx, dieStartPoint);
           break;
       case 3:
           drawDieMainDiagonalDots(ctx, dieStartPoint);
           drawDieCenterDot(ctx, dieStartPoint);
           break;
       case 4:
           drawDieMainDiagonalDots(ctx, dieStartPoint);
           drawDieAntiDiagonalDots(ctx, dieStartPoint);
           break;
       case 5:
           drawDieMainDiagonalDots(ctx, dieStartPoint);
           drawDieAntiDiagonalDots(ctx, dieStartPoint);
	   drawDieCenterDot(ctx, dieStartPoint);
	   break;
       case 6:
           drawDieMainDiagonalDots(ctx, dieStartPoint);
           drawDieAntiDiagonalDots(ctx, dieStartPoint);
           drawDieMiddleDots(ctx, dieStartPoint);
           break;

       default:
           break;
    } 

}

function drawDice(ctx, n1, n2, turn) {
    var color, leftDieStartPoint, rightDieStartPoint;
    if (turn == 1) {
	color = playerColor;
	leftDieStartPoint = playerLeftDieStartPoint;
	rightDieStartPoint = playerRightDieStartPoint;
    } else {
	color = opponentColor;
	leftDieStartPoint = opponentLeftDieStartPoint;
	rightDieStartPoint = opponentRightDieStartPoint;
    }

    drawDie(ctx, leftDieStartPoint, color, n1);
    drawDie(ctx, rightDieStartPoint, color, n2);
}
