import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { gameArea, getStrengths, startGame } from './javascript/game.js';
import { gameObject, createPlayer, createEnemy, createAttack, createLabel } from './game/gameObject.js';
import { healthBar } from './game/healthBar.js';

import './main.html';

Template.game.events({
	'click .btn-primary':function(e) {
		e.target.blur()
		startGame()
	},
	'click .btn-info':function(e) {
		e.target.blur()
		if (gameArea.paused) {
			gameArea.unpause()
		} else {
			gameArea.pause()
		}
	},
	'change .inputfile':function(e) {
		e.preventDefault();
		var f = new FileReader();
		f.onload = function(result) {
			var i = 0;
			var str = result.target.result;
			var trimmedStr = "";
			for (i = 0; i < str.length; i++) {
				var c = str.charAt(i);
				if (c != "\n" && c != "\t" && c != " " && c != "\r") {
					trimmedStr = trimmedStr + c;
				}
			}
			console.log(trimmedStr);
		};
		f.readAsText(e.target.files[0]);
	}
})

Accounts.onLogin(function() {
	FlowRouter.go('game');
});
Accounts.onLogout(function() {
	FlowRouter.go('home');
});