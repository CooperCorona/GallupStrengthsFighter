import { gameObject, createPlayer, createEnemy, createAttack, createLabel } from '../game/gameObject.js';
import { healthBar } from '../game/healthBar.js';

Template.strengths.helpers({
	strengths() {
		return [
			{strength: "Achiever"},
			{strength: "Activator"},
			{strength: "Adaptability"},
			{strength: "Analytical"},
			{strength: "Arranger"},
			{strength: "Belief"},
			{strength: "Command"},
			{strength: "Communication"},
			{strength: "Competition"},
			{strength: "Connectedness"},
			{strength: "Consistency"},
			{strength: "Context"},
			{strength: "Deliberative"},
			{strength: "Developer"},
			{strength: "Discipline"},
			{strength: "Empathy"},
			{strength: "Focus"},
			{strength: "Futuristic"},
			{strength: "Harmony"},
			{strength: "Ideation"},
			{strength: "Includer"},
			{strength: "Individualization"},
			{strength: "Input"},
			{strength: "Intellection"},
			{strength: "Learner"},
			{strength: "Maximizer"},
			{strength: "Positivity"},
			{strength: "Relator"},
			{strength: "Responsibility"},
			{strength: "Restorative"},
			{strength: "Self-Assurance"},
			{strength: "Significance"},
			{strength: "Strategic"},
			{strength: "Woo"}
		]
	}
})

export function createGameArea() {
	
	this.setup = false
	this.width = 640
	this.height = 480
	this.paused = false
	this.player = {}
	this.children = []
	this.leftKeyPressed = false
	this.rightKeyPressed = false
	this.upKeyPressed = false
	this.downKeyPressed = false
	this.spaceKeyPressed = false
	this.spawnEnemyTime = 0
	this.spawnEnemyIndex = 0
	this.spawnEnemyOffsets = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
	//this.maximumEnemies = [5, 5, 5, 6, 6, 7, 7, 8, 9, 10]
	this.maximumEnemies = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
	this.currentEnemyCount = 0
	this.spawnEnemyIndexCount = 180
	this.strengths = []
	this.attackCooldown = 0
	this.points = 0
	this.pointsLabel = new createLabel(600, 8, "Arial", "10px")
	this.frameCount = 0
	this.isStopped = false
	
	this.render = function() {
		if (!this.paused) {
			this.context.clearRect(0, 0, this.width, this.height)
			var x = 0
			for (i in this.children) {
				var child = this.children[i]
				child.input(this)
				child.update()
				this.constrainToBounds(child)
				this.checkCollision(x)
				child.render(this.context)
				x++
			}
			if (this.player.isAlive()) {
				this.points++
			} else {
				this.stop()
			}
			this.pointsLabel.text = this.points
			this.pointsLabel.render(this.context)
			this.children = this.children.filter((c) => { return c.isAlive() })
			this.spawnEnemyTime--
			if ((this.spawnEnemyTime <= 0 && this.currentEnemyCount < this.maximumEnemies[this.spawnEnemyIndex]) || this.currentEnemyCount <= 0) {
				this.spawnEnemy()
				this.spawnEnemyTime = this.spawnEnemyOffsets[this.spawnEnemyIndex] * 20
			}
			this.spawnEnemyIndexCount--
			if (this.spawnEnemyIndexCount < 0 && this.spawnEnemyIndex < this.spawnEnemyOffsets.length - 1) {
				this.spawnEnemyIndex++
				this.spawnEnemyIndexCount = 180
			}
			this.currentEnemyCount = this.children.reduce((l, r, index, array) => { return l + (r.isEnemy ? 1 : 0) }, 0)
			
			if (this.attackCooldown > 0) {
				this.attackCooldown--
			}
			
			this.player.offense = 1.0
			this.player.defense = 1.0
			this.player.speed = 1.0
			for (i in this.strengths) {
				this.processStrength(this.strengths[i])
			}
			if (this.contains("Consistency")) {
				var average = (this.player.offense + this.player.defense + this.player.speed) / 3.0 + 0.1
				this.player.offense = average
				this.player.defense = average
				this.player.speed = average
			}
			this.frameCount++
		}
	}
	this.constrainToBounds = function(child) {
		if (child.boundingBox.left() < 0) {
			child.boundingBox.x -= child.boundingBox.left()
		} else if (child.boundingBox.right() > this.width) {
			child.boundingBox.x -= child.boundingBox.right() - this.width
		}
		
		if (child.boundingBox.top() < 0) {
			child.boundingBox.y -= child.boundingBox.top()
		} else if (child.boundingBox.bottom() > this.height) {
			child.boundingBox.y -= child.boundingBox.bottom() - this.height
		}
		
	}
	this.unpause = function() {
		if (!this.interval) {
			this.interval = setInterval(renderGame, 17)
		}
		this.paused = false;
	}
	this.pause = function() {
		this.paused = true
	}
	this.keyPressed = function() {
		return this.leftKeyPressed || this.rightKeyPressed || this.upKeyPressed || this.downKeyPressed
	}
	this.checkCollision = function(i) {
		var j = 0
		for (j = i + 1; j < this.children.length; j++) {
			if (this.children[i].boundingBox.collidesWith(this.children[j].boundingBox)) {
				if (this.children[i].isAttack && this.children[j].isAttack) {
					this.handleCollisionBetweenAttacks(this.children[i], this.children[j])
					
				} else if (!this.children[i].isAttack && this.children[j].isAttack) {
					this.handleCollisionBetweenBodyAndAttack(this.children[i], this.children[j])
					
				} else if (this.children[i].isAttack && !this.children[j].isAttack) {
					this.handleCollisionBetweenBodyAndAttack(this.children[j], this.children[i])
					
				} else if (!this.children[i].isAttack && !this.children[j].isAttack) {
					this.handleCollisionBetweenBodies(this.children[i], this.children[j])
				}
			}
		}
	}
	
	this.handleCollisionBetweenBodies = function(childI, childJ) {
		var overlap = childI.boundingBox.overlap(childJ.boundingBox)
		var xFactor = (childI.boundingBox.x < childJ.boundingBox.x) ? 1.0 : -1.0
		var yFactor = (childI.boundingBox.y < childJ.boundingBox.y) ? 1.0 : -1.0
		if (overlap.width > overlap.height) {
			xFactor = 0.0
		} else if (overlap.height > overlap.width) {
			yFactor = 0.0
		}
		const epsilon 	= 0.001
		var maxSpeed 	= Math.abs(childI.speed + epsilon) + Math.abs(childJ.speed + epsilon)
		var iPushFactor	= Math.abs(childJ.speed + epsilon) / maxSpeed
		var jPushFactor	= Math.abs(childI.speed + epsilon) / maxSpeed
		childI.boundingBox.x -= overlap.width  * xFactor * iPushFactor
		childI.boundingBox.y -= overlap.height * yFactor * iPushFactor
		childJ.boundingBox.x += overlap.width  * xFactor * jPushFactor
		childJ.boundingBox.y += overlap.height * yFactor * jPushFactor
		
		if (childI.isEnemy != childJ.isEnemy) {
			var enemy = (childI.isEnemy ? childI : childJ)
			if (this.contains("Responsibility") && this.frameCount % 10 == 0) {
				enemy.healthBar.health -= 4.0 / enemy.defense
			}
			if (this.contains("Command")) {
				var angle = Math.atan2(enemy.boundingBox.y - this.player.boundingBox.y, enemy.boundingBox.x - this.player.boundingBox.x)
				enemy.xSpeed = 60 * Math.cos(angle)
				enemy.ySpeed = 60 * Math.sin(angle)
			}
		}
	}
	this.handleCollisionBetweenBodyAndAttack = function(body, attack) {
		if (attack.ownerId == body.id) {
			return;
		}
		body.healthBar.health -= attack.damage / body.defense
		if (!attack.goThru) {
			attack.duration = 0
		}
		if (body.isEnemy) {
			var enemies = this.children.filter((c) => { return c.isEnemy })
			if (this.contains("Connectedness")) {
				for (i in enemies) {
					enemies[i].healthBar.health -= attack.damage / enemies[i].defense / 5.0
				}
			}
			if (this.contains("Deliberative")) {
				var angle = Math.atan2(body.boundingBox.y - attack.boundingBox.y, body.boundingBox.x - attack.boundingBox.x)
				body.xSpeed = 50.0 * Math.cos(angle)
				body.ySpeed = 50.0 * Math.sin(angle)
			}
			if (this.contains("Communication")) {
				var enemies = this.children.filter((e) => { return e.isEnemy })
				for (i in enemies) {
					var angle = Math.atan2(enemies[i].boundingBox.y - attack.boundingBox.y, enemies[i].boundingBox.x - attack.boundingBox.x)
					enemies[i].xSpeed = 25.0 * Math.cos(angle)
					enemies[i].ySpeed = 25.0 * Math.sin(angle)
				}
			}
		}
		if (body.isEnemy && !body.isAlive()) {
			if (this.contains("Achiever")) {
				this.points += 200 * this.spawnEnemyIndex
			} else {
				this.points += 100 * this.spawnEnemyIndex
			}
		} else if (!body.isEnemy) {
			if (this.contains("Input")) {
				var enemies = this.children.filter((e) => { return e.isEnemy })
				for (i in enemies) {
					enemies[i].healthBar.health -= attack.damage / enemies[i].defense
				}
			}
		}
	}
	this.handleCollisionBetweenAttacks = function(attackI, attackJ) {
		if (attackI.ownerId != attackJ.ownerId) {
			const oldIDamage = attackI.damage
			attackI.damage -= attackJ.damage
			attackJ.damage -= oldIDamage
			if (attackI.damage <= 0) {
				attackI.duration = 0
			}
			if (attackJ.damage <= 0) {
				attackJ.duration = 0
			}
		}
	}
	this.canvasOffset = function() {
		var rect = document.getElementById("canvas").getBoundingClientRect();
		return {x: rect.left, y: rect.top}
	}
	this.mouseClicked = function(x, y) {
		if (this.player.isAlive() && !this.paused && this.attackCooldown <= 0) {
			var offset = this.canvasOffset()
			x -= offset.x
			y -= offset.y
			
			var startI = (this.contains("Harmony") ? -1 : 0)
			var endI = (this.contains("Harmony") ? 1 : 0)
			var i = startI
			for (i = startI; i <= endI; i++) {
				var multiplier = (this.contains("Individualization") ? Math.random() * 2.0 + 1.0 : 1.0)
				var attack = this.player.shootAttack(x, y, "cyan", 20 * multiplier, this.player.attackSpeed, (this.contains("Maximizer") ? 80 : 40))
				var angle = Math.atan2(y - this.player.boundingBox.y, x - this.player.boundingBox.x) + i * Math.PI / 12.0
				attack.angle	= angle
				attack.xSpeed 	= attack.speed * Math.cos(angle)
				attack.ySpeed 	= attack.speed * Math.sin(angle)
				attack.boundingBox.width = this.player.attackSize
				attack.boundingBox.height = this.player.attackSize
				this.children.push(attack)
			}
			this.attackCooldown = 20
			if (this.contains("Focus")) {
				this.attackCooldown *= 2.0
			}
			if (this.contains("Ideation")) {
				this.attackCooldown /= 2.0
			}
		}
	}
	this.rightMouseClicked = function() {
		if (this.player.uberAttackCooldown <= 0 && !this.paused && this.player.isAlive()) {
			var range = (this.contains("Belief") ? 360 : 288)
			var attack = createAttack(this.player.boundingBox.x, this.player.boundingBox.y, range, "rgb(100, 0, 200)", 50, 0, 0, 10)
			attack.goThru = true
			attack.ownerId = this.player.id
			this.children.push(attack)
			this.player.uberAttackCooldown = 1500
		}
	}
	this.spawnEnemy = function() {
		var x = Math.random()
		var y = Math.random()
		while (Math.abs(x - this.player.boundingBox.x / this.width) < 0.2) {
			x = Math.random()
		}
		while (Math.abs(y - this.player.boundingBox.y / this.height) < 0.2) {
			y = Math.random()
		}
		var enemy = createEnemy(this.width * x, this.height * y, 32, 32, 25 + 3 * this.spawnEnemyIndex)
		enemy.speed += Math.random() * this.spawnEnemyIndex / 20.0
		if (this.contains("Analytical")) {
			enemy.attackSpeed /= 2.0
			enemy.attackDuration *= 2.0
		}
		this.children.push(enemy)
		return enemy
	}
	this.processStrength = function(strength) {
		if (strength == "Achiever") {
			//Doubles points receieved for killing enemies
		} else if (strength == "Activator") {
			if (this.frameCount % 1200 <= 300) {
				this.player.offense *= 2.5
				this.player.defense *= 2.5
				this.player.speed *= 2.5
			}
		} else if (strength == "Adaptability") {
			this.player.defense += this.currentEnemyCount / 10.0
		} else if (strength == "Analytical") {
			//Slows down enemy attacks
		} else if (strength == "Arranger") {
			this.player.offense += this.currentEnemyCount / 20.0
			this.player.defense += this.currentEnemyCount / 20.0
			this.player.speed += this.currentEnemyCount / 20.0
		} else if (strength == "Belief") {
			//Increases range of uber attack
		} else if (strength == "Command") {
			//Knocks back enemies when they touch you
		} else if (strength == "Communication") {
			//Knocks back all enemies
		} else if (strength == "Competition") {
			this.player.offense += this.currentEnemyCount / 10.0
		} else if (strength == "Connectedness") {
			//Deals damage to all enemies when 1 is hit
		} else if (strength == "Consistency") {
			//Averages offense, defense, and speed
		} else if (strength == "Context") {
			var xDist = Math.abs(this.player.boundingBox.x - this.width / 2.0)
			var yDist = Math.abs(this.player.boundingBox.y - this.height / 2.0)
			if (xDist <= this.width / 4.0 && yDist <= this.height / 4.0) {
				this.player.offense *= 2.0
				this.player.defense *= 2.0
			}
		} else if (strength == "Deliberative") {
			//Deals knockback
		} else if (strength == "Developer") {
			var enemies = this.children.filter((e) => { return e.isEnemy })
			for (i in enemies) {
				var count = Math.min(enemies[i].framesAlive / 300.0, 1.0)
				this.player.offense += count / 2.5
			}
		} else if (strength == "Discipline") {
			var amount = (this.maximumEnemies[this.spawnEnemyIndex] - this.currentEnemyCount) / 5.0
			this.player.offense += amount
			this.player.defense += amount
		} else if (strength == "Empathy") {
			if (this.frameCount % 25 == 0) {
				var enemies = this.children.filter((e) => { return e.isEnemy })
				for (i in enemies) {
					var x = enemies[i].boundingBox.x - this.player.boundingBox.x
					var y = enemies[i].boundingBox.y - this.player.boundingBox.y
					var dist = Math.sqrt(x * x + y * y)
					if (dist <= 192.0) {
						enemies[i].healthBar.health--
						this.player.healthBar.health++
						this.player.healthBar.clampHealth()
					}
				}
			}
		} else if (strength == "Focus") {
			this.player.offense *= 2.0
		} else if (strength == "Futuristic") {
			if (this.player.uberAttackCooldown > 0) {
				this.player.uberAttackCooldown--
			}
		} else if (strength == "Harmony") {
			//Shoots multiple, smaller shots
			this.offense *= 0.75
		} else if (strength == "Ideation") {
			//Cuts cooldown time in half
		} else if (strength == "Includer") {
			var enemies = this.children.filter((e) => { return e.isEnemy })
			for (i in enemies) {
				enemies[i].boundingBox.x -= this.player.xSpeed / 4.0
				enemies[i].boundingBox.y -= this.player.ySpeed / 4.0
			}
		} else if (strength == "Individualization") {
			//Applies a random multiplier [1, 3] to your attacks
		} else if (strength == "Input") {
			//Damages enemies when you're damaged
		} else if (strength == "Intellection") {
			this.player.goThru = true
		} else if (strength == "Learner") {
			this.player.defense += this.spawnEnemyIndex / 10.0
		} else if (strength == "Maximizer") {
			//Doubles distance projectiles travel
		} else if (strength == "Positivity") {
			if (this.frameCount % 10 == 0 && this.player.healthBar.health < this.player.healthBar.maxHealth) {
				this.player.healthBar.health++
			}
			this.player.speed *= 1.5
		} else if (strength == "Relator") {
			this.player.speed += this.currentEnemyCount / 10.0
		} else if (strength == "Responsibility") {
			//Damages enemies on touch
		} else if (strength == "Restorative") {
			if (this.player.healthBar.health < this.player.healthBar.maxHealth) {
				this.player.healthBar.health++
			}
		} else if (strength == "Self-Assurance") {
			this.player.defense *= 2.0
		} else if (strength == "Significance") {
			this.player.attackSize = this.player.boundingBox.width
		} else if (strength == "Strategic") {
			this.player.attackSize = this.player.boundingBox.width / 4.0
			this.player.offense *= 1.5
			this.player.attackSpeed = 5
		} else if (strength == "Woo") {
			this.player.speed *= 2.0
		}
	}
	this.contains = function(strength) {
		for (i in this.strengths) {
			if (this.strengths[i] == strength) {
				return true
			}
		}
		return false
	}

	this.stop = function() {
		clearInterval(this.interval)
		this.context.clearRect(0, 0, this.width, this.height)
		
		var label = new createLabel(this.width / 4.0, this.height / 2.0, "Arial", "64px")
		label.text = "Game Over!"
		label.render(this.context)
		label = new createLabel(this.width / 4.0, this.height / 2.0 + 64.0, "Arial", "64px")
		label.text = "Points: " + this.points
		label.render(this.context)
		
		if (!this.isStopped) {
			Meteor.call('submitScore', this.points, this.strengths)
		}
		this.isStopped = true
	}
	
}

export var gameArea = {stop: () => { }}

function renderGame() {
	gameArea.render()
}

export function getStrengths() {
	var strengths = []
	for (var i = 1; i <= 5; i++) {
		var selector = document.getElementById("Strength " + i)
		strengths.push(selector.value)
	}
	return strengths
}

export function startGame() {
	gameArea.stop()
	gameArea = new createGameArea()
	gameArea.context = document.getElementById("canvas").getContext("2d")
	var player = createPlayer(320, 240, 32, 32, "green")
	player.speed = 1.0
	gameArea.player = player
	gameArea.children.push(player)
	gameArea.strengths = getStrengths()
	gameArea.render()
	
	var enemies = []
	while (enemies.length < 4) {
		enemies.push(gameArea.spawnEnemy())
	}
	
	if (!gameArea.setup) {
		window.addEventListener('keydown', function (e) {
			console.log(e.keyCode)
			if (e.keyCode == 37 || e.keyCode == 65) {
				gameArea.leftKeyPressed = true
			} else if (e.keyCode == 38 || e.keyCode == 87) {
				gameArea.upKeyPressed = true
			} else if (e.keyCode == 39 || e.keyCode == 68) {
				gameArea.rightKeyPressed = true
			} else if (e.keyCode == 40 || e.keyCode == 83) {
				gameArea.downKeyPressed = true
			}
		})
		window.addEventListener('keyup', function (e) {
			if (e.keyCode == 37 || e.keyCode == 65) {
				gameArea.leftKeyPressed = false
			} else if (e.keyCode == 38 || e.keyCode == 87) {
				gameArea.upKeyPressed = false
			} else if (e.keyCode == 39 || e.keyCode == 68) {
				gameArea.rightKeyPressed = false
			} else if (e.keyCode == 40 || e.keyCode == 83) {
				gameArea.downKeyPressed = false
			}
		})
		window.addEventListener('click', function (e) {
			gameArea.mouseClicked(e.pageX, e.pageY)
		})
		window.addEventListener('contextmenu', function (e) {
			var offset = gameArea.canvasOffset()
			x = e.pageX - offset.x
			y = e.pageY - offset.y
			if (0 <= x && x <= gameArea.width && 0 <= y && y <= gameArea.height) {
				e.preventDefault()
				gameArea.rightMouseClicked()
			}
		})
		gameArea.unpause()
	}
	gameArea.setup = true
	
}