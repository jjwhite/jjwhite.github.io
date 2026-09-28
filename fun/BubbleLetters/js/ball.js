var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

function bubble(x,y){
	this.x = x;
	this.y = y;
	this.radius = getRandomNum(20,60);
	this.mass = getRandomNum(3,10);
	this.floating = true;
	this.xUpdate = 0 //getRandomNum(1,3);
	this.letter = letters[getRandomNum(0,25)];
	this.transparency = 0.5;
	this.isDouble = (getRandomNum(1,8)) == 1 ? true : false;
	this.isFinal = this.isDouble ? false : true;
}

bubble.prototype.update = function(index){
	var Fg = (g * 30/1000) * this.mass;
		
	if (this.floating){
		this.y -= Fg;
		if (this.xUpdate == 1){
			this.x -= this.xUpdate
			//this.x = x - Math.cos(y * .2);
		}else{
			this.x += this.xUpdate
			//this.x = x + Math.cos(y * .2);

		}
	}
		
	if (this.y < this.radius * -1)
	{
		bubbles.splice(index,1);
	}
}

bubble.prototype.draw = function(){
	  
	  context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      context.fillStyle = '#b0f7fc';
      context.globalAlpha = this.transparency;
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = this.isDouble ? 'red' : '#27daea';
      context.stroke();
      
      context.globalAlpha = 1;
      context.fillStyle = 'blue';
	  context.font = "30px Arial";
      context.fillText(this.letter, this.x -8, this.y+5);
}