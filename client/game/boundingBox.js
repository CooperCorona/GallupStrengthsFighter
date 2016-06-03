export function boundingBox(x, y, width, height) {
	this.x = x
	this.y = y
	this.width = width
	this.height = height
	
	this.left = function() {
		return this.x - this.width / 2.0
	}
	this.right = function() {
		return this.x + this.width / 2.0
	}
	this.top = function() {
		return this.y - this.height / 2.0
	}
	this.bottom = function() {
		return this.y + this.height / 2.0
	}
	
	this.collidesWith = function(other) {
		return !(	this.left() > other.right()
				||	this.right() < other.left()
				||	this.top() > other.bottom()
				||	this.bottom() < other.top())
	}
	
	this.overlap = function(other) {
		var left 	= Math.max(this.left(), other.left())
		var right	= Math.min(this.right(), other.right());
		var top		= Math.max(this.top(), other.top());
		var bottom	= Math.min(this.bottom(), other.bottom());
		var width	= right - left;
		var height	= bottom - top;
		return new boundingBox(left + width / 2.0, top + height / 2.0, width, height);
	}
}