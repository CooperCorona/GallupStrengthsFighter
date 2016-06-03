import { Meteor } from 'meteor/meteor';
import { Scores } from '../import/api/score.js';

Meteor.startup(() => {
	Meteor.methods({
		submitScore: function(score, strengths) {
			Scores.insert({
				score: score,
				strengths: strengths
			})
		}
	})
	Meteor.publish('Scores', function() {
		return Scores.find({})
	})
	Scores.allow({
		'insert': function(userId, doc) {
			return !!userId
		}
	});
});
