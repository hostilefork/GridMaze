var GridMazeEditor = {};

// jQuery cheat sheet: http://visualjquery.com/
$(document).ready(function() {

	function debugOut(id, text) {
		$("#" + id).text(text);
	}

	function toggleWallHandler(event) {
		// http://docs.jquery.com/Tutorials:Mouse_Position#Where_did_they_click_that_div.3F
		var relativeX = event.pageX - this.offsetLeft;
		var relativeY = event.pageY - this.offsetTop;
		
		var x = relativeX - 8;
		var y = relativeY - 8;

		var tile = GridMaze.getTileFromCanvas(this);
		var walls = tile.getWalls();
		
		debugOut('clickX', x);
		debugOut('clickY', y);

		var w = tile.getWallFromPointMaybeNull(x, y);
		if (w) {
			var newWalls = walls;
			newWalls[w[0]][w[1]][w[2]] = !walls[w[0]][w[1]][w[2]];
			tile.updateWallsAndDraw(newWalls);
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

	// Code local to this module that runs only once...
	(function () {
		GridMaze.initialize();

		var allCanvases = $("canvas");
		
		allCanvases.each(function(i) {
			$(this).mousedown(toggleWallHandler);
			$(this).mousemove(debugHoverPointHandler);
		});
	})();
});
