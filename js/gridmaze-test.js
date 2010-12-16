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
	
	function setActiveTileHandler(event) {
		//var oldCanvasID = Globals.activeTile.getCanvas().id;
		//$(oldCanvasID).css("border", "0px");
	
		var tile = GridMaze.getTileFromCanvas(this);
		Globals.activeTile = tile;
	
		//var newCanvasID = Globals.activeTile.getCanvas().id;
		//$(newCanvasID).css("border", "2px solid red");
	
		debugOut('output', "Active Tile = " + tile.getCanvas().id);
	}
	
	(function() {
		var config = new GridMaze.Config();
		
		config.clickHandler = setActiveTileHandler;

		config.debugOutCallback = debugOut;
		
		GridMaze.initialize(config);
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
