import quark from '@quark.js/core';
import {
	Card,
	Post,
	VoteButton,
	UpvoteButton,
	DownvoteButton,
	Voting,
} from '../../components/ts';

quark.registerComponent('card', Card);
quark.registerComponent('post', Post);
quark.registerComponent('vote-button', VoteButton);
quark.registerComponent('upvote-button', UpvoteButton);
quark.registerComponent('downvote-button', DownvoteButton);
quark.registerComponent('voting', Voting);

class Explore
{
	constructor()
	{
		
	}
}

const explore = new Explore();
