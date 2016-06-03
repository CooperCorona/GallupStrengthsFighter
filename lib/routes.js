FlowRouter.route('/', {
	name: 'home',
	action() {
		BlazeLayout.render('navbar', {main: 'home'})
	}
})

FlowRouter.route('/guide', {
	name: 'guide',
	action() {
		BlazeLayout.render('navbar', {main: 'guide'})
	}
})

FlowRouter.route('/game', {
	name: 'game',
	action() {
		if (!!Meteor.userId()) {
			BlazeLayout.render('navbar', {main: 'game'})
		} else {
			BlazeLayout.render('navbar', {main: 'home'})
		}
	}
})

FlowRouter.route('/leaderboard', {
	name: 'leaderboard',
	action() {
		if (!!Meteor.userId()) {
			BlazeLayout.render('navbar', {main: 'leaderboard'})
		} else {
			BlazeLayout.render('navbar', {main: 'home'})
		}
	}
})