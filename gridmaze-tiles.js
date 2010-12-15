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

// jQuery cheat sheet: http://visualjquery.com/
$(document).ready(function() {
	
/************************\
** Global Module State **
\************************/

var Globals = {
	// two-dimensional array of Tile objects
	tiles: null,
	
	// REVIEW: What is the future of "cat mode"?  Is the real intention
	// the idea that a tile may be an image in various degrees of
	// rotation instead of a grid?  If so, that implies there need
	// to be different "types" of Tile objects.
	inCatMode: false,
	catImage: null,
	originImage: null
};


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

function Tile(canvas, walls) {
	
	if (!canvas.getContext("2d")) {
		throw "Invalid canvas element passed to Tile(canvas, walls)";
	}
	this.canvas = canvas;
	this.walls = walls;
	this.updateWalls = function(wallsArray) {
		debugOutWalls('newhwall', 'newvwall', wallsArray);
		
		this.walls = wallsArray;
		
		debugOutWalls('newTileHwall', 'newTileVwall', this.walls);
	};
	this.getCanvas = function() {
		// Since we checked that the tile had a valid canvas when we
		// made it, we don't have to check it again.
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

	var canvases = $("canvas");
	debugOut('output2', "canvases length is " + canvases.length);

	var arr = [];
	for (var c = 0; c < canvases.length; c++) {
		var walls = [
			createRandomized2DArray(3, 4),
			createRandomized2DArray(3, 4)
		];
		arr[c] = new Tile(canvases[c], walls);
	}
	
	return arr;
}

function getTileFromCanvas(canvas) {
	for (var index = 0; index < Globals.tiles.length; index++) {
		if (canvas == Globals.tiles[index].canvas) {
			return Globals.tiles[index];
		}
	}
	throw "getTileFromCanvas failed";
}

function initializeCore(clickHandler, hoverHandler) {
	if (Globals.tiles) {
		throw "Gridmaze is already initialized!";
	}
	
	Globals.tiles = createTileArray();
	if (!Globals.tiles.length) {
		throw "Gridmaze needs AT LEAST one canvas element in host HTML5 page";
	}
	
	for(var index = 0; index < Globals.tiles.length; index++) {
		var tile = Globals.tiles[index];
		var canvas = tile.getCanvas();

		$(canvas).mousedown(clickHandler);
		$(canvas).mousemove(hoverHandler);

		drawTile(tile);
	}
	
	// Get origin image ready
	Globals.originImage = new Image();
	Globals.originImage.src = "origin.png";
	
	// Get cat image ready
	Globals.catImage = new Image();
	Globals.catImage.src = "crazycat.png";
}



/**********************************\
** Draw Current walls and Squares **
\**********************************/

function drawTileCore(tile, erase) {
	var canvas = tile.getCanvas();
	var ctx = canvas.getContext("2d");
	
	// set fillStyle to white and fill canvas background
	if (erase) {
		ctx.fillStyle = "rgb(255,255,255)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	// generate 3x3 array describing whether tiles are enclosed (t) or not (f)
	var filledIn = calculateSquaresArray(tile);
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
	
	var walls = tile.getWalls();
	
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
		for (var yv = 0; yv< walls[1][0].length; yv++) {
			if (walls[1][xv][yv]) {
				strokeColor = "rgb(0,0,0)";
			} else {
				strokeColor = "rgb(200,200,200)";
			}
			drawWall(ctx, [1, xv, yv], squareSize, strokeColor);
		}
	}
	
	debugOutWalls('horizontalwall', 'verticalwall', walls);
}

function drawTile(tile) {
	drawTileCore(tile, false);
}

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

function calculateSquaresArray(tile) {
// generate 3x3 array describing whether tiles are enclosed (t) or not (f)

	var result = create2DArray(3, 3, false);
	
	for (var x = 0; x < result.length; x++) {
		for (var y = 0; y < result[0].length; y++) {
			result[x][y] = isSubtileSurroundedByWalls(tile, x, y);
		}	
	}	
	return result;
}

function isSubtileSurroundedByWalls(tile, x, y) {
// determine whether a square is surrounded on all four sides by walls
	var hWalls = tile.getHorizontalWalls();
	var vWalls = tile.getVerticalWalls();
	
	var topAndBottom = hWalls[x][y] && hWalls[x][y + 1];
	var sides = vWalls[y][x] && vWalls[y][x + 1];
	return sides && topAndBottom;
}

function rotateTileWallsLeftNoDraw(tile) {
// rotate the entire array of walls counter-clockwise, without drawing
// walls[0] = Horizontal, [1] = Vertical

	debugOut('output', 'Rotating walls Array counter-clockwise!');
	
	var oldWalls = tile.getWalls();
	var newWalls = [oldWalls[1], oldWalls[0]];
	
	debugOutWalls('oldhwall', 'oldvwall', oldWalls);
	
	newWalls[1].reverse();
	
	for (var x = 0; x < newWalls[0].length; x++) {
		newWalls[0][x].reverse();
	}

	tile.setHorizontalWalls(newWalls[0]);
	tile.setVerticalWalls(newWalls[1]);
}

function rotateTileWallsRightNoDraw(tile) {
// rotate the entire array of walls clockwise, without drawing
// walls[0] = Horizontal, [1] = Vertical

	debugOut('output', 'Rotating walls Array clockwise!');
	
	var oldWalls = tile.getWalls();
	var newWalls = [oldWalls[1], oldWalls[0]];
	
	debugOutWalls('oldhwall', 'oldvwall', oldWalls);
	
	newWalls[0].reverse();
	
	for (var x = 0; x < newWalls[1].length; x++) {
		newWalls[1][x].reverse();
	}
	
	tile.setHorizontalWalls(newWalls[0]);
	tile.setVerticalWalls(newWalls[1]);
}



/*******************\
** Image Animation **
\*******************/

function animatedRotateTile(tile, clockwise) {
	var canvas = tile.getCanvas();
	var ctx = canvas.getContext("2d");
	
	var img = new Image();
	img.src = canvas.toDataURL("image/png");

	var steps = 5;
	
	var rotorClosure = function() {
		if (steps > 0) {
			// animated rotation for 75 degrees
			singleRotateContext(tile, ctx, img, clockwise ? 15 : -15);
			window.setTimeout(rotorClosure, 100);
			steps--;
		} else {
			// re-drawing walls as the final "move" and update tile
			// REVIEW: when gameplay is involved, how to "lock" so
			// that during rotation the tile cannot be navigated into
			// as either the pre-rotation or post-rotation grid?
			ctx.restore();
			if (true || !Globals.inCatMode) {
				if (clockwise) {
					rotateTileWallsRightNoDraw(tile);
				} else {
					rotateTileWallsLeftNoDraw(tile);
				}
			}
			drawTile(tile);
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

function animatedRotateTileLeft(tile) {
	debugOut('output', 'Animating counter-clockwise rotation!');
	animatedRotateTile(tile, false);
}

function animatedRotateTileRight(tile) {
	debugOut('output', 'Animating clockwise rotation!');
	animatedRotateTile(tile, true);
}

function singleRotateContext(tile, ctx, img, angle) {

	//clear background to white first
	ctx.fillStyle = "rgb(255,255,255)";
	
	// additional pixel buffer to eliminate artifact lines
	ctx.fillRect(
			-1,
			-1,
			tile.getCanvas().width + 2, 
			tile.getCanvas().height + 2);
	
	ctx.translate(150, 150);
	ctx.rotate(angle * Math.PI / 180);
	ctx.translate(-150, -150);
	
	// If this fails on Firefox, see comments regarding rotorClosure
	// http://tinymce.moxiecode.com/punbb/viewtopic.php?pid=74384
	ctx.drawImage(img, 0, 0);
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

function debugOut(id, text) {
	
	$("#" + id).text(text);
}

function debugOutWalls(horizontalId, verticalId, walls)
{
	debugOut(horizontalId,
			'0:[' + walls[0][0] + ']' +
			'1:[' + walls[0][1] + ']' +
			'2:[' + walls[0][2] + ']');
	debugOut(verticalId, 
			'0:[' + walls[1][0] + ']' +
			'1:[' + walls[1][1] + ']' +
			'2:[' + walls[1][2] + ']');
}



/*****************\
** Cat Functions **
\*****************/

function paintCatOnTile(tile) {
	var canvas = tile.getCanvas();
	var ctx = canvas.getContext("2d");
	
	ctx.drawImage(Globals.catImage, 0, 0);
}



/*****************\
** Exported API **
\*****************/

var ClientGlobals = {
	// Once the GridMaze module has been initialized, we assume that
	// there is always an activeTile.
	activeTile: null
};

GridMaze.initializeEditable = function() {
// called onload - make walls editable
	
	initializeCore(toggleWallHandler, debugHoverPointHandler);
	ClientGlobals.activeTile = Globals.tiles[0];
};

GridMaze.initialize = function() {
// called onload - multiple Tile canvases
	
	initializeCore(setActiveTileHandler, debugHoverPointHandler);
	ClientGlobals.activeTile = Globals.tiles[0];	
};

GridMaze.rotateLeft = function() {
// called by "Rotate Left" button

	animatedRotateTileLeft(ClientGlobals.activeTile);	
};

GridMaze.rotateRight = function() {
// called by "Rotate Right" button

	animatedRotateTileRight(ClientGlobals.activeTile);
};

GridMaze.drawActiveCanvasHack = function() {
	// It should probably not be necessary to export the function
	// for drawing the active canvas outside the GridMaze object.
	drawTile(ClientGlobals.activeTile);
};

GridMaze.showOrigin = function() {

	var canvas = ClientGlobals.activeTile.getCanvas();
	var ctx = canvas.getContext("2d");
	ctx.drawImage(ClientGlobals.originImage, 0, 0);
};

GridMaze.toggleCatMode = function() {
// called by "Cat" button

	Globals.inCatMode = !Globals.inCatMode;

	if (Globals.inCatMode) {
		paintCatOnTile(ClientGlobals.activeTile);
	} else {
		drawTile(ClientGlobals.activeTile);
	}
};



/******************\
** Event Handlers **
\******************/

function setActiveTileHandler(event) {

	//var oldCanvasID = Globals.activeTile.getCanvas().id;
	//$(oldCanvasID).css("border", "0px");
	
	var tile = getTileFromCanvas(this);
	ClientGlobals.activeTile = tile;
	
	//var newCanvasID = Globals.activeTile.getCanvas().id;
	//$(newCanvasID).css("border", "2px solid red");
	
	debugOut('output', "Active Tile = " + tile.getCanvas().id);
}

function toggleWallHandler(event) {
	// http://docs.jquery.com/Tutorials:Mouse_Position#Where_did_they_click_that_div.3F
	var relativeX = event.pageX - this.offsetLeft;
	var relativeY = event.pageY - this.offsetTop;
	
	var x = relativeX - 8;
	var y = relativeY - 8;

	var tile = getTileFromCanvas(this);
	var walls = tile.getWalls();
	
	debugOut('clickX', x);
	debugOut('clickY', y);

	var w = getWallFromPointMaybeNull(x, y);
	if (w) {
		
		var newWalls = walls;
		newWalls[w[0]][w[1]][w[2]] = !walls[w[0]][w[1]][w[2]];
		tile.updateWalls(newWalls);
		drawTile(tile);
	}
	
	debugOut('output', x + ', ' + y);
}

function debugHoverPointHandler(event) {
	// http://docs.jquery.com/Tutorials:Mouse_Position#Where_did_they_click_that_div.3F
	var relativeX = event.pageX - this.offsetLeft;
	var relativeY = event.pageY - this.offsetTop;

	var x = relativeX - 8;
	var y = relativeY - 8;

	debugOut('hoverY', y);
	debugOut('hoverX', x);
}

}); // end GridMaze module
