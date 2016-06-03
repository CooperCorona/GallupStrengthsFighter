export function healthBar(maxHealth, width, height) {
	this.maxHealth 	= maxHealth
	this.health 	= maxHealth
	this.width 		= width
	this.height 	= height
	this.inner		= 2
	this.render 	= function(context, x, y) {
		var ox = x - this.width / 2.0
		var oy = y - this.height / 2.0
		var w = (this.width - 2 * this.inner) * this.health / this.maxHealth
		context.fillStyle = "#555"
		context.fillRect(ox, oy, this.width, this.height)
		context.fillStyle = "#0C0"
		context.fillRect(ox + this.inner, oy + this.inner, w, this.height - 2 * this.inner)
	}
	this.alive 		= function() {
		return this.health > 0
	}
	this.clampHealth = function() {
		if (this.health > this.maxHealth) {
			this.health = this.maxHealth;
		}
	}
}