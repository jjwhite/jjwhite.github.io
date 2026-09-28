//global variables
var g=4.9;
var counter = 0; //main loop counter.

var game = {
	bubbleFreq: 50, // the lower the number the higher the frequency
	time: 60,
	score: 0,
	highScore: 0,
	isOver: false,
	timeLeft: 10
	
};

var popSound = new Audio('POP.wav');
popSound.volume = 0.5;
var bgSound = new Audio('Theme.mp3');

var bubbles = []; // array of visible bubbles
var keys = []; // keys that have been pressed
var pops = []; //bubble pops

function resetGame(){
	game.score = 0;
	game.isOver = false;
	game.timeLeft = game.time;
	bubbles = [];
	keys = [];
	pops = [];
}

// requestAnimationFrame() shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
            };
})();


$(function(){

	//Create canvas
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	var c = new cvs();
	
	bgSound.loop = true;
	bgSound.play();
	// The main game loop
	var lastTime;
	
	function main() {
		counter++;
		
	    var now = new Date().getTime();
	    
	    var dt = now - lastTime;
	   
		delta = (now - lastTime)/1000;
	    lastTime = now;
	    
	    c.fps = Math.round(1/delta);
	    c.cycle();
	  	c.checkKeys();
	  		    
	    if (counter % game.bubbleFreq == 0)
		{
			bubbles.push(new bubble(getRandomNum(0,canvasWidth), canvasHeight+100));
		}
		
		for (var a=0; a<pops.length; a++)
		{
			pops[a].draw();
			pops[a].update(a);
		}
		
		//Timer
		context.fillStyle = game.timeLeft > 10 ? 'yellow' : 'red';
	  	context.font = "50px Consolas";
      	context.fillText(game.timeLeft, canvasWidth/2 - 50, 50);
      	
      	//Score
      	context.fillStyle = '#FFFFFF';
	  	context.font = "20px Arial";
      	context.fillText("Score: " + game.score, 30, canvasHeight-30);
      	
      	context.font = "11px Arial";
      	context.fillText("Best: " + getCookie("bubbleScore"), 30, canvasHeight-15);
      	

		  
	    if (!game.isOver){
	    	requestAnimFrame(main);
	    }else{
	    	
	    	if(getCookie("bubbleScore") < game.score){
	    		setCookie('bubbleScore', game.score)
	    	}
	    	
	    	alert('Game Over - Score: ' + game.score );
	    	$('.start-button').show();
	    	resetGame();
	    	
	    }
	    
	}
	
	$('.start-button').click(function(){
		$(this).hide();
		main();
	
		timer(
		    game.time*1000, // milliseconds
		    function(timeleft) { // called every step to update the visible countdown
		    	game.timeLeft = timeleft;
		    },
		    function() { // what to do after
		        game.isOver = true;
		        
		    }
		);

	});
	
	
	// handle keyup and keydown events
	$('#canvasWrapper').keydown(function (event) {
			keys[event.which] = true;
			
	   });
	   
	$("#canvasWrapper").keyup(function(event){
			delete keys[event.which];
	   });    
	         
   
});

