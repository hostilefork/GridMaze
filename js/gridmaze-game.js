var GridMazeGame = {};

// jQuery cheat sheet: http://visualjquery.com/
$(document).ready(function() {
	
	var Globals = {
		wizardActor: null,
		exitActor: null
	};
	
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
		// Wizard image
		var wizardImage = new Image();
		wizardImage.src = "wizard-128x128.png";
		
		// Exit image
		var exitImage = new Image();
		exitImage.src = "exit.png";

		// Initialize the GridMaze in the default config
		GridMaze.initialize();
		
		var allCanvases = $("canvas");
		
		Globals.wizardActor = new GridMaze.Actor(wizardImage, 1.00);
		Globals.exitActor = new GridMaze.Actor(exitImage, 0.80);
		
		allCanvases.each(function(i) {
			$(this).gestures({
				showTrail: true,
				trailHtml: '<img src="yellow-star.png" />',
				eventHandler: spinTileHandler,
				advancedShapes: false
			});
			
			var tile = GridMaze.getTileFromCanvas(this);
			var actors = tile.getActors();
			if (i === 0) {
				actors[0][0] = Globals.wizardActor;
			}
			if (i === allCanvases.length - 1) {
				actors[2][2] = Globals.exitActor;
			}
			tile.updateActorsAndDraw(actors);
		});

	})();

});
