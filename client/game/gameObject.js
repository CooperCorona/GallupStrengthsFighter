import { boundingBox } from './boundingBox.js';
import { healthBar } from './healthBar.js';

export function gameObject(x, y, width, height, color, health) {
	this.boundingBox	= boundingBox(x, y, width, height)
	this.color			= color
	this.speed 			= 0.0
	this.isMoving		= false
	this.angle 			= 0.0
	this.isAttack		= false
	this.isEnemy		= false
	this.id				= 0
	this.offense		= 1.0
	this.defense		= 1.0
	this.goThru			= false
	this.attackDuration	= 40
	this.attackSpeed	= 3
	this.xAccel			= 0.0
	this.yAccel			= 0.0
	this.xSpeed			= 0.0
	this.ySpeed			= 0.0
	this.deceleration	= 0.65
	if (health) {
		this.healthBar		= new healthBar(health, width, height / 4.0)
	}
	this.boundingBox	= new boundingBox(x, y, width, height)
	
	/*this.xSpeed			= function() {
		return this.speed * Math.cos(this.angle)
	}
	this.ySpeed			= function() {
		return this.speed * Math.sin(this.angle)
	}*/
	
	this.update 		= function() {
		this.xSpeed += this.xAccel
		this.ySpeed += this.yAccel
		this.xSpeed *= this.deceleration
		this.ySpeed *= this.deceleration
		this.boundingBox.x += this.xSpeed
		this.boundingBox.y += this.ySpeed
	}
	
	this.render 		= function(context) {
		context.fillStyle = this.color
		context.fillRect(this.boundingBox.left(), this.boundingBox.top(), this.boundingBox.width, this.boundingBox.height)
		if (this.healthBar) {
			this.healthBar.render(context, this.boundingBox.x, this.boundingBox.top() - this.healthBar.height)
		}
	}
	
	this.input			= function(gameArea) {
		
	}
	
	this.isAlive		= function() {
		return this.healthBar.health > 0
	}
	
	this.shootAttack	= function(x, y, color, damage, speed, duration) {
		var angle = Math.atan2(y - this.boundingBox.y, x - this.boundingBox.x)
		var aX = this.boundingBox.x
		var aY = this.boundingBox.y
		var attack = createAttack(aX, aY, 16, color, damage * this.offense, speed, angle, duration)
		attack.ownerId = this.id
		attack.goThru = this.goThru
		return attack
	}
}

export function createPlayer(x, y, width, height) {
	var player = new gameObject(x, y, width, height, "green", 100)
	player.id 					= 1
	player.speed 				= 1.0
	player.uberAttackCooldown 	= 0
	player.shootDuration 		= 40
	player.attackSize 			= width / 2.0
	player.attackSpeed			= 4
	player.render = function(context) {
		context.fillStyle = this.color
		context.fillRect(this.boundingBox.left(), this.boundingBox.top(), this.boundingBox.width, this.boundingBox.height)
		if (this.healthBar) {
			this.healthBar.render(context, this.boundingBox.x, this.boundingBox.top() - this.healthBar.height)
		}
		
		const width = this.uberAttackCooldown / 1500
		context.fillStyle = "#8000FF"
		context.fillRect(0, 0, width * 64, 8)
	}
	player.input = function(gameArea) {
		if (gameArea.rightKeyPressed && gameArea.downKeyPressed) {
			this.angle = Math.PI / 4.0
		} else if (gameArea.rightKeyPressed && gameArea.upKeyPressed) {
			this.angle = -Math.PI / 4.0
		} else if (gameArea.leftKeyPressed && gameArea.downKeyPressed) {
			this.angle = 3.0 * Math.PI / 4.0
		} else if (gameArea.leftKeyPressed && gameArea.upKeyPressed) {
			this.angle = -3.0 * Math.PI / 4.0
		} else if (gameArea.rightKeyPressed) {
			this.angle = 0.0
		} else if (gameArea.leftKeyPressed) {
			this.angle = Math.PI
		} else if (gameArea.upKeyPressed) {
			this.angle = -Math.PI / 2.0
		} else if (gameArea.downKeyPressed) {
			this.angle = Math.PI / 2.0
		}
		
		if (gameArea.keyPressed()) {
			this.isMoving = true
			this.xAccel = this.speed * Math.cos(this.angle)
			this.yAccel = this.speed * Math.sin(this.angle)
		} else {
			this.isMoving = false
			this.xAccel = 0.0
			this.yAccel = 0.0
		} 
		
		this.uberAttackCooldown = Math.max(this.uberAttackCooldown - 1, 0);

	}
	return player
}

export function createEnemy(x, y, width, height, health) {
	var enemy = new gameObject(x, y, width, height, "#C00", health)
	enemy.cooldown = 0
	enemy.pauseToShootCount = 0
	enemy.id = 2
	enemy.isEnemy = true
	enemy.speed = 0.75
	enemy.framesAlive = 0
	enemy.readyToAttack = function() {
		return this.cooldown <= 0
	}
	enemy.canMove = function() {
		return this.pauseToShootCount <= 0
	}
	enemy.input = function(gameArea) {
		if (this.readyToAttack()) {
			var attack = this.shootAttack(gameArea.player.boundingBox.x, gameArea.player.boundingBox.y, "#F80", 15, this.attackSpeed, this.attackDuration)
			gameArea.children.push(attack)
			this.resetAttackCooldown()
			this.pauseToShootCount = 30
		} 
		if (this.canMove()) {
			this.isMoving = true
			this.angle = Math.atan2(gameArea.player.boundingBox.y - this.boundingBox.y, gameArea.player.boundingBox.x - this.boundingBox.x)
			this.xAccel = this.speed * Math.cos(this.angle)
			this.yAccel = this.speed * Math.sin(this.angle)
		} else {
			this.isMoving = false
			this.xAccel = 0.0
			this.yAccel = 0.0
		}
	}
	enemy.update = function() {
		this.xSpeed += this.xAccel
		this.ySpeed += this.yAccel
		this.xSpeed *= this.deceleration
		this.ySpeed *= this.deceleration
		this.boundingBox.x += this.xSpeed
		this.boundingBox.y += this.ySpeed
		this.cooldown--
		this.pauseToShootCount--
		this.framesAlive++
	}
	enemy.resetAttackCooldown = function() {
		//this.cooldown = 120 + Math.floor(Math.random() * 121)
		this.cooldown = 60 + Math.floor(Math.random() * 31)
	}
	enemy.resetAttackCooldown()
	return enemy
}

export function createAttack(x, y, size, color, damage, speed, angle, duration) {
	var attack = new gameObject(x, y, size, size, color, null)
	attack.speed 	= speed
	attack.angle 	= angle
	attack.xSpeed	= speed * Math.cos(angle)
	attack.ySpeed	= speed * Math.sin(angle)
	attack.damage 	= damage
	attack.duration	= duration
	attack.goThru	= false
	attack.isAttack	= true
	attack.id		= 3
	attack.isMoving	= true
	attack.update = function() {
		this.duration--
		this.boundingBox.x += this.xSpeed
		this.boundingBox.y += this.ySpeed
	}
	attack.isAlive = function() {
		return this.duration > 0
	}
	return attack
}

export function createLabel(x, y, fontHeight, fontName) {
	this.x = x
	this.y = y
	this.fontHeight = fontName
	this.fontName = fontHeight
	this.text = "0"
	this.render = function(context) {
		context.font = this.fontHeight + " " + this.fontName
		context.fillStyle = "#000000"
		context.fillText(this.text, this.x, this.y)
	}
	this.update = function() { }
	this.input = function() { }
}