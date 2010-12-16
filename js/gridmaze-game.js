var GridMazeGame = {};

// jQuery cheat sheet: http://visualjquery.com/
$(document).ready(function() {
	
	(function () {
		var config = new GridMaze.Config();
	
		config.clickHandler = function (event) {
			alert("It would be a more fun game if this did something, huh?  :)");
		};
	
		GridMaze.initialize(config);
	})();
});
