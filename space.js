//---------------------------------------------------------------------------------------------------------------------------------------
//											Coded by: Nicholas Myers
//											Last Updated: 3/10/2014
//---------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------Global Variables--------------------------------------------
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var starNum = 75, enemyNum = 5, planetNum = 3;
//x, y, and velocity for the background image
var bgX, bgY, bgV = 0.25;
//Arrays for star, bullet, enemy, and planet, etc objects
var starArray = [], bArray = [], enemyArray = [], pArray = [], bgShipArray = [], bossArray = [];
//Players score
var score = 0;
//Enemies that have escaped
var lossCount = 0;
//How many times the player has been hit
var damage = 0;
//Score board and health bar html elements
var board = document.getElementById("score");
var hBar = document.getElementById("health");
//Images
var shipImg, bulImg, bgImg, enemyImg, pImg, bgShipImg, bossImg, laserImg, bBulImg, bossExpImg;
//Size of enemies and bullets (x & y)
var eSize = 64, bSize = 30;
//Height and width of planets
var pWidth = 100, pHeight = 125;
//Height and width of the first boss
var b1Width = 167, b1Height = 440;
//Player is on the lose screen
var onLoseScreen;
//Is the player at the boss
var beginBoss = false, bossHere = false, bossReady = false, bossDead = false;
//Player ship object
var ship = {
	s: 42, //Ship size
	e: Math.floor(Math.random() * 8), //Explosion type
	eFrame: 0,
	h: false
};
//A bullet has been fired
var fired = false;
//Different key presses
var sLeft, sRight, sDown, sUp, sSpace;

//-------------------------------------------------Initialize the game-------------------------------------------

//Loads the images first, and starts the song

window.onload = function loadAssets() {
	shipImg = new Image();
	bulImg = new Image();
	bgImg = new Image();
	enemyImg = new Image();
	expImg = new Image();
	pImg = new Image();
	bgShipImg = new Image();
	bossImg = new Image();
	laserImg = new Image();
	bBulImg = new Image();
	bossExpImg = new Image();
	shipImg.src = "images/main.png";
	bulImg.src = "images/b2.png";
	bgImg.src = "images/bg2.jpg";
	enemyImg.src = "images/enemy.png";
	expImg.src = "images/exp.png";
	pImg.src = "images/p.png";
	bgShipImg.src = "images/bgship.png";
	bossImg.src = "images/boss.png";
	laserImg.src = "images/laser.png";
	bBulImg.src = "images/bbul.png";
	bossExpImg.src = "images/bossexp.png";
	var song = new Howl({
		urls: ['sounds/song.mp3'],
		loop: true,
		volume: 0.5
	}).play();
	bgImg.onload = function(e) { //Makes sure the bg is ready
		//Set the initial frame for the background
		bgX = bgImg.width/2 - canvas.width/2;
		bgY = bgImg.height - canvas.height;
		startGame();
	};
};

//The start menu
function startGame() {
	score = 0; //Score is reset after the loss screen so players can still see their scores on it
	//Draw the bg at its first frame
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(bgImg, bgX, bgY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
	//Display a red message to click the game
	ctx.fillStyle = "red";
	ctx.font = "20px Impact";
	ctx.fillText("Click to Start!", canvas.width/2 - 60, canvas.height/2);
	//Start  the game on a click
	canvas.onclick = function(e) {
		init();
		this.onclick=null; //Makes the click only work once
	};
}

function init() {
	//Player is off the lose screen
	onLoseScreen = false;
	//Generate all the objects needed
	generateStars();
	generateShip();
	generateEnemies(enemyNum);
	generatePlanets(planetNum);
	generateBgShip();
	generateBosses();
	//Set the html below the game
	hBar.innerHTML = "<span class='label label-success'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" +
			"&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>";
	board.innerHTML = "<span class='label label-primary'>Score:</span>&nbsp&nbsp" + score + 
			"<br><span class='label label-danger'>Escaped:</span>&nbsp&nbsp" + lossCount;
	//Begin rendering
	render();
}

//Generate stars and populate an array with them
function generateStars() {
	//Loop through each star
	for (i = 0; i < starNum; i++) {
		thisStar = { //Create an object
			x: Math.floor(Math.random() * canvas.width),
			y: Math.floor(Math.random() * canvas.height),
			v: Math.ceil(Math.random() * 10), //Velocity (ceil because 0 is not a velocity)
			sc: Math.random(), //Color
			size: Math.random()
		};
		starArray.push(thisStar); //Put the object in the array
	}
}

//Generate ship
function generateShip() {
	//Set all the ship object properties
	ship.x = canvas.width / 2 - (ship.s / 2);
	ship.y = canvas.height + 200;
	ship.v = 4; //Velocity
	ship.e = Math.floor(Math.random() * 8); //A random explosion to use
	ship.eFrame = 0; //Frame of the explosion
	ship.h = false; //Haven't been killed
}

//Generate enemies and populate an array with them
function generateEnemies(n) {
	//Loop through the enemies
	for (i = 0; i < n; i++) {
		var thisEnemy = { //Create an object
			x: Math.floor(Math.random() * canvas.width - (eSize + 1)),
			y: -100,
			v: Math.ceil(Math.random() * 3), //Velocity
			hit: false, //If they've been hit or not
			eFrame: 0,	//The current frame of their explosion(0 - 15)
			exp: Math.floor(Math.random()*8) //The explosion they should use (0 - 7)
		};
		//Make sure their x coord is within reach of the player
		while (thisEnemy.x < eSize) thisEnemy.x += eSize;
		while (thisEnemy.x > canvas.width - 32) thisEnemy.x -= eSize;
		//Push them to the array
		enemyArray.push(thisEnemy);
	}
}

//Generate planets and populate an array
function generatePlanets(n) {
	for(i = 0; i < n; i++) {
		//Set the planets x and direction
		var ranX = Math.random();
		var pDir = "left";
		if(ranX < 0.5) {
			ranX = Math.floor(Math.random() * -600);
			pDir = "right";
		} else {
			ranX = Math.floor(Math.random() * 600);
			pDir = "left";
		}
		//Set the planets y
		var ranY = Math.floor(Math.random() * canvas.height);
		//Corect the y if its too low or high
		if(ranY + pHeight > canvas.height)
			ranY -= pHeight;
		if(ranY < 0)
			ranY += pHeight;
		//Create the planet object
		var  thisPlanet = {
			x: ranX,
			d: pDir, //Direction (left or right)
			y: ranY,
			v: Math.ceil(Math.random() * 4) / 4, //Velocity
			p: i * 200 //The image they should use
		};
		pArray.push(thisPlanet);
	}
}

//Generate the big ship in th background
function generateBgShip() {
	var bgShip = {
		x: -1500,
		y: canvas.height/2 - bgShipImg.height/2,
		v: 1,
		c: 0 //Times it has passed the player
	}
	bgShipArray.push(bgShip);
}

function generateBosses() {
	var boss1 = {
		x: canvas.width/2 - b1Width/2,
		y: -200 - b1Height,
		t: 1, //Used to track the frames of the bosses moves
		h: 100, //How many hit it takes to kill him
		hit: false, //If he has been killed
		eFrame: 0, //Frame of his explosion
		expX: 0, //X of his explosion on sheet
		expY: 0, //Y of his epxlosion on sheet
		eSize: 190 //Size of the explosion on sheet
	}
	bossArray.push(boss1);
}

//---------------------------------------------------Game and rendering loop----------------------------------------------
function render() {
	//Only loop if the loss conditions aren't met
	if(lossCount < 6 && ship.eFrame < 16 && bossDead == false) {
		
		//Start the loop
		window.requestAnimationFrame(render); 
		
		//Update the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height); 
		if(bgY > 0) bgY -= bgV; //Only pan the image if there is space left on the image
		if(score == 200 && bossHere == false) { 
			beginBoss = true; //Start the boss fight at the end of the level
			bossHere = true; //This is so the game knows the boss is here and doesn't keep looping this
		}
		ctx.drawImage(bgImg, bgX, bgY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		
		//Update everything on the canvas from back to front
		updateStars();
		updatePlanets();
		updateBgShip();
		updateEnemies();
		updateShip();
		if(beginBoss) updateBoss();
		updateBullets();
		
		
	} else {
		lose(); //The loss conditions were met
	}
}
//-----------------------------------------------------------Game Logic------------------------------------------------------
//Updates the star field
function updateStars() {
	for (var sLoop in starArray) { 
		var star = starArray[sLoop]; //The star object
		var sColor; //Its color
		var sSize = star.size * 1.5; //Its size
		star.y = star.y + star.v; //Increment its y by its velocity
		if (star.y > canvas.height) { //Reset its y when it hits the bottom of the canvas
			star.y = 1;
			star.x = Math.floor(Math.random() * canvas.width);
			star.v = Math.ceil(Math.random() * 5);
		}
		if (star.sc <= 0.33) sColor = "lightblue"; //Choose a color
		if (star.sc > 0.33 && star.sc <= 0.66) sColor = "yellow";
		if (star.sc > 0.66) sColor = "purple";
		ctx.fillStyle = sColor;
		ctx.beginPath(); //Draw the star
		ctx.arc(star.x, star.y, sSize, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
	}
}	

//Updates the planets
function updatePlanets() {
	for(var pLoop in pArray) {
		var planet = pArray[pLoop]; //The planet object
		//Reset the planet it exceeds 800 pixels offscreen in either direction
		if (planet.x > canvas.width + 800 || planet.x < -800) {
			planet.x = planet.x * -1;
		}
		//Increment its x left or right based on its direction
		if(planet.d == "left") planet.x -= planet.v; 
		if(planet.d == "right") planet.x += planet.v;
		//Draw the planet
		ctx.drawImage(pImg, planet.p, 0, 200, 250, planet.x, planet.y, pWidth, pHeight);
	}
}

//Update the ship in the background
function updateBgShip() {
	for(var bgShipLoop in bgShipArray) {
		var bgShip = bgShipArray[bgShipLoop];
		if(bgShip.c < 3) { //Only draw the ship if it hasn't passed 3 times
			bgShip.x += bgShip.v;
			if(bgShip.x > 1500) {
				bgShip.x = -3000;
				bgShip.c++;
			}
			ctx.drawImage(bgShipImg, bgShip.x, bgShip.y, bgShipImg.width, bgShipImg.height);
		} else { //If it has, delete it
			bgShipArray.splice(bgShipLoop, 1);
		}
	}
}

//Updates the enemies
function updateEnemies() {
	for (var eLoop in enemyArray) { 
		var enemy = enemyArray[eLoop]; //The enemy object
		
		if(beginBoss) enemy.hit = true; //All enemies have been hit now that the boss is here
		
		//If the enemy hasn't been hit update their position
		if(enemy.hit == false) { 
			enemy.y += enemy.v; //Increment their y
			
			if (enemy.y > canvas.height) { //If the enemy makes it to the bottom of the screen
				lossCount++;
				//Update the scoreboard
				board.innerHTML = "<span class='label label-primary'>Score:</span>&nbsp&nbsp" + score + 
				"<br><span class='label label-danger'>Escaped:</span>&nbsp&nbsp" + lossCount;
				//Create new coordinates and velocity for a "new" enemy
				enemy.x = Math.floor(Math.random() * canvas.width - (eSize + 1));
				enemy.y = -100;
				enemy.v = Math.ceil(Math.random() * 3);
				//These while loops move unacceptable x's closer to the center of the screen
				while (enemy.x < eSize) enemy.x += eSize;
				while (enemy.x > canvas.width - eSize) enemy.x -= eSize;
			}
			
			//Check if the enemy has collided with our sip
			if (ship.h == false && enemy.x < ship.x + (ship.s - 20) && enemy.x + (eSize - 20) > ship.x && enemy.y < ship.y + ship.s && enemy.y + eSize > ship.y) {
				//Damage the player, set the player to dead if damage exceeds 3
				damage++;
				if(damage > 3) ship.h = true;
				
				//Tick down the health bar
				switch(damage) {
					case 1:
						hBar.innerHTML = "<span class='label label-success'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>";
						break;
					case 2:
						hBar.innerHTML = "<span class='label label-success'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>";
						break;
					case 3:
						hBar.innerHTML = "<span class='label label-success'>&nbsp&nbsp&nbsp&nbsp</span>";
						break;
					case 4:
						hBar.innerHTML = "<span class='label label-danger'></span>";
						break;					
				}
				
				//Play a sound and set the enemy to hit
				var explode = new Howl({
					urls: ['sounds/g.mp3'],
					buffer: true,
					volume: 0.25
				}).play();
				enemy.hit = true;
			}
			
			ctx.drawImage(enemyImg, enemy.x, enemy.y, eSize, eSize); //Draw the enemy
			
		} else { //The enemy was hit, so cycle through their explosion
		
			if(enemy.eFrame < 16) { //If their explosion is still occurring
				var expX = enemy.eFrame * 64; //Which explosion img coordinates
				var expY = enemy.exp * 64
				//Draw the explosion
				ctx.drawImage(expImg, expX, expY, 64, 64, enemy.x, enemy.y, eSize, eSize)
				enemy.eFrame++; //Increment to the next explosion frame
				
			} else { //The enemies explosion is finished
				if(beginBoss == false) { //Regenerate them if we arent on the boss
					enemy.x = Math.floor(Math.random() * canvas.width - (eSize + 1));
					enemy.y = -100;
					enemy.v = Math.ceil(Math.random() * 3);
					while (enemy.x < eSize) enemy.x += eSize;
					while (enemy.x > canvas.width - eSize) enemy.x -= eSize;
					enemy.hit = false;
					enemy.eFrame = 0;
					enemy.exp = Math.floor(Math.random()*8);
				}
			}
		}
	}
}

//Updates the player ship
function updateShip() {
	//The coordinates of the player image on the sprite sheet
	var startX, startY;
	//Choose an image based on its direction if not hit
	if(ship.h == false) {
		if(sLeft) {
			startX = 0;
			startY = 0;
		} else if(sRight) {
			startX = 2 * ship.s;
			startY = 0;
		} else if(sUp) {
			startX = ship.s;
			startY = ship.s;
		} else if(sUp && sLeft) {
			startX = 0;
			startY = ship.s;
		} else if(sUp && sRight) {
			startX = 2 * ship.s;
			startY = ship.s;
		} else if(sDown) {
			startX = ship.s;
			startY = 2 * ship.s;
		} else if(sDown && sLeft) {
			startX = 0;
			startY = 2 * ship.s;
		} else if(sDown && sRight) {
			startX = 2 * ship.s;
			startY = 2 * ship.s;
		} else {
		startX = ship.s;
		startY = 0;
		}
		
		//Draw the ship at its new position with the image chosen then increment it to a new position
		ctx.drawImage(shipImg, startX, startY, ship.s, ship.s, ship.x, ship.y, ship.s, ship.s);
		if (ship.x <= 1) ship.x += 5;
		if (ship.x >= canvas.width - (ship.s + 1)) ship.x -= 5;
		if (ship.y <= 3) ship.y += 5;
		if (ship.y >= canvas.height - (ship.s + 3)) ship.y -= 5;
		if (sRight) ship.x += ship.v;
		if (sLeft) ship.x -= ship.v;
		if (sUp) ship.y -= ship.v;
		if (sDown) ship.y += ship.v;
	} else {
		//The ship has been hit, blow it up
		if(ship.eFrame < 16) {
			var expX = ship.eFrame * 64;
			var expY = ship.e * 64
			ctx.drawImage(expImg, expX, expY, 64, 64, ship.x, ship.y, ship.s, ship.s)
			ship.eFrame++;
		}
	}
}

//Update the boss
function updateBoss() {
	var levelBoss = bossArray[0]; //The boss object
	
	//Update the boss if he's not dead
	if(levelBoss.hit == false) {
		if(levelBoss.y < -20) levelBoss.y ++; //Slowly move the boss down onto the screen
		
		if(levelBoss.y >= -20) { //Once he's on the screen
			if(levelBoss.x < canvas.width - b1Width + 10 && levelBoss.t == 1) {
				levelBoss.x++; //Move him to the right to begin his back and forth move
			} else { 
				//Begin the back and forth laser move
				bossLateral(levelBoss);
				 //Boss is ready to fight and can now take damage
				bossReady = true;	
			}
		}
		
		//Check if the player has collided with the boss, kill them if they do
		if (ship.h == false && ship.x < levelBoss.x + b1Width && ship.x + ship.s > levelBoss.x && ship.y < levelBoss.y + b1Height && ship.y + ship.s > levelBoss.y) {
			ship.h = true;
		}
			
		ctx.drawImage(bossImg, levelBoss.x, levelBoss.y, b1Width, b1Height);
	} else { //The boss is dead, trigger its explosion		
		if(levelBoss.eFrame < 65) {
			//Draw the current explosion frame
			ctx.drawImage(bossExpImg, levelBoss.expX, levelBoss.expY, levelBoss.eSize, levelBoss.eSize, levelBoss.x + (b1Width/2 - levelBoss.eSize/2), levelBoss.y + (b1Height/2 - levelBoss.eSize/2), levelBoss.eSize, levelBoss.eSize);
			
			//Increment the explosions x and y on the sheet every 8 frames
			if(levelBoss.eFrame % 2 == 0) {
				levelBoss.expX += levelBoss.eSize;
				if(levelBoss.eFrame % 5 == 0) {
					levelBoss.expX = 0;
					levelBoss.expY += levelBoss.eSize;
				}
			}
			levelBoss.eFrame += 0.25;
		} else { //The explosion is over, end the level
			bossDead = true;
		}
	}
}

//Boss moves back and forth
var laserPixelX = 150; //Location of the laser on the sprite sheet
var laserPixelY = 0;
var laserW = 45;
var laserH = 370;
var laserFire = 1; //Starting frame for the entire laser firing
var laserT = 1; //Starting frame for which laser to animate with
function bossLateral(levelBoss) {
	//This cosine wave makes him move back and forth
	levelBoss.x = (Math.cos(levelBoss.t++/50)*175+250) - b1Width/2;
	var laserX = levelBoss.x + (b1Width/2 - 45/2); //X coordinate of the laser
	var laserY = (levelBoss.y + b1Height/2)+20; //Y coordinate
		
	//Fire the laser for 55 Frames
	if(laserFire < 56) {		
		//Play laser sound effect on first frame
		if(laserFire == 1) {
			var bossLaser = new Howl({ 
				urls: ['sounds/bosslaser.mp3'],
				volume: 0.5,
				buffer: true
			}).play();
		}
		
		//Draw the laser
		ctx.drawImage(laserImg, laserPixelX, laserPixelY, 25, 198, laserX, laserY, laserW, laserH);
		
		//Rotate between the 3 full length lasers every 5 frames
		laserT++; 
		if(laserT > 5) {
			laserT = 1;
			laserPixelX += 25;
			if(laserPixelX > 200) laserPixelX = 150;
		}	
	} 
	
	//After that taper it off and reset it
	if(laserFire == 56) {
		laserPixelX = 125;
		laserPixelY = 30;
		laserH = 314;
		ctx.drawImage(laserImg, laserPixelX, laserPixelY, 25, 198-laserPixelY, laserX, laserY, laserW, laserH);
	}
	if(laserFire == 57) {
		laserPixelX = 100;
		laserPixelY = 105;
		laserH = 174;
		ctx.drawImage(laserImg, laserPixelX, laserPixelY, 25, 198-laserPixelY, laserX, laserY, laserW, laserH);
	}
	if(laserFire == 58) {
		laserPixelX = 75;
		laserPixelY = 145;
		laserH = 99;
		ctx.drawImage(laserImg, laserPixelX, laserPixelY, 25, 198-laserPixelY, laserX, laserY, laserW, laserH);
	}
	if(laserFire == 59) {
		laserPixelX = 50;
		laserPixelY = 175;
		laserH = 43;
		ctx.drawImage(laserImg, laserPixelX, laserPixelY, 25, 198-laserPixelY, laserX, laserY, laserW, laserH);
	}
	if(laserFire == 60) {
		laserPixelX = 25;
		laserPixelY = 180;
		laserH = 34;
		ctx.drawImage(laserImg, laserPixelX, laserPixelY, 25, 198-laserPixelY, laserX, laserY, laserW, laserH);
	}
	if(laserFire == 61) {
		laserPixelX = 0;
		laserPixelY = 190;
		laserH = 15;
		ctx.drawImage(laserImg, laserPixelX, laserPixelY, 25, 198-laserPixelY, laserX, laserY, laserW, laserH);
	}
	
	//Reset the sequence
	if(laserFire > 110) {
		laserFire = 0; 
		laserPixelX = 150;
		laserPixelY = 0;
		laserW = 45;
		laserH = 370;
	}
	
	//If the player hits the laser kill them
	if (ship.h == false && ship.x < laserX + laserW && ship.x + ship.s > laserX && ship.y < laserY + laserH && ship.y + ship.s > laserY) {
		ship.h = true;
		//lose();
	}
	
	laserFire++; //Increment the laser firing frames by 1
}



//Update the bullets
function updateBullets() {
	for (var bLoop in bArray) { 
		var bullet = bArray[bLoop]; //The bullet object
		
		//Only need to update the bullet if it hasnt been marked to explode
		if(bullet.h == false) {
			//Draw the bullet
			ctx.drawImage(bulImg, bullet.x, bullet.y, bSize, bSize);
			
			//Get its new position
			bullet.y -= bullet.v;
			
			//Delete it when it gets offscreen
			if(bullet.y < 0)
				bArray.splice(bLoop, 1);
			
			for (var enemyLoop in enemyArray) {
				var thisE = enemyArray[enemyLoop]; //Enemy object
				
				//Check if the bullet has collided with an enemy that hasn't been hit already
				if (thisE.hit == false && bullet.x < thisE.x + eSize && bullet.x + 10 > thisE.x && bullet.y < thisE.y + eSize && bullet.y + eSize > thisE.y) {
					thisE.hit = true; //Enemy was hit
					
					//Play explosion sound
					var explode = new Howl({
						urls: ['sounds/g.mp3'],
						buffer: true,
						volume: 0.15
					}).play();
					
					bArray.splice(bLoop, 1); //Terminate the bullet
					score++; //Update score
					board.innerHTML = "<span class='label label-primary'>Score:</span>&nbsp&nbsp" + score + 
					"<br><span class='label label-danger'>Escaped:</span>&nbsp&nbsp" + lossCount;
				}
			}
			
			for(var bossLoop in bossArray) {
				var thisBoss = bossArray[bossLoop];
				
				//Check if the bullet has collided with a boss that's alive
				if (bossReady && thisBoss.hit == false && bullet.x < thisBoss.x + b1Width && bullet.x + 10 > thisBoss.x && bullet.y < thisBoss.y + b1Height && bullet.y + 10 > thisBoss.y) {
					thisBoss.h--; //Deduct a health point
					
					bullet.h = true; //Bullet is marked to explode
					
					if(thisBoss.h == 0) { //Kill them when their health is zero
						thisBoss.hit = true;
						score += 1000; //Get lots of points
						//Play boss explosion sound
						var bossExp = new Howl({
							urls: ['sounds/bossexp.mp3'],
							buffer: true
						}).play();
					}
					
					//Play explosion sound
					var explode = new Howl({
						urls: ['sounds/g.mp3'],
						buffer: true,
						volume: 0.15
					}).play();
					
					//asdf
				}
			}
		} else { //The bullet has been marked to explode
			if(bullet.eFrame < 16) { //If the explosion is still occurring
				var expX = bullet.eFrame * 64; //Which explosion img coordinates
				var expY = bullet.e * 64
				//Draw the explosion
				ctx.drawImage(expImg, expX, expY, 64, 64, bullet.x, bullet.y, eSize, eSize)
				bullet.eFrame++; //Increment to the next explosion frame
			} else { //The explosion is over
				bArray.splice(bLoop, 1); //Terminate the bullet
			}
		}
	}
}

//Fires bullets
function fireBullet() {
	var bullet = { //Creates a bullet object
		x: ship.x + (ship.s / 2 - bSize / 2),
		y: ship.y - bSize,
		v: 5, //Velocity
		e: Math.floor(Math.random() * 8), //Explosion type
		eFrame: 0,
		h: false
	};
	//Play fire sound
	var shoot = new Howl({
		urls: ['sounds/laser.mp3'],
		buffer: true,
		volume: 0.15
	}).play();
	//Add bullet to array
	bArray.push(bullet);
}

//Lose the game
function lose() {
	onLoseScreen = true; //Player is on the lose screen
	//Update scoreboard
	if(bossDead) {
		board.innerHTML = "<span class='label label-primary'>Score:</span>&nbsp&nbsp" + score + 
				"<br><span class='label label-danger'>You won! Click to try again!</span>";
	} else {
	board.innerHTML = "<span class='label label-primary'>Score:</span>&nbsp&nbsp" + score + 
				"<br><span class='label label-danger'>You lost! Click to try again!</span>";
	}
	starArray = []; //Reset the arrays
	bArray = [], enemyArray = [], pArray = [], bgShipArray = [], bossArray = [];
	beginBoss = false, bossHere = false, bossReady = false, bossDead = false;
	damage = 0; //Reset loss conditions
	lossCount = 0;
	bgX = bgImg.width/2 - canvas.width/2; //Reset background
	bgY = bgImg.height - canvas.height;
	//Start a new game
	startGame();
}

//------------------------------------Keyboard handling---------------------------------------
document.addEventListener('keydown', function (event) {
	if(onLoseScreen == false) {
		switch (event.keyCode) {
			case 37:
				sLeft = true;
				break;
			case 39:
				sRight = true;
				break;
			case 38:
				sUp = true;
				break;
			case 40:
				sDown = true;
				break;
			case 32:
				if (fired === false) {
					fired = true;
					fireBullet();
				}
				break;
		}
	}
});
document.addEventListener('keyup', function (event) {
	switch (event.keyCode) {
		case 37:
			sLeft = false;
			break;
		case 39:
			sRight = false;
			break;
		case 38:
			sUp = false;
			break;
		case 40:
			sDown = false;
			break;
		case 32:
			fired = false;
			break;
	}
});