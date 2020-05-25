// Imports.
import quark from '@quark.js/core';
import { ipcRenderer } from 'electron';
import {
	Card,
	VoteButton,
	UpvoteButton,
	DownvoteButton,
	Voting,
	Post,
	AccountQuicklook,
	ProfilePicture,
} from './components/ts/index';
import * as api from './api/index';
import { RSharp } from './r-sharp';

// Register components.
quark.registerComponent('card', Card);
quark.registerComponent('vote-button', VoteButton);
quark.registerComponent('upvote-button', UpvoteButton);
quark.registerComponent('downvote-button', DownvoteButton);
quark.registerComponent('voting', Voting);
quark.registerComponent('post', Post);
quark.registerComponent('account-quicklook', AccountQuicklook);
quark.registerComponent('profile-picture', ProfilePicture);

// Create the app state.
const rSharp: RSharp = new RSharp();