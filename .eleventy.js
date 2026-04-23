const { DateTime } = require('luxon');

module.exports = function (eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('css');

  // Date filters
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'LLL dd, yyyy',
    );
  });

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  // Group posts by category (excludes pinned posts — handled separately in template)
  eleventyConfig.addFilter('groupByCategory', function (collection) {
    const catOrder = ['Tools', 'FinOps', 'Architecture', 'AI', 'Networking', 'Security & Identity', 'Tutorials', 'Other'];
    const groups = {};
    for (const item of collection) {
      if (item.data.pinned) continue;
      const cat = item.data.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return catOrder
      .filter(cat => groups[cat] && groups[cat].length > 0)
      .map(cat => ({ name: cat, posts: groups[cat] }));
  });

  // Collections — visible posts only (excludes hidden: true)
  eleventyConfig.addCollection('posts', function (collectionApi) {
    return collectionApi
      .getFilteredByGlob('posts/*.md')
      .filter((post) => !post.data.hidden)
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
  };
};
