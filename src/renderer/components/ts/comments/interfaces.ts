import * as Kuudere from 'kuudere';
import { Comment, RedditComment, RedditComments, Comments, CommentVoting } from '.';
import { Post } from '..';
import { RedditLink } from '../../../../main/api/reddit-types';

export interface CommentConstructor
{
	comment: RedditComment;
	parent: Kuudere.HTMLKuudereComponent<Comments>|Kuudere.HTMLKuudereComponent<Comment>;
	rootParent: Kuudere.HTMLKuudereComponent<Comments>;
}

export interface CommentsConstructor
{
	link: RedditLink;
	parent: Kuudere.HTMLKuudereComponent<Post>;
}

export interface ChildComment
{
	comment: RedditComment;
	children: ChildComment[];
	element?: Kuudere.HTMLKuudereComponent<Comment>;
}

export interface CommentVotingConstructor
{
	link: RedditLink;
	parent: Kuudere.HTMLKuudereComponent<Comment>;
	comment: RedditComment;
}

export interface CommentVotingButtonConstructor
{
	flip: boolean;
	parent: Kuudere.HTMLKuudereComponent<CommentVoting>;
	color: string;
	hoverColor: string;
}

export interface CommentButtonsConstructor
{
	parent: Kuudere.HTMLKuudereComponent<Comment>;
	
}
