import { Scores } from '../../import/api/score.js';

Template.leaderboard.onCreated(function() {
	Meteor.subscribe('Scores')
})

Template.leaderboard.helpers({
	scores() {
		return Scores.find({}).fetch().sort((s, t) => {
			return s.score < t.score
		}).map((s, i) => {
			return {
				userId: s.userId,
				color: (s.userId == Meteor.user().username) ? "#61C250" : "#EEAF30",
				score: s.score,
				place: i + 1,
				//strengths: s.strengths[0] + "&nbsp;" + s.strengths[1] + "  " + s.strengths[2] + "  " + s.strengths[3] + "  " + s.strengths[4]
				strength1: s.strengths[0],
				strength2: s.strengths[1],
				strength3: s.strengths[2],
				strength4: s.strengths[3],
				strength5: s.strengths[4]
			}
		})
	}
})