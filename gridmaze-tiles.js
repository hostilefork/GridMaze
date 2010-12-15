// GridMaze "module pattern" object helps us separate the "public"
// interface from the "private" implementation:
//
//     http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
//
// Long story short: to declare something accessible by a web
// page or other JavaScript library, we'd say inside the loading code:
//
//     GridMaze.publicFunction = function() { ... };
//
// For a private function, we declare it inside the scope of our loading
// handler without ever doing such an assignment.
//
//     function privateFunction() { ... }
//
// By doing it this way, code outside of this file cannot directly call
// one of the private functions.

var GridMaze = {};

(function() {

/**************************\
** Initialize Wall Arrays **
\**************************/

function create2DArray(columns, rows, value) {
	var arr = [];
	for (var c = 0; c < columns; c++) {
		arr[c] = [];
		for (var r = 0; r < rows; r++) {
			arr[c][r] = value;
		}
	}
	return arr;
}

function createRandomized2DArray(columns, rows) {
	var arr = [];
	for (var c = 0; c < columns; c++) {
		arr[c] = [];
		for (var r = 0; r < rows; r++) {
			var value = Math.round(Math.random() + 0.3);
			if (value == 1) {
				arr[c][r] = true;
			} else {
				arr[c][r] = false;
			}
		}
	}
	return arr;
}



/**********************\
** Initializing Tiles **
\**********************/

var Tiles = [];

var activeTileID = 0;

function Tile(canvas, walls) {
	this.canvas = canvas;
	this.walls = walls;
	this.updateWalls = function(wallsArray) {
		debugOut('newhwall', 
				'0:[' + wallsArray[0][0] + ']' +
				'1:[' + wallsArray[0][1] + ']' +
				'2:[' + wallsArray[0][2] + ']');
		debugOut('newvwall',
				'0:[' + wallsArray[1][0] + ']' +
				'1:[' + wallsArray[1][1] + ']' +
				'2:[' + wallsArray[1][2] + ']');
		
		this.walls = wallsArray;
		
		debugOut('newTileHwall',
				'0:[' + this.walls[0][0] + ']' +
				'1:[' + this.walls[0][1] + ']' +
				'2:[' + this.walls[0][2] + ']');
		debugOut('newTileVwall',
				'0:[' + this.walls[1][0] + ']' +
				'1:[' + this.walls[1][1] + ']' +
				'2:[' + this.walls[1][2] + ']');
	};
	this.getCanvas = function() {
		return canvas;
	};
	this.getWalls = function() {
		return walls;
	};
	this.getHorizontalWalls = function() {
		return walls[0];
	};
	this.getVerticalWalls = function() {
		return walls[1];
	};
	this.setHorizontalWalls = function(wallsArrayH) {
		this.walls[0] = wallsArrayH;
	};
	this.setVerticalWalls = function(wallsArrayV) {
		this.walls[1] = wallsArrayV;
	};
	this.toString = function() {
		return "I exist";
	};
}

function createTileArray() {
// get array of all canvases, combine each with a randomized walls array

	var arr = [];
	var canvases = [];
	canvases = document.getElementsByTagName("canvas");
	debugOut('output2', "canvases length is " + canvases.length);
	
	for (var c = 0; c < canvases.length; c++) {
		var walls = [
			createRandomized2DArray(3, 4),
			createRandomized2DArray(3, 4)
		];
		arr[c] = new Tile(canvases[c], walls);
	}
	
	return arr;
}



/*************************\
** Initializing Canvases **
\*************************/

var isGridEditable = false;

GridMaze.setEditTilesEnvironment = function() {
// called onload - single Tile canvas, make walls editable
	
	Tiles = createTileArray();
	
	activeTileID = 0;

	canvas.addEventListener("click", clickToToggleWall, false);
	canvas.addEventListener("mousemove", updateHoverCoordinates_debug, false);
	
	drawActiveCanvas();
};

GridMaze.setMultigridEnvironment = function() {
// called onload - multiple Tile canvases
	
	Tiles = createTileArray();
	
	if(Tiles) {
		activeTileID = 0;
	}
	
	// http://www.cjboco.com/blog.cfm/post/javascript-and-i-need-some-closure
	// (putting this outside the for loop makes jslint happier)
	function makeClickFunctionForTile(tile) {
		return function() {
			setClickedTileActive(tile);
		};
	}
	
	for(var t=0; t<Tiles.length; t++) {
		var canvas = Tiles[t].getCanvas();

		canvas.addEventListener("mousedown", makeClickFunctionForTile(t), false);
		canvas.addEventListener("mousemove", updateHoverCoordinates_debug, false);

		activeTileID = t;
		drawActiveCanvas();
	}	
};

function getActiveContext() {
	var canvas;
	
	if(Tiles[activeTileID].getCanvas()) {
		// debugOut('output', "Active Tile = " + activeTileID);
		canvas = Tiles[activeTileID].getCanvas();
	} else {
		debugOut('output', "No canvas!");
		canvas = document.getElementById("canvas00");
	}
	
	var ctx = canvas.getContext("2d");	
	return ctx;
}

function getActiveCanvas() {
	var canvas;
	
	if(Tiles[activeTileID].getCanvas()) {
		// debugOut('output', "Active Tile = " + activeTileID);
		return Tiles[activeTileID].getCanvas();
	} else {
		debugOut('output', "No canvas!");
		return document.getElementById("canvas00");
	}
}



/**********************************\
** Draw Current walls and Squares **
\**********************************/

function drawActiveCanvasCore(erase) {
	
	var canvas = getActiveCanvas();
	var ctx = canvas.getContext("2d");
	
	// set fillStyle to white and fill canvas background
	if (erase) {
		ctx.fillStyle = "rgb(255,255,255)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	// generate 3x3 array describing whether tiles are enclosed (t) or not (f)
	var filledIn = calculateSquaresArray();
	var squareSize = Math.round(canvas.width / 3) - 1;
	
	// use filledIn to draw each tile with correct color
	for (var x = 0; x < filledIn.length; x++) {
		for (var y = 0; y < filledIn.length; y++) {
			if (filledIn[x][y]) {
				ctx.fillStyle = "rgb(75,100,230)";
			} else {
				ctx.fillStyle = "rgb(235,235,235)";
			}
			ctx.fillRect(
					x * squareSize + 1,
					y * squareSize + 1,
					squareSize,
					squareSize);
		}
	}

	// set default wall color (med grey)
	var strokeColor = "rgb(200,200,200)";
	
	var walls = Tiles[activeTileID].getWalls();
	
	// use walls (HorizontalWall) to draw horizontal wall positions
	for (var xh = 0; xh < walls[0].length; xh++) {
		for (var yh = 0; yh < walls[0][0].length; yh++) {
			if (walls[0][xh][yh]) {
				strokeColor = "rgb(0,0,0)";
			} else {
				strokeColor = "rgb(200,200,200)";
			}
			drawWall(ctx, [0, xh, yh], squareSize, strokeColor);
		}
	}
	
	// use walls (VerticalWall) to draw vertical wall positions
	for (var xv = 0; xv < walls[1].length; xv++) {
		for (var yv = 0; yv<walls[1][0].length; yv++) {
			if (walls[1][xv][yv]) {
				strokeColor = "rgb(0,0,0)";
			} else {
				strokeColor = "rgb(200,200,200)";
			}
			drawWall(ctx, [1, xv, yv], squareSize, strokeColor);
		}
	}
	
	debugOut('horizontalwall',
			'0:[' + walls[0][0] + ']' +
			'1:[' + walls[0][1] + ']' +
			'2:[' + walls[0][2] + ']');
	debugOut('verticalwall',
			'0:[' + walls[1][0] + ']' +
			'1:[' + walls[1][1] + ']' +
			'2:[' + walls[1][2] + ']');
}

function drawActiveCanvas() {
	drawActiveCanvasCore(false);
}

GridMaze.drawActiveCanvasHack = function() {
	// It should probably not be necessary to export the function
	// for drawing the active canvas outside the GridMaze object.
	drawActiveCanvas();
};

function drawWall(ctx, wall, length, color) {
	
	if (wall == []) {
		return;
	}
		
	ctx.strokeStyle = color;
	if (wall[0]) {
		ctx.strokeRect(wall[1] * length, wall[2] * length, length, 2);
	} else {
		ctx.strokeRect(wall[2] * length, wall[1] * length, 2, length);
	}
}

function calculateSquaresArray() {
// generate 3x3 array describing whether tiles are enclosed (t) or not (f)

	var result = create2DArray(3, 3, false);
	
	for (var x = 0; x < result.length; x++) {
		for (var y = 0; y < result[0].length; y++) {
			result[x][y] = isSurroundedByWalls(x, y);
		}	
	}	
	return result;
}

function isSurroundedByWalls(x, y) {
// determine whether a square is surrounded on all four sides by walls
	var hWalls = Tiles[activeTileID].getHorizontalWalls();
	var vWalls = Tiles[activeTileID].getVerticalWalls();
	
	var topAndBottom = hWalls[x][y] && hWalls[x][y + 1];
	var sides = vWalls[y][x] && vWalls[y][x + 1];
	return sides && topAndBottom;
}

function rotateWallsArrayLeft() {
// rotate the entire array of walls counter-clockwise, without drawing
// walls[0] = Horizontal, [1] = Vertical

	debugOut('output', 'Rotating walls Array counter-clockwise!');
	
	var oWalls = Tiles[activeTileID].getWalls();
	var newWalls = [oWalls[1], oWalls[0]];
	
	debugOut('oldhwall',
			'0:[' + oWalls[0][0] + ']' +
			'1:[' + oWalls[0][1] + ']' +
			'2:[' + oWalls[0][2] + ']');
	debugOut('oldvwall',
			'0:[' + oWalls[1][0] + ']' +
			'1:[' + oWalls[1][1] + ']' +
			'2:[' + oWalls[1][2] + ']');
	
	newWalls[1].reverse();
	
	for (var x = 0; x < newWalls[0].length; x++) {
		newWalls[0][x].reverse();
	}

	Tiles[activeTileID].setHorizontalWalls(newWalls[0]);
	Tiles[activeTileID].setVerticalWalls(newWalls[1]);
}

function rotateWallsArrayRight() {
// rotate the entire array of walls clockwise, without drawing
// walls[0] = Horizontal, [1] = Vertical

	debugOut('output', 'Rotating walls Array clockwise!');
	
	var oWalls = [];
	oWalls = Tiles[activeTileID].getWalls();
	var newWalls = [];
	newWalls = [oWalls[1], oWalls[0]];
	
	debugOut('oldhwall',
			'0:[' + oWalls[0][0] + ']' +
			'1:[' + oWalls[0][1] + ']' +
			'2:[' + oWalls[0][2] + ']');
	debugOut('oldvwall', 
			'0:[' + oWalls[1][0] + ']' +
			'1:[' + oWalls[1][1] + ']' +
			'2:[' + oWalls[1][2] + ']');
	
	newWalls[0].reverse();
	
	for (var x = 0; x < newWalls[1].length; x++) {
		newWalls[1][x].reverse();
	}
	
	Tiles[activeTileID].setHorizontalWalls(newWalls[0]);
	Tiles[activeTileID].setVerticalWalls(newWalls[1]);
}



/*******************\
** Image Animation **
\*******************/

GridMaze.rotateLeft = function() {
// called by "Rotate Left" button

	var ctx = getActiveContext();
	ctx.save();
	
	var img = new Image();
	img.src = Tiles[activeTileID].getCanvas().toDataURL("image/png");
	
	animatedRotateLeft(ctx, img);
	
	if(true || !inCatMode) {
		setTimeout(rotateWallsArrayLeft, 500);
	}
};

GridMaze.rotateRight = function() {
// called by "Rotate Right" button

	var ctx = getActiveContext();
	
	var img = new Image();
	img.src = Tiles[activeTileID].getCanvas().toDataURL("image/png");
	
	animatedRotateRight(ctx, img);

	if(true || !inCatMode) {
		setTimeout(rotateWallsArrayRight, 500);
	}
};

function animatedRotate(ctx, img, clockwise) {
	var steps = 5;
	
	var rotorClosure = function() {
		if (steps > 0) {
			// animated rotation for 75 degrees
			singleRotate(ctx, img, clockwise ? 15 : -15);
			window.setTimeout(rotorClosure, 100);
			steps--;
		} else {
			// re-drawing walls as the final "move"
			ctx.restore();
			drawActiveCanvas();
		}
	};
	
	ctx.save();
	
	// It may seem unnecessary to use a 0 setTimeout here and
	// you could just call rotorClosure() directly.  But
	// Firefox has an apparent bug in the HTML canvas.  Seems 
	// if get your image with getCanvas().toDataURL(...) and try
	// to draw it without first returning to the main loop there
	// can be problems.
	//
	// Some people work around this with try/catch:
	//
	// http://tinymce.moxiecode.com/punbb/viewtopic.php?pid=74384
	//
	// But accepting the timeout here since we're already queueing
	// an animation is the easiest thing to do, and it seems to work
	window.setTimeout(rotorClosure, 0);	
}

function animatedRotateLeft(ctx, img) {
	debugOut('output', 'Animating counter-clockwise rotation!');
	animatedRotate(ctx, img, false);
}

function animatedRotateRight(ctx, img) {
	debugOut('output', 'Animating clockwise rotation!');
	animatedRotate(ctx, img, true);
}

function singleRotate(ctx, img, angle) {

	//clear background to white first
	ctx.fillStyle = "rgb(255,255,255)";
	
	// additional pixel buffer to eliminate artifact lines
	ctx.fillRect(
			-1,
			-1,
			Tiles[activeTileID].getCanvas().width + 2, 
			Tiles[activeTileID].getCanvas().height + 2);
	
	ctx.translate(150, 150);
	ctx.rotate(angle * Math.PI / 180);
	ctx.translate(-150, -150);
	
	// If this fails on Firefox, see comments regarding rotorClosure
	// http://tinymce.moxiecode.com/punbb/viewtopic.php?pid=74384
	ctx.drawImage(img, 0, 0);
}



/******************\
** Event Handlers **
\******************/

function setClickedTileActive(t) {

	//var oldCanvasID = Tiles[activeTileID].getCanvas().id;
	//document.getElementById(oldCanvasID).style = "border:0px";
	
	activeTileID = t;
	
	//var newCanvasID = Tiles[activeTileID].getCanvas().id;
	//document.getElementById(newCanvasID).style = "border:2px solid red";
	
	debugOut('output', "Clicked Tile = " + t);
}

function clickToToggleWall(e) {
	var x = e.clientX - 8;
	var y = e.clientY - 8;
	var walls = Tiles[activeTileID].getWalls();
	var newWalls = walls;
	var w = null;
	
	debugOut('clickX', x);
	debugOut('clickY', y);
	
	w = getWallFromPointMaybeNull(x, y);
	
	if (w !== null) {
		newWalls[w[0]][w[1]][w[2]] = !walls[w[0]][w[1]][w[2]];
	}
	
	Tiles[activeTileID].updateWalls(newWalls);
	drawActiveCanvas();
	debugOut('output', x + ', ' + y);
}

function updateHoverCoordinates_debug(e) {
	var x = e.clientX - 8;
	var y = e.clientY - 8;

	debugOut('hoverY', y);
	debugOut('hoverX', x);
}

function getWallFromPointMaybeNull(x, y) {
	var quadX;
	var quadY;
	
	if ((x > 325) || (y > 325)) {
		return null;
	} else if ((x % 100 > 25) && (x % 100 < 75)) {		
		
		//test for proximity to horizontal wall
		if ((y % 100 < 25) || (y % 100 > 75)) {
			quadX = Math.round((x - 26) / 100);
			quadY = Math.round(y / 100);
			return [0, quadX, quadY];
		}
	} else if ((x % 100 < 25) || (x % 100 > 75)) {		
	
		//test for proximity to vertical wall
		if ((y % 100 > 25) && (y % 100 < 75)) {
			quadX = Math.round(x / 100);
			quadY = Math.round((y - 26) / 100);
			return [1, quadY, quadX];
		}
	}
	return null;
}

var origin = new Image();
origin.src = "origin.png";

function showOrigin() {
	var ctx = getActiveContext();
	ctx.drawImage(origin, 0, 0);
}

function debugOut(id, text) {
	
	document.getElementById(id).innerHTML = text;
}



/*****************\
** Cat Functions **
\*****************/

var inCatMode = false;

GridMaze.toggleCatMode = function() {
// called by "Cat" button

	inCatMode = !inCatMode;
	
	if (inCatMode) {
		insertCat();
	} else {
		drawActiveCanvas();
	}
};

function insertCat() {
	var ctx = getActiveContext();

	var img = new Image();
	img.src = "crazycat.png";
	
	ctx.drawImage(img, 0, 0);
}

})(); // end GridMaze module
