
     function arrayToHeap(typedArray){
       var numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
       var ptr = Module._malloc(numBytes);
       var heapBytes = Module.HEAPU8.subarray(ptr, ptr + numBytes);
       heapBytes.set(typedArray);
       return heapBytes;
     }

     function makeCommandBuffer() {
       var rawBuffer = new ArrayBuffer(1000);
       var heapView = new Uint8Array(rawBuffer);
       return arrayToHeap(heapView).byteOffset;
     }

     function fillCommandBuffer(buffer, str) {
       for (var i=0; i<str.length; i++) {
          Module.setValue(buffer + i, str.charCodeAt(i), "i8");
	}
       Module.setValue(buffer + str.length, 0, "i8");	
     }

     commandBufferInititalized = false;
     var commandBuffer = 0;
     function gnubgCommand(command) {
       if (!commandBufferInititalized) {
	  commandBuffer = makeCommandBuffer();
          commandBufferInititalized = true;
       }
       if (command.startsWith("b/") || command.startsWith("bar/") || ["1","2","3","4","5","6","7","8","9"].includes(command.substring(0,1))) {  // assume it's a move
	  command = "move " + command;
       }
       fillCommandBuffer(commandBuffer, command);
       writeLog("=> " + command);
       Module._run_command(commandBuffer);
       window.setTimeout(doNextTurn, 0);
     }	

     lastLogLine = "";  // needed for stdin prompts from gnubg's GetInput function in gnubg.c
     function writeLog(str) {
        if (str.startsWith("falling back to ArrayBuffer instantiation") || str.startsWith("wasm streaming compile failed") || str.startsWith("file packager has copied file data into memory")) { // suppress various startup messages not from gnubg, put it into console instead
	   console.log(str);
        } else {
	  if (str.startsWith("board:") || str.includes("offers to resign")) {
             updateBoard(str);
             window.setTimeout(doNextTurn, 1200);
          }
          if (str.match(/^\s\s+[0-9]{0,2}\.\s/g)) {
            window.getRolls(str);

          }
	  if (!str.startsWith("board:")) {
	     lastLogLine = str;
             var gnubg_log = document.getElementById("gnubg_log");
	     gnubg_log.textContent += str;
             gnubg_log.textContent += '\n';
	     gnubg_log.scrollTop = gnubg_log.scrollHeight;
          }
        }
     }

     function doNextTurn() {
        Module._doNextTurn();
     }

     window.addEventListener("load", function () {
        var form = document.getElementById("command_form");
	form.addEventListener("submit", function (event) {
	   event.preventDefault();
	
	   var command_text_element = document.getElementById("command_text");
	   var command = command_text_element.value;
	   gnubgCommand(command);
	   command_text_element.value = "";

	});

        // draw an empty board on initial load

	window.drawBoard(true);
     });

     lastTurn = 0;
     lastBoard = "";
     resignationOfferPending = false;
     resignationValue = 0;





     function updateBoard(rawBoard) {
	   if (resignationOfferPending) {  // Ignore board update immediately after resignation offer, since nothing has changed and we don't want to remove the "Accept or reject the resignation" message
		resignationOfferPending = false;
		resignationValue = 0;
		return;
           }
           var resignationOffered = false;
           if (rawBoard.includes("offers to resign")) {
	       resignationOffered = true;
	       resignationOfferPending = true;	
	       if (rawBoard.endsWith("a single game.")) {
	           resignationValue = 1;
               } else if (rawBoard.endsWith("a gammon.")) {
                   resignationValue = 2;
               } else if (rawBoard.endsWith("a backgammon.")) {
                   resignationValue = 3;
               } else {
                   console.error("Unknown resignation value " + resignationValue);
               }
               rawBoard = lastBoard; 
           }

           var rawBoardSplit = rawBoard.split(":");
           var myName = rawBoardSplit[1];
           var opponentName = rawBoardSplit[2];
           var boardString = rawBoardSplit.slice(6, 6+26);
           var board = boardString.map(function(x) { return parseInt(x); });
           var matchLength = parseInt(rawBoardSplit[3]);
           var myScore = parseInt(rawBoardSplit[4]);
           var opponentScore = parseInt(rawBoardSplit[5]);
           var turn = parseInt(rawBoardSplit[32]);
           var dice1 = parseInt(rawBoardSplit[33]);
           var dice2 = parseInt(rawBoardSplit[34]);
           var cubeValue = parseInt(rawBoardSplit[37]);
           var iMayDouble = parseInt(rawBoardSplit[38]);
           var opponentMayDouble = parseInt(rawBoardSplit[39]);
           var wasDoubled = parseInt(rawBoardSplit[40]);
           var myPiecesOff = parseInt(rawBoardSplit[45]);
           var opponentPiecesOff = parseInt(rawBoardSplit[46]);
           var crawford = parseInt(rawBoardSplit[51]);
	
	   if (dice1 > 0 && turn != lastTurn) {           
              var name = (turn == 1) ? myName : opponentName;
              writeLog(name + " rolls " + dice1 + " " + dice2);
              lastTurn = turn;
           }

           window.drawBoard(false,
              board,
              rawBoard,
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
	      resignationValue);
           lastBoard = rawBoard;
     }

    function newSession() {
       gnubgCommand("new session");
    }

    function newMatch(matchLength) {
         gnubgCommand('set automatic roll off');
//
//        // 0 ply for hints, used to get legal moves
        gnubgCommand('set evaluation chequerplay evaluation plies 0');
       setPlayerAdvanced();
        


       gnubgCommand("new match " + matchLength);
    }

    function roll() {
       gnubgCommand("roll");
    }

    function double() {
       gnubgCommand("double");
    }

    function accept() {
       gnubgCommand("accept");
    }

    function reject() {
       gnubgCommand("reject");
    }

    function beaver() {
       gnubgCommand("beaver");
    }

    function resign(val) {
       gnubgCommand("resign " + val);
    }


    function setPlayerBad(val) {
      gnubgCommand('set player 0 chequer evaluation plies 0');
      gnubgCommand('set player 0 chequer evaluation prune off');
      gnubgCommand('set player 0 chequer evaluation noise '+val);
      gnubgCommand('set player 0 cube evaluation plies 0');
      gnubgCommand('set player 0 cube evaluation prune off');
      gnubgCommand('set player 0 cube evaluation noise ' + val);
      gnubgCommand('save settings');
   }
    function setPlayerBeginner() {
      setPlayerBad(0.06);
    }
   function setPlayerCasual() {
      setPlayerBad(0.05);
    }
   function setPlayerIntermediate() {
       setPlayerBad(0.04);
    }
   function setPlayerAdvanced() {
      setPlayerBad(0.015);
    }
   function setPlayerExpert() {
      setPlayerBad(0);
    }
    function setPlayerWorldClass() {
     gnubgCommand('set player 0 chequer evaluation plies 2');
     gnubgCommand('set player 0 chequer evaluation prune on');
     gnubgCommand('set player 0 chequer evaluation noise 0.000');
     gnubgCommand('set player 0 movefilter 1 0 0 8 0.160');
     gnubgCommand('set player 0 movefilter 2 0 0 8 0.160');
     gnubgCommand('set player 0 movefilter 3 0 0 8 0.160');
     gnubgCommand('set player 0 movefilter 3 2 0 2 0.040');
     gnubgCommand('set player 0 movefilter 4 0 0 8 0.160');
     gnubgCommand('set player 0 movefilter 4 2 0 2 0.040');
     gnubgCommand('set player 0 cube evaluation plies 2');
     gnubgCommand('set player 0 cube evaluation prune on');
     gnubgCommand('set player 0 cube evaluation noise 0.000');
     gnubgCommand('save settings')
    }
    const fakeDownload = document.createElement('a');
    fakeDownload.style.display = 'none';
    function download(filename) {
       const data = new Blob([FS.readFile(filename, {encoding: 'utf8'})]);
       const url = window.URL.createObjectURL(data);
       fakeDownload.href = url;
       fakeDownload.download = filename;
       document.body.appendChild(fakeDownload);
       fakeDownload.click();
       window.URL.revokeObjectURL(url);
       document.body.removeChild(fakeDownload);
    }

    const fakeUpload = document.createElement('input');
    fakeUpload.type = 'file';
    fakeUpload.multiple = true;
    fakeUpload.style.display = 'none';						    
    fakeUpload.addEventListener("change", function() {
       for (var i=0; i < this.files.length; i++) {
           const file = this.files.item(i);
	   console.log('Uploading ' + file.name);
	   const fileReader = new FileReader();
	   fileReader.onload = function(e) {
	      const arrayBuffer = e.target.result;
	      const data = new Uint8Array(arrayBuffer);
	      FS.writeFile(file.name, data);
	      writeLog('Successfully uploaded ' + file.name);
	   }
	   fileReader.onerror = function() {
	      writeLog('Could not upload ' + file.name);
	   }
	   fileReader.readAsArrayBuffer(file);
       }
       document.body.removeChild(this);
    }, false);

    function upload() {
       document.body.appendChild(fakeUpload);
       fakeUpload.click();
    }
    inputBuffer = "";
    inputBufferPointer = 0;
    var Module = { 
       preRun: [
        function () {
          FS.init( 
             function stdin() {
	        if (inputBuffer == "") {
                    inputBuffer = window.prompt(lastLogLine);
	            inputBuffer += '\n';
                    inputBufferPointer = 1;
		    return inputBuffer.charCodeAt(0);
                } else {
                   if (inputBufferPointer < inputBuffer.length) {
                       var code = inputBuffer.charCodeAt(inputBufferPointer);
		       ++inputBufferPointer;
		       return code;
  	           } else {
		       inputBuffer = "";
		       return null;
                   }
                }
             });
       }],
       print: writeLog,
       printErr: writeLog,
       onRuntimeInitialized: function() {
         Module._start();
    }}
