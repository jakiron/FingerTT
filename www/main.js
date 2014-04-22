var game = (function(){
	window.requestAnimFrame = (function(){
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequetAnimationFrame 
		|| window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback){return window.setTimeout(callback,1000/60)};
	})();
	window.cancelRequestAnimFrame = (function(){
		return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame
		|| window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout;
	})();
	var canvas = document.getElementById("canvas"),ctx = canvas.getContext("2d");
	var Ww = window.innerWidth,Wh = window.innerHeight;
	canvas.width = Ww;canvas.height = Wh;
	var particles = [],ball={},paddles = [2],points1 = window.localStorage.getItem('points1') || 0,paddleHit = 0,points2 = window.localStorage.getItem('points2') || 0;
	var ball = {x:Math.floor(Math.random()+Math.random()*Ww/2),y:Math.floor(Math.random()+Math.random()*Wh/2),r:20,c:"white",vx:1,vy:3,
		draw:function(){
			ctx.beginPath();
			ctx.fillStyle = this.c;
			ctx.arc(this.x,this.y,this.r,0,Math.PI*2,false);
			ctx.fill();
			}
	};
	var mouse = {"1":{},"2":{}};
	var colAud = document.getElementById("collide");

	function Paddle(pos,c){
		this.h = 10;this.w=Ww/5;
		this.x = Ww/2 - this.w/2;
		this.y = (pos == 'top')?0:Wh - this.h;
		this.c = c
		if(pos == 'top'){
			mouse["2"].x = this.x;
		}
		else{
			mouse["1"].x = this.x;
		}
	}

	paddles.push(new Paddle("bottom","#8B0000"));
	paddles.push(new Paddle("top","black"));

	function paintCanvas(){
		ctx.fillStyle = "#006400";
		ctx.fillRect(0,0,Ww,Wh);
		ctx.fillStyle = "white";
		ctx.fillRect(0,Wh/2-2,Ww,2);
	}


	function draw(){
		paintCanvas();
		for(var i=0;i<paddles.length;++i){
			p = paddles[i];
			ctx.fillStyle = p.c;
			ctx.fillRect(p.x,p.y,p.w,p.h)
		}
		ball.draw();
		update();
	}

	function collides(b,p){
		if(b.x+b.r >=p.x&&b.x-ball.r<=p.x+p.w){
			if(b.y>=(p.y - p.h)&& p.y > 0){
				return true;
			}
			else if(b.y <= p.h && p.y == 0){
				return true;
			}
			else return false;
		}
	}

	function updateSpeed(){
		if(paddleHit%4 == 0){
			if(Math.abs(ball.vx) < 15){
				ball.vx+=(ball.vx < 0)?-1:1;
				ball.vy+=(ball.vy < 0)?-1:1;
			}
		}
	}

	function updateScore(){
		ctx.font = "24px Arial,sans-serif";
		ctx.textBaseline = "top";
		ctx.textAlign = "center";
		ctx.fillStyle = paddles[1].c;
		ctx.fillText('Player 1 :'+points1,60,Wh - 50);
		ctx.textAlign = "center";
		ctx.fillStyle = paddles[2].c;
		ctx.fillText('Player 2 :'+points2,60,20);
	}

	function gameOver(){
		updateScore();
		ctx.fillStyle = "navy";ctx.font = "40px Arial,sans-serif";
		ctx.textAlign = "center"; ctx.textBaseline = "middle";ctx.fillText("Game Over",Ww/2,Wh/2 + 25);
		if(points1 == points2){
			ctx.fillText("Draw!!",Ww/2,Wh/2 + 70);
		}
		else{
			winner = points1 > points2?1:2;
			ctx.fillStyle = paddles[winner].c;
			ctx.fillText("Player"+winner+" wins!!",Ww/2,Wh/2 + 70)
		}
		cancelRequestAnimFrame(init);
	}

	function update(){

		//if(mouse["1"].x && mouse["2"].x){
			for(var i=1;i<paddles.length;++i){
				p=paddles[i];
				p.x = mouse[""+i+""].x;
			}
		//}

		ball.x += ball.vx; ball.y += ball.vy;

		p1 = paddles[1];
		p2 = paddles[2];

		if(collides(ball,p1)){
			++paddleHit;updateSpeed();colAud.currentTime = 0;colAud.play();
			ball.vy = -ball.vy;
		}
		else if(collides(ball,p2)){
			++paddleHit;updateSpeed();colAud.currentTime = 0;colAud.play();
			ball.vy = -ball.vy;
		}
		else{
			if(ball.y + ball.r > Wh){
				ball.y = Wh - ball.r;
				++points2;
				window.localStorage.setItem('points2',points2);
				gameOver();
			}
			else if(ball.y < 0){
				ball.y = ball.r;
				++points1;
				window.localStorage.setItem('points1',points1);
				gameOver();
			}

			if(ball.x + ball.r > Ww){ball.vx = -ball.vx;ball.x = Ww - ball.r}
			else if(ball.x - ball.r < 0){ball.vx = -ball.vx;ball.x = ball.r}
		}
	}

	//window.addEventListener('mousemove',trackPosition,true);
	socketio.on("message_to_client",function(data){
		mouse[""+data['paddle']+""].x = (Number(data['message'])-1) * Ww/5;
	});

	function trackPosition(e){
		mouse.x = e.pageX;mouse.y = e.pageY;
	}

	function animloop(){
		init = requestAnimFrame(animloop);draw();
	}

	animloop();
})

window.onload = function(){
	socketAddr = "127.0.0.1";port = 3691;
	socketio = io.connect(socketAddr+":"+port);
	window.addEventListener('keyup',function(evt){
		if(evt.keyCode == 32){
			game();
		}
	},true);
	window.addEventListener('keyup',function(evt){
		if(evt.keyCode == 78){
			window.localStorage.removeItem('points1');
			window.localStorage.removeItem('points2');
			game();
		}
	},true);
}

