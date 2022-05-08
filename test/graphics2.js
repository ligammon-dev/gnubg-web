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
                enabled: true,
                showGhost: true,
                deleteOnDropOff: true
            },

          turnColor: 'black',
           events: {
             select: tryRoll(ground) 
           },
          movable: {
            events: { after: printLegalMoves(ground) } ,
            color: 'black',
            dests:  new Map([]),
            showDests: true,
            free: false
          }
        });

var legalMoves = new Array([]);

function getTotal(moves)  {
    var sum = lastDice1 == lastDice2 ? 4*lastDice1 : lastDice1+lastDice2;
    //console.log("sum",sum);
    moves.forEach(m => {
        //console.log("M",m);
        sum -= ( parseInt(m.split('/')[0]) - parseInt(m.split('/')[1]));
    });
    //console.log("sum2",sum);
    return (sum == 0);
}

function setLegalMoves(lastMove) {
    //if (lastMove == "") return;
    //console.log("last move",ground.state.lastGammonMove);
    if (getTotal(ground.state.lastGammonMove)) {

        return;
    }
    //console.log ("length of legalmoves", legalMoves.length);
     legalMoves.every(el => {
        //console.log("legalMove is ",el);
                if (el.length > 0) {
                    //const result =  ground.state.lastGammonMove.every(val => el.includes(val));
                    //if (result ) {//
                        //console.log("super", el, ground.state.lastGammonMove );
                        //const result =  ground.state.lastGammonMove.every(val => el.includes(val));
                        //console.log(result);

                    //if (el.some(r=> lastMove.indexOf(r) >= 0)) {
                         if (el.length == ground.state.lastGammonMove.length) {
                        //     // select dice squares
                             //console.log("DONE", el, lastMove );
                             //return false;
                         } else {
                            //var v = el;
                            var v = [...el];
                            ground.state.lastGammonMove.forEach (el2 => {
                                const index = v.indexOf(el2);
                                 if (index > -1) {
                                    v.splice(index, 1);
                                } else {
                                    v = [];
                                }
                            });
                            //console.log("adding move", v)
                            v.forEach(el3 => {
                                //console.log("Adding ground moves", el3);
                                 addGroundMove(ground, el3.substr(0, el3.indexOf("/")), el3.substr(el3.indexOf("/") + 1));
                            });


                            //el.
                            // el.forEach(el2 => {
                            //     if (!lastMove.includes(el2)) {
                            //         addGroundMove(ground, el2.substr(0, el2.indexOf("/")), el2.substr(el2.indexOf("/") + 1));
                            //         console.log("Adding ground moves");
                            //     }
                            // });
                         }
                    //}
                    //console.log("Print legal moves", d1, d2);
                    //console.log(el);
                    //console.log();
                    //console.log(el);        
                }
                return true;
            });
}

export function printLegalMoves(Api) {
    return (orig, dest, metadata) => {
        //console.log("Gammon moves: ", Api.state.lastGammonMove);
        if (legalMoves) {
            //const p1 = square2pip(Api.state.lastMove[0]);
            //const p2 = square2pip(Api.state.lastMove[1]);
            const lastMove = Api.state.lastGammonMove;
            setLegalMoves(lastMove);
        }
    }
}

window.afterRoll = function(rawHint) {
    console.log(legalMoves);
    setLegalMoves("");

}

window.getRolls = function(rawHint) {
    var moves = rawHint.split('.')[1].split('   ')[1].trim().split(' ');
    var cm = cleanMoves(moves);
    //console.log("moves length", cm.length);
    legalMoves.push(cm);
    if (lastDice1 != lastDice2) {
        if (cm.length == 1 && (parseInt(cm[0].split('/')[0]) -  parseInt(cm[0].split('/')[1]) == (lastDice1 + lastDice2))) {
            //console.log("big move", lastDice1, lastDice2, moves);
            let m0 = cm[0].split('/')[0];
            var m1 = parseInt(m0) - lastDice1;
            var m2 = parseInt(m0) - lastDice2;
            let m3 = cm[0].split('/')[1];
            // TODO check if legal
            legalMoves.push([m0 + '/' + m1, '' + m1 + '/' + m3]);
            legalMoves.push([m0 + '/' + m2, '' + m2 + '/' + m3]);

        }
    } else { // TODO sooo ugly...
        // gap of 4x
        if (cm.length == 1 && (parseInt(cm[0].split('/')[0]) -  parseInt(cm[0].split('/')[1]) == (4* + lastDice1))) {
            //add 7 things
            let m0 = cm[0].split('/')[0];
            var m1 = parseInt(m0) - lastDice1;
            var m2 = m1 - lastDice1;
            var m3 = m2 - lastDice1;
            let m4 = cm[0].split('/')[1];
            legalMoves.push([m0 + '/' + m1, '' + m1 + '/' + m4]);
            legalMoves.push([m0 + '/' + m1, '' + m1 + '/' + m2, '' + m2 + '/' + m4]);
            legalMoves.push([m0 + '/' + m1, '' + m1 + '/' + m2, '' + m2 + '/' + m3, '' + m3 + '/' + m4]);
            legalMoves.push([m0 + '/' + m1, '' + m1 + '/' + m3, '' + m3 + '/' + m4]);
            legalMoves.push([m0 + '/' + m2, '' + m2 + '/' + m3, '' + m3 + '/' + m4]);
            legalMoves.push([m0 + '/' + m2, '' + m2 + '/' + m4]);
            legalMoves.push([m0 + '/' + m3, '' + m3 + '/' + m4])

        } else {

             cm.forEach(m => {
                 const n0 = parseInt(m.split('/')[0]);
                 const n1 = parseInt(m.split('/')[1]);
                 if (Math.abs(n0-n1) == 3*lastDice1) {
                    //console.log("3x cm, m", cm,m);
            //         //var therest = '';
                    const m0 = n0;
                    const m1 = m0 - lastDice1;
                    const m2 = m1 - lastDice1;
                    const m3 = m2 - lastDice1;
                    const index2 = cm.indexOf(m);
                    var other = [...cm];
                    other.splice(index2, 1);
                    //console.log("other", other, [...cm],  [...cm].splice(index2, 1), index);
                    let a = ['' + m0 + '/' + m1, '' + m1 + '/' + m2, '' + m2 + '/' + m3, ...other];
                    let b = ['' + m0 + '/' + m1, '' + m1 + '/' + m3, ...other];
                    let c = ['' + m0 + '/' + m2, '' + m2 + '/' + m3, ...other];
                    //console.log("a b c",a,b,c);
                     legalMoves.push(a, b, c);
                     //legalMoves.push(cm.splice(index, 1).concat(['' + m0 + '/' + m1, '' + m1 + '/' + m3]));
                     //legalMoves.push(cm.splice(index, 1).concat(['' + m0 + '/' + m2, '' + m2 + '/' + m3]));

                 } else if (Math.abs(n0-n1) == 2*lastDice1) {
                    // console.log("2x cm, m", cm,m);

                     const m0 = n0;
                     const m1 = m0 - lastDice1;
                     const m2 = m1 - lastDice1;
                      //if (cm.length == 1) {
                     const index3 = cm.indexOf(m);
                     var other2 = [...cm];
                     other2.splice(index3, 1);
                     legalMoves.push(['' + m0 + '/' + m1, '' + m1 + '/' + m2, ...other2]);
                     if (cm.length == 2 && Math.abs(parseInt(cm[1-index3].split('/')[0]) - parseInt(cm[1-index3].split('/')[1])) == 2*lastDice1) {
                        const s0 = parseInt(cm[1-index3].split('/')[0]);
                        const s1 = s0 - lastDice1;
                        const s2 = s1 - lastDice1;
                        //if (cm.length == 1) {
                        //const index = cm.indexOf(m);

                         legalMoves.push(['' + m0 + '/' + m1, '' + m1 + '/' + m2, '' + s0 + '/' + s1, '' + s1 + '/' + s2]);
                     }

                 }

            });
        }
    }
}

function addGroundMove(g, p1, p2) {
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
    if (g.state.movable.dests.get(squares1[0])?.includes(squares2[0])) {
        //console.log("skipping add");
        //console.log(g.state);
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
            g.state.movable.dests.set(el1, squares2);
        }
    });
    //g.set({ movable: { dests: m } });
}

function square2pip(square) {
    const x = square[0].charCodeAt() - 'a'.charCodeAt();
    const y = square[1].charCodeAt() - '0'.charCodeAt();
    //console.log("x, y: ", x, ",",y);
    if (y >= 7) {
        return (24-x) + (x/7>>0);
    }
    return (x+1) - (x/7>>0);
}

function pip2squares(pip) {
    var r = new Array();
    if (parseInt(pip) > 24) {
        r.push("g6");
        r.push("g8");

    } else if (parseInt(pip) == 0) {
        r.push("a0", "b0", "c0", "d0", "e0", "f0");
    } else {
        if (parseInt(pip) <= 12) {
            let c = String.fromCharCode('a'.charCodeAt() + (parseInt(pip)-1) + (parseInt(pip)/7>>0));
            for (var i = 1; i <= 6; i++) {
                r.push(c + i);
            }
        } else {
            let c2 = String.fromCharCode('a'.charCodeAt() + (24-parseInt(pip)) +  (((25-parseInt(pip))/7)>>0) );
            for (var j = 8; j <= 13; j++) {
                r.push(c2 +  String.fromCharCode('0'.charCodeAt() + j));
            }
        }
    }
   return r;
}


export function tryRoll(Api) {
    return (orig, dest) => {
        //console.log("TURN", Api.state);
        if (orig == "c7" || orig == "d7" || orig == "j7" || orig == "k7") {
            if (Api.state.turnColor == 'white') {
                Api.state.turnColor = 'black';
                if (legalMoves.length != 0) {
                    legalMoves = [];
                }
                ground.state.lastGammonMove = [];

                gnubgCommand("roll");
                
                legalMoves.forEach(el => {
                    if (el.length > 0) {
                        //console.log(el);
                        el.forEach(el2 => {
                             addGroundMove(ground, el2.substr(0, el2.indexOf("/")), el2.substr(el2.indexOf("/") + 1));
                        })
                    }
                });
            } else { 
                // already rolled, make move
                gnubgCommand("move " + ground.state.lastGammonMove.join(" "));
                //ground.movable.dests.clear();
            }

        // undo
        } else if (orig == "m7") {
            ground.state.lastGammonMove = [];
            legalMoves.forEach(el => {
                if (el.length > 0) {
                    el.forEach(el2 => {
                         addGroundMove(ground, el2.substr(0, el2.indexOf("/")), el2.substr(el2.indexOf("/") + 1));
                    })
                }
            });

            // sync gnubg state with gammonground state
            gnubgCommand("show board");
        } else {
            if (isPip(orig) && !ground.state.pieces.has(orig)) {
                let p2 = square2pip(orig) -1;
                let c1 = ground.state.checkerCounts[p2+(p2/6>>0)-(p2/12>>0)];
                if (c1 > 0 && c1 < 6) {
                    //ground.selectSquare(orig.charAt(0) + String.fromCharCode(orig[1].charCodeAt() - '0'.charCodeAt() + c1));
                    
                    if (p2 > 12) {
                        ground.selectSquare(orig.charAt(0) + String.fromCharCode( '0'.charCodeAt() + (12-c1)));
                    } else {
                        ground.selectSquare(orig.charAt(0) + String.fromCharCode( '0'.charCodeAt() + c1));
                    }
                    //ground.draggable.current = {}

                }
            }
        }

    }
}

function cleanMoves(a) {
    let b = new Array();
    //console.log("A LENGTH ", a.length);
    // if (a.length == 1)
    a.forEach(el => {
        var repeat = 1;
        if (el.includes('(')) {
            repeat = parseInt(el.charAt(el.indexOf('(')+1));

        }
        var c = el.split('(')[0].replaceAll('off','0').replaceAll('bar','25').replaceAll('*','').split('/');

        for (var j = 0; j < repeat; j++) {
            //let move = (c.slice(0,2).join('/'));
            b.push(c[0] + '/' + c[1]);
            if (c.length > 2) {
                for (var i = 1; i+2 <= c.length; i++) {
                    //console.log("ADDING WEIRD MOVE", c[i] + '/' + c[i+1], a);
                     b.push(c[i] + '/' + c[i+1]);
                }
            }
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
        //console.log(val[0] + i);
    }
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
         //console.log("TURN IS ",turn);

   if (turn == 1) {
      //console.log("TURN IS 1");
     

       // fillCommandBuffer(commandBuffer, "hint 200");
       //  Module._run_command(commandBuffer);
            //gnubgCommand('hint 200');
   }
    var backgammonBoard = document.getElementById("backgammonBoard");
    //var ground = Chessground(document.getElementById('chessground'), config);
    //console.log(boardString);
    if (dice1 > 0) {

        lastDice1 = dice1;
        lastDice2 = dice2;
    }

    //console.log(lastDice1, lastDice2);
   // var legalMoves = new Map([]);

   // legalMoves.set('a1', ['f1','f2','f3','f4', 'f5', 'f6']);
  // ground.set({fen: boardString});
    if (dice1 <= 0) {
        //ground.set({fen: boardString});
        //console.log("gets here", boardString[33]);
         // var turn = parseInt(boardString[32]);
        //ground.newPiece(pos2key([3,6]), {role: 'd1', color:  turn > 0 ? 'black' : 'white',});
        ground.state.turnColor = 'white';
        ground.newPiece({role:'d'+lastDice1, color:'white'}, 'c7');
        ground.newPiece({role:'d'+lastDice2, color:'white'}, 'd7');
        //selectSquare('c7');
         ground.newPiece({role:'undo', color:'black'}, 'd7');
        //boardString[33] = lastDice1;
        //boardString[34] = lastDice2;
   } else {
       ground.set({fen: boardString});

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
	    instructions.innerHTML = "Move your checkers";
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
