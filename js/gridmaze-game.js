var GridMazeGame = {};

// jQuery cheat sheet: http://visualjquery.com/
$(document).ready(function() {
	
	var Globals = {};
	
	function spinTileHandler(direction) {
		var tile = GridMaze.getTileFromCanvas(this);

		// Better logic needed if gestures will be in the game
		// But this is just a demonstration
		switch (direction) {
			case "W":
			case "SW":
				tile.animatedRotateLeft();
				break;
			case "E":
			case "NE":
				tile.animatedRotateRight();
				break;
		}
	}

	// Code local to this module that runs only once...
	(function() {
		GridMaze.initialize();
		
		var allCanvases = $("canvas");
		
		allCanvases.each(function(i) {
			$(this).gestures({
				showTrail: true,
				eventHandler: spinTileHandler,
				advancedShapes: false
			});
		});
		
		alert("Press down the mouse button on a grid square." +
			"Then drag it left or right, and let go!");
	})();

});
