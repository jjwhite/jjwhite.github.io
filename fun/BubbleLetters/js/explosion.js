

function Shrapnel (x,y, xMotion, yMotion)
{
	this.x = x;
	this.y = y;
    this.xMotion = xMotion;
	this.yMotion = yMotion;
	this.numsides = getRandomNum(5,8);
	this.radius = getRandomNum(4,10);
	this.mass = 20;
	this.fade = 1.0;
	this.visible = true;
}

Shrapnel.prototype.draw = function(){
	context.beginPath();
	 
      context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      context.lineWidth = 1;
      context.strokeStyle = '#27daea';
      context.stroke();
      context.globalAlpha = 0.5;
	  context.fillStyle = '#b0f7fc';
      context.fill();
	  context.globalAlpha = 1;
      
}

Shrapnel.prototype.update = function(index){
	 var Fg = (g * 30/1000) * this.mass;
	if (this.visible)
	{
	    this.x +=  this.xMotion;
		this.y += Fg;
		this.y -= this.yMotion;
		this.fade -= 0.05;
	}
		
	if (this.fade <= 0)
	{
		this.visible = false;
		pops.splice(index,1);
	}
}

function explode(x, y)
{
	popSound.play();
	game.score ++;
	pops.push(new Shrapnel(x - getRandomNum(0, 20), y , getRandomNum(0,5), 0));
	pops.push(new Shrapnel(x - getRandomNum(0, 20), y , getRandomNum(0,5) * -1, 5));
	pops.push(new Shrapnel(x - getRandomNum(0, 20), y , getRandomNum(0,5) , 5));
	pops.push(new Shrapnel(x - getRandomNum(0, 20), y , getRandomNum(0,5) * -1, 0));
	pops.push(new Shrapnel(x - getRandomNum(0, 20), y , getRandomNum(0,5), 3));
}
