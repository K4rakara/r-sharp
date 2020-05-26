export interface RedditLink
{
	all_awardings: any[];
	allow_live_comments: boolean;
	approved_at_utc?: any;
	approved_by?: any;
	archived: boolean;
	author: string;
	author_flair_background_color?: any;
	author_flair_css_class?: any;
	author_flair_richtext: any[];
	author_flair_template_id: string;
	author_flair_text: string;
	author_flair_text_color: string;
	author_flair_type: string;
	author_fullname: string;
	author_patreon_flair: boolean;
	author_premium: boolean;
	awarders: any[]
	banned_at_utc?: number;
	banned_by?: any; 
	can_gild: boolean;
	can_mod_post: boolean;
	category?: any;
	clicked: boolean;
	content_categories?: any;
	contest_mode: boolean;
	created: number;
	created_utc: number;
	discussion_type?: any;
	distinguished?: any;
	domain: string;
	downs: number;
	edited: boolean;
	gilded: number;
	gildings: {};
	hidden: boolean;
	hide_score: boolean;
	id: string;
	is_crosspostable: boolean;
	is_meta: boolean;
	is_original_content: boolean;
	is_reddit_media_domain: boolean;
	is_robot_indexable: boolean;
	is_self: boolean;
	is_video: boolean;
	likes?: any;
	link_flair_background_color: string;
	link_flair_css_class: string;
	link_flair_richtext: any[]
	link_flair_template_id: string;
	link_flair_text: string;
	link_flair_text_color: string;
	link_flair_type: string;
	locked: boolean;
	media?: any;
	media_embed: {};
	media_only: boolean;
	mod_note?: any;
	mod_reason_by?: any;
	mod_reason_title?: any;
	mod_reports: any[];
	name: string;
	no_follow: boolean;
	num_comments: number;
	num_crossposts: number;
	num_reports?: any; 
	over_18: boolean;
	parent_whitelist_status: string;
	permalink: string;
	pinned: boolean;
	post_hint: string;
	preview: { enabled: boolean; images: RedditPreviewImage[]; }
	pwls: number;
	quarantine: boolean;
	removal_reason?: any;
	removed_by?: any;
	removed_by_category?: any;
	report_reasons?: any;
	saved: boolean;
	score: number;
	secure_media?: any;
	secure_media_embed: {};
	selftext: string;
	selftext_html?: any;
	send_replies: boolean;
	spoiler: boolean;
	stickied: boolean;
	subreddit: string;
	subreddit_id: string;
	subreddit_name_prefixed: string;
	subreddit_subscribers: number;
	subreddit_type: string;
	suggested_sort?: any;
	thumbnail: string;
	thumbnail_height: number;
	thumbnail_width: number;
	title: string;
	total_awards_received: number;
	treatment_tags: any[];
	ups: number;
	upvote_ratio: number;
	url: string;
	user_reports: any[]
	view_count?: any;
	visited: boolean;
	whitelist_status: string;
	wls: number;
}

export interface RedditComment
{

}

export interface RedditPreviewImage
{
	id: string;
	resolutions: RedditImage[];
	source: RedditImage;
	variations: any;
}

export interface RedditImage
{
	height: number;
	url: string;
	width: number;
}

export interface RedditFeed
{
	data:
	{
		after?: string;
		before?: string;
		children: RedditLink[];
		dist: number;
		modhash?: any;
	};
	kind: string;
}