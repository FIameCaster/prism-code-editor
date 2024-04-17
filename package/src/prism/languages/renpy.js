import { languages } from '../core.js';
import { clikePunctuation } from '../utils/patterns.js';

languages.rpy = languages.renpy = {
	'comment': /#.+/,

	'string': {
		pattern: /("""|''')[\s\S]+?\1|(["'])(?:\\.|(?!\2)[^\\])*\2|(?:^#?(?:(?:[a-fA-F\d]){3}|[a-fA-F\d]{6})$)/mg,
		greedy: true
	},

	'function': /\b[a-z_]\w*(?=\()/i,

	'property': /\b(?:Update|UpdateVersion|action|activate_sound|adv_nvl_transition|after_load_transition|alpha|alt|antialias|area|auto|background|bar_invert|bar_resizing|bar_vertical|black_color|bold|bottom_bar|bottom_gutter|bottom_margin|bottom_padding|box_reverse|box_wrap|can_update|caret|child|color|crop|default_afm_enable|default_afm_time|default_fullscreen|default_text_cps|developer|directory_name|drag_handle|drag_joined|drag_name|drag_raise|draggable|dragged|drop_shadow|drop_shadow_color|droppable|dropped|easein|easeout|edgescroll|end_game_transition|end_splash_transition|enter_replay_transition|enter_sound|enter_transition|enter_yesno_transition|executable_name|exit_replay_transition|exit_sound|exit_transition|exit_yesno_transition|fadein|fadeout|first_indent|first_spacing|fit_first|focus|focus_mask|font|foreground|game_main_transition|get_installed_packages|google_play_key|google_play_salt|ground|has_music|has_sound|has_voice|height|help|hinting|hover|hover_background|hover_color|hover_sound|hovered|hyperlink_functions|idle|idle_color|image_style|include_update|insensitive|insensitive_background|insensitive_color|inside|intra_transition|italic|justify|kerning|keyboard_focus|language|layer_clipping|layers|layout|left_bar|left_gutter|left_margin|left_padding|length|line_leading|line_overlap_split|line_spacing|linear|main_game_transition|main_menu_music|min_?width|modal|mouse|mousewheel|name|narrator_menu|newline_indent|nvl_adv_transition|order_reverse|outlines|overlay_functions|position|prefix|radius|range|rest_indent|right_bar|right_gutter|right_margin|right_padding|rotate|rotate_pad|ruby_style|sample_sound|save_directory|say_attribute_transition|screen_height|screen_width|scrollbars|selected_(?:hover|hover_color|idle|idle_color|insensitive)|show_side_image|show_two_window|side_spacing|side_[xy]pos|size_group|slow_cps|slow_cps_multiplier|spacing|strikethrough|subpixel|text_align|text_style|text_[xy]pos|text_y_fudge|thumb|thumb_offset|thumb_shadow|thumbnail_height|thumbnail_width|time|top_bar|top_gutter|top_margin|top_padding|translations|underline|unscrollable|update|value|version|version_name|version_tuple|vertical|width|window_hide_transition|window_icon|window_left_padding|window_show_transition|window_title|windows_icon|[xy]adjustment|[xy]?align|[xy]?anchor|[xy]anchoraround|[xy]around|[xy]center|[xy]fill|[xy]initial|[xy]margin|[xy]?maximum|[xy]?minimum|[xy]?offset|xofsset|[xy]padding|[xy]?pos|[xy]?size|[xy]?zoom|ysizexysize|zorder)\b/,

	'tag': /\b(?:bar|block|button|buttoscreenn|drag|draggroup|fixed|frame|grid|[hv]box|hotbar|hotspot|image|imagebutton|imagemap|input|key|label|menu|mm_menu_frame|mousearea|nvl|parallel|screen|self|side|tag|text|textbutton|timer|vbar|viewport|window)\b|\$/,

	'keyword': /\b(?:None|add|adjustment|alignaround|allow|angle|animation|around|assert|behind|box_layout|break|build|cache|call|center|changed|child_size|choice|circles|class|clear|clicked|clipping|clockwise|config|contains|continue|corner[12]|counterclockwise|de[fl]|default|define|delay|disabled|disabled_text|dissolve|elif|else|event|except|exclude|exec|expression|fade|finally|for|from|function|global|[gm]m_root|h?as|hide|id|if|import|in|init|is|jump|knot|lambda|left|less_rounded|movie|music|null|on|onlayer|pass|pause|persistent|play|print|python|queue|raise|random|renpy|repeat|return|right|rounded_window|scene|scope|set|show|slow|slow_abortable|slow_done|sound|stop|store|style|style_group|substitute|suffix|theme|transform|transform_anchor|transpose|try|ui|unhovered|updater|use|voice|while|widget|widget_hover|widget_selected|widget_text|yield)\b/,

	'boolean': /\b(?:[Ff]alse|[Tt]rue)\b/,

	'number': /(?:\b(?:0[bo])?(?:(?:\d|0x[a-f\d])[a-f\d]*(?:\.\d*)?)|\B\.\d+)(?:e[+-]?\d+)?j?/i,

	'operator': /[%=+-]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[~&|^]|\b(?:and|at|not|or|with)\b/,

	'punctuation': clikePunctuation
};
