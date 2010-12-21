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
	
	// User can pass in overrides in .initialize()
	config: null,
	
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
			var value = Math.round(Math.random() + 0.2);
			if (value == 1) {
				arr[c][r] = true;
			} else {
				arr[c][r] = false;
			}
		}
	}
	return arr;
}



/**********\
** Actors **
\**********/

GridMaze.Actor = function(image, scale) {
	
	this.image = image;
	
	// By default the actor will be centered on the square
	// and scaled up to fit it entirely.  If you feel that
	// makes the actor too big and/or looks funny during
	// rotation, then lower the scale.
	this.scale = scale;
};



/**********************\
** Initializing Tiles **
\**********************/

function Tile(canvas, walls, actors) {
	
	if (!canvas.getContext("2d")) {
		throw "Invalid canvas element passed to Tile(canvas, walls)";
	}
	this.canvas = canvas;

	// JavaScript by default does not do "deep copying" of arrays.
	// If we simply return walls then we're actually handing the
	// user direct references into this tile data, which can be
	// a problem!  This is why jquery.extend(true, [], ...) is
	// useful when we accept or return wall values.
	// http://stackoverflow.com/questions/565430/javascript-deep-copying-an-array-using-jquery/817050#817050
	this.walls = $.extend(true, [], walls);
	this.actors = actors;
	
	this.inCatMode = false;
	this.updateWallsAndDraw = function(walls) {
		debugOutWalls('newhwall', 'newvwall', walls);
		
		// See notes about deep copies on this.walls.
		this.walls = $.extend(true, [], walls);
		
		debugOutWalls('newTileHwall', 'newTileVwall', this.walls);
		drawTile(this);
	};
	this.updateActorsAndDraw = function(actors) {
		this.actors = $.extend(true, [], actors);
		drawTile(this);
	};
	this.updateWallsAndActorsAndDraw = function(walls, actors) {
		this.walls = $.extend(true, [], walls);
		this.actors = $.extend(true, [], actors);
		drawTile(this);
	};
	this.getCanvas = function() {
		// Since we checked that the tile had a valid canvas when we
		// made it, we don't have to check it again.
		return canvas;
	};
	this.getWalls = function() {
		// See notes about deep copies on this.walls.
		return $.extend(true, [], this.walls);
	};
	this.getActors = function() {
		return $.extend(true, [], this.actors);
	};
	this.toString = function() {
		return "I exist";
	};
	this.toggleCatMode = function() {
		this.inCatMode = !this.inCatMode;
		drawTile(this);	
	};
	this.showOrigin = function() {
		var ctx = this.getCanvas().getContext("2d");
		ctx.drawImage(Globals.originImage, 0, 0);
	};
	this.animatedRotateLeft = function() {
		animatedRotateTile(this, false);
	};
	this.animatedRotateRight = function() {
		animatedRotateTile(this, true);
	};
	this.getWallFromPointMaybeNull = function(x, y) {
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
	};
	this.equals = function(other) {
		// there is no TileData class so this is currently just
		// checking to see if the walls and actors are equal but
		// not checking if the canvases are equal

		// check walls
		for (var dir = 0; dir < 2; dir++) {
			for (var xw = 0; xw < walls[dir].length; xw++) {
				for (var yw = 0; yw < walls[dir][0].length; yw++) {
					if (other.walls[dir][xw][yw] != this.walls[dir][xw][yw]) {
						return false;
					}
				}
			}
		}
		
		// check actors
		for (var xa = 0; xa < actors.length; xa++) {
			for (var ya = 0; ya < actors[0].length; ya++) {
				// object equality test, must be identical references
				if (other.actors[xa][ya] !== this.actors[xa][ya]) {
					return false;
				}
			}
		}
		
		return true;
	};
}

function createTileArray() {
// get array of all canvases, combine each with a randomized walls array
	
	var canvases = $("canvas");
	debugOut('output2', "canvases length is " + canvases.length);

	var result = [];
	canvases.each(function(index) {
		var walls = [
			createRandomized2DArray(3, 4),
			createRandomized2DArray(3, 4)
		];
		var actors = create2DArray(3, 3, null);
		result.push(new Tile(this, walls, actors));
	});
	
	return result;
}



/**********************************\
** Draw Current walls and Squares **
\**********************************/

function drawTileCore(tile, step, numSteps, clockwise) {
	var canvas = tile.getCanvas();
	var ctx = canvas.getContext("2d");

	var horizontalCenter = canvas.width / 2;
	var verticalCenter = canvas.height / 2;

	// We have to clear the background before we transform, because
	// once we transform our erasing rectangle will be rotated to 
	// the new position and overwritten...
	ctx.fillStyle = Globals.config.backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	// save the context, because actors stay true to "gravity"
	ctx.save();
	
	if (numSteps) {
		// animated rotation for 75 degrees
		ctx.translate(horizontalCenter, verticalCenter);
		ctx.rotate((90 / numSteps) * step * (clockwise ? 1 : -1) * Math.PI/180);
		ctx.translate(horizontalCenter * -1, verticalCenter * -1);
	}

	if (tile.inCatMode) {
		ctx.drawImage(Globals.catImage, 0, 0, canvas.width, canvas.height);
		ctx.restore();
	} else {
		// generate 3x3 array describing whether tiles are enclosed (t) or not (f)
		var filledIn = calculateSquaresArray(tile);
		var squareSize = Math.round(canvas.width / 3) - 1;
		
		// use filledIn to draw each tile with correct color
		for (var x = 0; x < filledIn.length; x++) {
			for (var y = 0; y < filledIn.length; y++) {
				if (filledIn[x][y]) {
					ctx.fillStyle = Globals.config.unreachableFloorColor;
				} else {
					ctx.fillStyle = Globals.config.floorColor;
				}
				ctx.fillRect(
						x * squareSize + 1,
						y * squareSize + 1,
						squareSize,
						squareSize);
			}
		}

		var walls = tile.getWalls();
		
		// use walls (HorizontalWall) to draw horizontal wall positions
		for (var xh = 0; xh < walls[0].length; xh++) {
			for (var yh = 0; yh < walls[0][0].length; yh++) {
				drawWall(ctx, [0, xh, yh], squareSize, walls[0][xh][yh]);
			}
		}
		
		// use walls (VerticalWall) to draw vertical wall positions
		for (var xv = 0; xv < walls[1].length; xv++) {
			for (var yv = 0; yv< walls[1][0].length; yv++) {
				drawWall(ctx, [1, xv, yv], squareSize, walls[1][xv][yv]);
			}
		}
		
		debugOutWalls('horizontalwall', 'verticalwall', walls);
		
		var actorCenters = create2DArray(3, 3, null);

		var actors = tile.actors;

		// compute the default coordinate transform center points of 
		// the rotated quads before we restore the context transformation
		for (var xac = 0; xac < actors.length; xac++) {
			for (var yac = 0; yac < actors[0].length; yac++) {
				actorCenters[xac][yac] = ctx.getTransformedPoint(
					xac * squareSize + 1 + squareSize/2,
					yac * squareSize + 1 + squareSize/2
				);
			}
		}
		
		ctx.restore();
		
		// layer the actors on top
		for (var xa = 0; xa < actors.length; xa++) {
			for (var ya = 0; ya < actors[0].length; ya++) {
				var actor = actors[xa][ya];
				if (actor) {
					ctx.drawImage(actor.image,
							actorCenters[xa][ya][0] - squareSize/2 * actor.scale,
							actorCenters[xa][ya][1] - squareSize/2 * actor.scale,
							squareSize * actor.scale,
							squareSize * actor.scale);
				}
			}
		}
	}
}

function drawTile(tile) {
	drawTileCore(tile, 0, 0, false);
}

function drawWall(ctx, wall, length, exists) {

	ctx.strokeStyle = exists ? Globals.config.wallColor : 
			Globals.config.missingWallColor;
			
	switch (wall[0]) {
		case 0: // Horizontal Wall
			ctx.strokeRect(wall[1] * length, wall[2] * length, length, 2);
			break;
		case 1: // Vertical Wall
			ctx.strokeRect(wall[2] * length, wall[1] * length, 2, length);
			break;
		default:
			throw "Invalid wall direction, not 0 or 1";
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
	var walls = tile.getWalls();
	var hWalls = walls[0];
	var vWalls = walls[1];
	
	var topAndBottom = hWalls[x][y] && hWalls[x][y + 1];
	var sides = vWalls[y][x] && vWalls[y][x + 1];
	return sides && topAndBottom;
}

function rotateTileWallsAndActorsLeftAndDraw(tile) {
// rotate the entire array of walls counter-clockwise and redraw
// walls[0] = Horizontal, [1] = Vertical
	
	debugOut('output', 'Rotating walls Array counter-clockwise!');
	
	var oldWalls = tile.getWalls();
	var newWalls = [oldWalls[1], oldWalls[0]];
	
	debugOutWalls('oldhwall', 'oldvwall', oldWalls);
	
	newWalls[1].reverse();
	
	for (var x = 0; x < newWalls[0].length; x++) {
		newWalls[0][x].reverse();
	}

	var oldActors = tile.getActors();
	var newActors = create2DArray(3, 3, null);
	for (var xa = 0; xa < 3; xa++) {
		for (var ya = 0; ya < 3; ya++) {
			newActors[xa][ya] = oldActors[3 - ya - 1][xa]; 
		}
	}
	
	tile.updateWallsAndActorsAndDraw([newWalls[0], newWalls[1]], newActors);
}

function rotateTileWallsAndActorsRightAndDraw(tile) {
// rotate the entire array of walls clockwise, and redraw
// walls[0] = Horizontal, [1] = Vertical

	debugOut('output', 'Rotating walls Array counter-clockwise!');
	
	var oldWalls = tile.getWalls();
	var newWalls = [oldWalls[1], oldWalls[0]];
	
	debugOutWalls('oldhwall', 'oldvwall', oldWalls);
	
	newWalls[0].reverse();
	
	for (var x = 0; x < newWalls[1].length; x++) {
		newWalls[1][x].reverse();
	}

	var oldActors = tile.getActors();
	var newActors = create2DArray(3, 3, null);
	for (var xa = 0; xa < 3; xa++) {
		for (var ya = 0; ya < 3; ya++) {
			newActors[xa][ya] = oldActors[ya][3 - xa - 1]; 
		}
	}
	
	tile.updateWallsAndActorsAndDraw([newWalls[0], newWalls[1]], newActors);
}



/*******************\
** Image Animation **
\*******************/

function animatedRotateTileCore(tile, clockwise) {
	var numSteps = 6;
	var step = 1;
	
	var rotorClosure = function() {
		if (step < numSteps) {
			drawTileCore(tile, step, numSteps, clockwise);
			window.setTimeout(rotorClosure, 100);
			step++;
		} else {
			if (clockwise) {
				rotateTileWallsAndActorsRightAndDraw(tile);
			} else {
				rotateTileWallsAndActorsLeftAndDraw(tile);
			}
		}
	};
	
	rotorClosure();
}

function animatedRotateTile(tile, clockwise) {
	animatedRotateTileCore(tile, clockwise);
}

function debugOut(id, text) {
	
	if (Globals.config.debugOutCallback) {
		Globals.config.debugOutCallback(id, text);
	}
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
** Exported API **
\*****************/

GridMaze.getTileFromCanvas = function(canvas) {
	for (var index = 0; index < Globals.tiles.length; index++) {
		if (canvas == Globals.tiles[index].canvas) {
			return Globals.tiles[index];
		}
	}
	throw "getTileFromCanvas failed";
};

GridMaze.initialize = function(settings) {
	if (Globals.tiles) {
		throw "Gridmaze is already initialized!";
	}

	var config = {
		debugOutCallback: null,
		
		// Note: Canvas supposedly supports legal CSS colors, not just RGB
		backgroundColor: "rgb(255,255,255)", // white
		floorColor: "rgb(235,235,235)", // light gray
		wallColor: "rgb(0,0,0)", // black
		missingWallColor: "rgb(200,200,200)", // med gray
		unreachableFloorColor: "rgb(75,100,230)" // dark blue
	};

	if (settings) {
		config = $.extend(config, settings);
	}
	
	Globals.config = config;
		
	Globals.tiles = createTileArray();
	if (!Globals.tiles.length) {
		throw "Gridmaze needs AT LEAST one canvas element in host HTML5 page";
	}
	
	for(var index = 0; index < Globals.tiles.length; index++) {
		var tile = Globals.tiles[index];
		var canvas = tile.getCanvas();

		drawTile(tile);
	}
};

// http://en.wikipedia.org/wiki/White-box_testing
GridMaze.runWhiteboxTests = function() {
	// Given a string starting with "<", jQuery will generate DOM
	// elements out of the HTML text you provide.
	var testCanvas1 = $('<canvas id="testcanvas1"></canvas>').get(0);
	var testCanvas2 = $('<canvas id="testcanvas2"></canvas>').get(0);

	// REVIEW: comprehensive fixes needed to make sure all routines
	// work on sizes other than 3x3 tiles.  Note the Sylvester library
	// (which is already being included) has Matrix equality and some
	// nice routines:
	//
	//     http://sylvester.jcoglan.com/api/matrix
	//
	// It may not be happy about storing objects instead of numbers.
	for (var tileSize = 3; tileSize <= 3; tileSize++) {
		for (var iteration = 0; iteration < 10; iteration++ ) {
			var walls = [
				createRandomized2DArray(tileSize, tileSize + 1),
				createRandomized2DArray(tileSize, tileSize + 1)
			];
			var actors = create2DArray(tileSize, tileSize, null);
			var tile1 = new Tile(testCanvas1, walls, actors);
			var tile2 = new Tile(testCanvas2, walls, actors);
			
			// rotating the original tile right three times
			// should be equivalent to rotating it left once
			rotateTileWallsAndActorsRightAndDraw(tile1);
			rotateTileWallsAndActorsLeftAndDraw(tile2);
			rotateTileWallsAndActorsLeftAndDraw(tile2);
			rotateTileWallsAndActorsLeftAndDraw(tile2);
			if (!tile1.equals(tile2)) {
				throw("rotation test failed; three lefts don't make a right.");
			}
			
			// note that since every tile is assumed to be bound
			// to a canvas, we can't work with the data without
			// also working with the notion of drawing.  This
			// complicates testing of the tile's internal data,
			// and suggests perhaps "TileData" deserves its
			// own class and manipulation functions.  But notice
			// how removing the notion of an "active tile" made
			// this easier.
		}
	}
};

(function() {
	// Get origin image ready
	Globals.originImage = new Image();
	Globals.originImage.src = "origin.png";
	
	// Get cat image ready
	Globals.catImage = new Image();
	Globals.catImage.src = "crazycat.png";
})();

}); // end GridMaze module



/****************************************\
** Missing HTML5 Canvas Coordinate Math **
\****************************************/

(function() {
	// This should really probably be in its own file.  The purpose is so
	// that it's possible to map HTML5 canvas transformations back into the
	// default coordinate system.
	
	// http://stackoverflow.com/questions/849785/get-un-translated-un-rotated-x-y-coordinate-of-a-point-from-a-javascript-canva

	var contextPrototype = CanvasRenderingContext2D.prototype;

	contextPrototype.xform = Matrix.I(3);

	contextPrototype.realSave = contextPrototype.save;
	contextPrototype.save = function() {
		if (!this.xformStack) {
			this.xformStack = [];
		}
		this.xformStack.push(this.xform.dup());
		this.realSave();
	};

	contextPrototype.realRestore = contextPrototype.restore;
	contextPrototype.restore = function() {
		if (this.xformStack && this.xformStack.length > 0) {
			this.xform = this.xformStack.pop();
		}
		this.realRestore();
	};

	contextPrototype.realScale = contextPrototype.scale;
	contextPrototype.scale = function(x, y) {
		this.xform = this.xform.multiply($M([
			[x, 0, 0],
			[0, y, 0],
			[0, 0, 1]
		]));
		this.realScale(x, y);
	};

	contextPrototype.realRotate = contextPrototype.rotate;
	contextPrototype.rotate = function(angle) {
		var sin = Math.sin(angle);
		var cos = Math.cos(angle);
		this.xform = this.xform.multiply($M([
			[cos, -sin, 0],
			[sin,  cos, 0],
			[   0,   0, 1]
		]));
		this.realRotate(angle);
	};

	contextPrototype.realTranslate = contextPrototype.translate;
	contextPrototype.translate = function(x, y) {
		this.xform = this.xform.multiply($M([
			[1, 0, x],
			[0, 1, y],
			[0, 0, 1]
		]));
		this.realTranslate(x, y);
	};

	contextPrototype.realTransform = contextPrototype.transform;
	contextPrototype.transform = function(m11, m12, m21, m22, dx, dy) {
		this.xform = this.xform.multiply($M([
			[m11, m21, dx],
			[m12, m22, dy],
			[  0,   0,  1]
		]));
		this.realTransform(m11, m12, m21, m22, dx, dy);
	};

	contextPrototype.realSetTransform = contextPrototype.setTransform;
	contextPrototype.setTransform = function(m11, m12, m21, m22, dx, dy) {
		this.xform = $M([
			[m11, m21, dx],
			[m12, m22, dy],
			[  0,   0,  1]
		]);
		this.realSetTransform(m11, m12, m21, m22, dx, dy);
	};

	// Get the transformed point as [x, y]
	contextPrototype.getTransformedPoint = function(x, y) {
		var point = this.xform.multiply($V([x, y, 1]));
		return [point.e(1), point.e(2)];
	};
	
})();