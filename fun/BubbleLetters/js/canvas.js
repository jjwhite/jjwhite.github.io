/******* canvas.js *******/
/*
This file contains objects and methods used in dealing with the canvas object.  This should be the first file loaded.
*/

//globals
var canvas;
var context;
var canvasHeight;
var canvasWidth;

//canvas configuration object
var config = {
	showStats: true,
	statsX: 20,
	statsY: 20,
	statsFont: "10px Arial",
	statsColor: "yellow",
	bgImage: "images/bg.jpg"
};

function cvs()
{
	var self = this;
	
	this.$canvas = $('canvas');  // need this to use jquery to capture events

	this.mousex = 0;
	this.mousey = 0;
	
	this.fps = 0;
	
	canvasHeight = this.$canvas.height();
	canvasWidth = this.$canvas.width();
	this.$canvas.backgroundImage = config.bgImage;
	
	//Mouse Events
	this.$canvas.mousemove(function(e){
		
		var pos = findPos(this);
		
    	self.mousex = e.pageX - pos.x;
    	self.mousey = e.pageY - pos.y;
    	
    	//call any game related methods here
	})
	
	this.$canvas.mousedown(function(e){
		var pos = findPos(this);
		x = e.pageX-pos.x;
		y = e.pageY-pos.y;
		
		//call any game related methods here
		bubbles.push(new bubble(x, y, this.ctx));

	})
}


// This function cycles the canvas each iteration
cvs.prototype.cycle = function(){
	
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	
	// show canvas stats
	if (config.showStats){
		context.fillStyle = config.statsColor;
		context.font = config.statsFont;
		context.fillText("mx: " + this.mousex + " my: " + this.mousey + " | " + this.fps + " FPS", config.statsX, config.statsY);
	}
}

//use this function to check for and handle key presses
cvs.prototype.checkKeys = function(){
	//checking for keys
	    for (var bs=0; bs<bubbles.length; bs++){
	   		for (var i in keys)
			{
				if (!keys.hasOwnProperty(i)) continue;
								
				if (bubbles[bs].letter == String.fromCharCode(i).toLowerCase()){
					if (bubbles[bs].isDouble && !bubbles[bs].isFinal)
					{
						bubbles[bs].isFinal = true;
						bubbles[bs].letter = letters[getRandomNum(0,25)];
					}else{
						explode(bubbles[bs].x, bubbles[bs].y);
						bubbles.splice(bs,1);
					}
					
				}
			}
			
			if (!bubbles.hasOwnProperty(bs)) continue;
	    	bubbles[bs].draw();
	    	bubbles[bs].update(bs);
	    }

	
}

//Static methods








