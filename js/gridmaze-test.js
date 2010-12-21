var GridMazeTest = {};

// jQuery cheat sheet: http://visualjquery.com/
$(document).ready(function() {

	var Globals = {
		// Once the GridMazeTest module has been initialized, we assume that
		// there is always an activeTile.
		activeTile: null
	};
	
	function debugOut(id, text) {
		$("#" + id).text(text);
	}
	
	function setActiveTile(tile) {
		if (!tile) {
			throw "setActiveTile requires valid tile!";
		}
		
		if (Globals.activeTile != null) {
			var oldCanvasID = Globals.activeTile.getCanvas().id;
			$("#" + oldCanvasID).css("border", "3px solid white");
		}
		
		Globals.activeTile = tile;
		
		var newCanvasID = Globals.activeTile.getCanvas().id;
		$("#" + newCanvasID).css("border", "3px dotted red");
	
		debugOut('output', "Active Tile = " + tile.getCanvas().id);
	}
	
	function focusTileHandler(event) {
		var tile = GridMaze.getTileFromCanvas(this);
		setActiveTile(tile);	
	}
	
	// Code local to this module that runs only once...
	(function() {
		GridMaze.initialize({
			debugOutCallback: debugOut
		});
		
		GridMaze.runWhiteboxTests();

		var allCanvases = $("canvas");
		setActiveTile(GridMaze.getTileFromCanvas(allCanvases.get(0)));
		
		allCanvases.each(function(i) {
			$(this).mousedown(focusTileHandler);
		});
	})();


	/*****************\
	** Exported API **
	\*****************/

	GridMazeTest.rotateLeft = function() {
	// called by "Rotate Left" button
	
		debugOut('output', 'Animating counter-clockwise rotation!');
		Globals.activeTile.animatedRotateLeft();	
	};

	GridMazeTest.rotateRight = function() {
	// called by "Rotate Right" button

		debugOut('output', 'Animating clockwise rotation!');
		Globals.activeTile.animatedRotateRight();
	};

	GridMazeTest.showOrigin = function() {
		Globals.activeTile.showOrigin();
	};

	GridMazeTest.toggleCatMode = function() {
	// called by "Cat" button

		Globals.activeTile.toggleCatMode();
	};

});
