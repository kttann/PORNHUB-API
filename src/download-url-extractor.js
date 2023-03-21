const {URL} = require('url');

class DownloadUrlExtractor {
  extract(source) {
    // {<resolution>P: <url>,
    //  <resolution>P: <url>],
    //   ... }
    throw new Error('not implemented');
  }
}

class SimpleDownloadUrlExtractor extends DownloadUrlExtractor {
  extract(source) {
    const theMatch = source.match(/.*flashvars_.*? = (.*?);/);
    const mediaDefinitions =
      JSON.parse(theMatch[1]).mediaDefinitions
        .filter(m => typeof m.quality === 'string')
        .map(q => `${q}P`);
    let rsl = mediaDefinitions.map(m => [m.quality, m.videoUrl]);
    rsl = Object.fromEntries(rsl);

    return rsl;
  }
}

class CommentsSeparatedDownloadUrlExtractor extends DownloadUrlExtractor {
  extract(source) {
    const matches = source.match(/(?<=\*\/)\w+/g);
    const urls = [];
    for (const match of matches) {
      const regex = new RegExp('(?<=' + match + '=")[^;]+(?=")', 'g');
      const value = source.match(regex)[0].replace(/[" +]/g, '');

      if (value.startsWith('https')) {
        if (urls.length === 4) {
          break;
        }

        urls.push(value);
      } else {
        urls[urls.length - 1] += value;
      }
    }

    let rsl = urls.map(x => {
      // Sometime PH does not provide a resolution, meaning the link is broken
      const resolution = x.match(/(?<=_|\/)\d*P(?=_)/g);
      return resolution !== null && resolution.length > 0 ? [x.match(/(?<=_|\/)\d*P(?=_)/g)[0], x] : null;
    }).filter(x => x !== null);
    rsl = Object.fromEntries(rsl);

    return rsl;
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

function isValidDownloadUrls(rsl) {
  if (rsl === null || rsl === undefined) {
    return false;
  }

  if (rsl.length === 0) {
    return false;
  }

  if (Object.keys(rsl) === 0) {
    return false;
  }

  if (Object.keys(rsl).some(p => p.match(/\d+P/g) === false)) {
    return false;
  }

  if (Object.keys(rsl).some(p => isValidUrl(rsl[p]) === false)) {
    return false;
  }

  return true;
}

module.exports = {
  DownloadUrlExtractor,
  SimpleDownloadUrlExtractor,
  CommentsSeparatedDownloadUrlExtractor,
  isValidDownloadUrls
};
