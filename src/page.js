const utils = require('./utils');
const utils_scrap = require('./helpers/utils_scrap');
const consts_global = require('./constants/consts_global');
const consts_page = require('./constants/consts_page');
const {DownloadUrlExtractor, SimpleDownloadUrlExtractor, CommentsSeparatedDownloadUrlExtractor, isValidDownloadUrls} = require('./download-url-extractor')

const scraper_comments_options = {
	key: consts_global.keys.COMMENTS,
	list: consts_page.COMMENTS_LIST,
	selectors: consts_page.comment_selectors,
	attributs: consts_page.page_element_attributs
};

const scraper_related_videos_options = {
	key: consts_global.keys.RELATED_VIDEOS,
	list: consts_page.RELATED_VIDEOS_LIST,
	selectors: consts_page.related_videos_selectors,
	attributs: consts_page.page_related_videos_element_attributs
};

const downloadUrlExtractors = [
	new SimpleDownloadUrlExtractor(),
	new CommentsSeparatedDownloadUrlExtractor()
];

module.exports = {
	scraper_video_informations: (source, keys) => {
		let rsl = {};

		if (keys.includes(consts_global.keys.DOWNLOAD_URLS)) {
			const allValidUrls = downloadUrlExtractors
				.map(e => e.extract(source))
				.filter(rsl => isValidDownloadUrls(rsl));

			if (allValidUrls.length > 0) {
				rsl = allValidUrls[0];
			}
		}

		return Object.keys(rsl).length > 0 ? rsl : null;
	},
	scraper_block_informations: (doc, keys, scrap_options) => {
		return keys.includes(scrap_options.key) ? {[scrap_options.key]: utils_scrap.scraper_array(doc, scrap_options.list, scrap_options.selectors, scrap_options.attributs)} : {};
	},
	scraping_page: (source, keys) => {
		const doc = utils.source_to_dom(source);
		let datas = {};

		datas = {...datas, ...utils_scrap.scraper_content_informations(doc, keys, consts_page.page_selectors, consts_page.page_element_attributs)};
		datas = {...datas, DOWNLOAD_URLS: module.exports.scraper_video_informations(source, keys)};
		datas = {...datas, ...module.exports.scraper_block_informations(doc, keys, scraper_comments_options)};
		datas = {...datas, ...module.exports.scraper_block_informations(doc, keys, scraper_related_videos_options)};

		return datas;
	}
};
