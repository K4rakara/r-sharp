import fetch from 'node-fetch';
import { AuthHeaders } from '../auth-headers';
import { oauthRedditUrl } from '../../consts';

export interface RedditMe
{
	can_create_subreddit: boolean,
	can_edit_name: boolean,
	coins: number,
	comment_karma: number,
	created_utc: number,
	created: number,
	force_password_reset: boolean,
	gold_creddits: number,
	gold_expiration: number,
	has_android_subscription: false,
	has_external_account: boolean,
	has_gold_subscription: boolean,
	has_ios_subscription: boolean,
	has_mail: boolean,
	has_mod_mail: boolean,
	has_paypal_subscription: boolean,
	has_stripe_subscription: boolean,
	has_subscribed_to_premium: boolean,
	has_subscribed: boolean,
	has_verified_email: boolean,
	has_visited_new_profile: boolean;
	hide_from_robots: boolean,
	icon_img: string,
	id: string,
	in_beta: boolean,
	in_chat: boolean,
	in_redesign_beta: boolean,
	inbox_count: number,
	is_employee: boolean;
	is_gold: boolean,
	is_mod: boolean,
	is_sponsor: false,
	is_suspended: boolean,
	link_karma: number,
	linked_identities: [],
	name: string,
	new_modmail_exists: boolean,
	num_friends: number,
	oauth_client_id: string,
	over_18: boolean,
	password_set: boolean,
	pref_autoplay: boolean,
	pref_clickgadget: number,
	pref_geopopular: string,
	pref_nightmode: boolean,
	pref_no_profanity: boolean,
	pref_show_snoovatar: boolean,
	pref_show_trending: boolean,
	pref_show_twitter: boolean,
	pref_top_karma_subreddits: boolean,
	pref_video_autoplay: boolean,
	seen_give_award_tooltip: boolean,
	seen_layout_switch: boolean;
	seen_premium_adblock_modal: boolean,
	seen_redesign_modal: boolean,
	seen_subreddit_chat_ftux: boolean,
	suspension_expiration_utc: null,
	verified: boolean,
	subreddit:
	{
		banner_img: string,
		banner_size: null,
		coins: number,
		community_icon: null,
		default_set: boolean,
		description: string,
		disable_contributor_requests: boolean,
		display_name_prefixed: string,
		display_name: string,
		free_form_reports: boolean,
		header_img: null,
		header_size: null,
		icon_color: string,
		icon_img: string,
		icon_size: number[],
		is_default_banner: boolean,
		is_default_icon: boolean,
		key_color: string,
		link_flair_enabled: boolean,
		link_flair_position: string,
		name: string,
		over_18: boolean,
		previous_names: string[],
		primary_color: string,
		public_description: string,
		restrict_commenting: boolean,
		restrict_posting: boolean,
		show_media: boolean,
		submit_link_label: string,
		submit_text_label: string,
		subreddit_type: string,
		subscribers: number,
		title: string,
		url: string,
		user_is_banned: boolean,
		user_is_contributor: boolean,
		user_is_moderator: boolean,
		user_is_muted: boolean,
		user_is_subscriber: boolean
	},
	features:
	{
		awards_on_streams: boolean,
		chat_group_rollout: boolean,
		chat_subreddit: boolean,
		chat_user_settings: boolean,
		chat: boolean,
		community_awards: boolean,
		custom_feeds: boolean,
		do_not_track: boolean,
		expensive_coins_package: boolean,
		is_email_permission_required: boolean,
		mod_awards: boolean,
		modlog_copyright_removal: boolean,
		mweb_xpromo_interstitial_comments_android: boolean,
		mweb_xpromo_interstitial_comments_ios: boolean,
		mweb_xpromo_modal_listing_click_daily_dismissible_android: boolean,
		mweb_xpromo_modal_listing_click_daily_dismissible_ios: boolean,
		noreferrer_to_noopener: boolean,
		premium_subscriptions_table: boolean,
		promoted_trend_blanks: boolean,
		resized_styles_images: boolean,
		show_amp_link: boolean,
		spez_modal: boolean,
		stream_as_a_post_type: boolean,
		twitter_embed: boolean,
		top_content_email_digest_v2:
		{
			owner: string,
			variant: string,
			experiment_id: number
		},
		mweb_link_tab:
		{
			owner: string,
			variant: string,
			experiment_id: number
		},
		mweb_xpromo_revamp_v3:
		{
			owner: string,
			variant: string,
			experiment_id: number
		},
		mweb_sharing_clipboard:
		{
			owner: string,
			variant: string,
			experiment_id: number
		},
		mweb_nsfw_xpromo:
		{
			owner: string,
			variant: string,
			experiment_id: number
		},
	}
}

export async function getMe(token: string, username?: string): Promise<RedditMe>
{
	return await
	(
		await fetch
		(
			`${oauthRedditUrl}/api/v1/me`,
			{
				headers: new AuthHeaders(token, {}, username)
			}
		)
	).json();
}