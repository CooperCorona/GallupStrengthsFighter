import { Mongo } from 'meteor/mongo';

export const Scores = new Mongo.Collection('Scores')
ScoreSchema = new SimpleSchema({
	userId: {
		type: String,
		autoValue:function() {
			return Meteor.user().username
		}
	},
	score: {
		type: Number
	},
	strengths: {
		type: [String]
	}
})
Scores.attachSchema(ScoreSchema)