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

  // Reading time estimate
  eleventyConfig.addFilter('readingTime', (content) => {
    if (!content) return '';
    const text = content.replace(/<[^>]+>/g, '');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
  });

  // Group posts by category (excludes pinned posts — handled separately in template).
  // Known categories render in a curated order; any other category is appended
  // alphabetically so no post is ever hidden. 'Other' always sorts last.
  const CATEGORY_ORDER = [
    'AI',
    'FinOps',
    'Networking',
    'Architecture',
    'IaC',
    'Security & Identity',
    'Data & Analytics',
    'Tutorials',
    'Tools',
  ];
  const categorySlug = (name) =>
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  eleventyConfig.addFilter('categorySlug', categorySlug);
  eleventyConfig.addFilter('groupByCategory', function (collection) {
    const groups = {};
    for (const item of collection) {
      if (item.data.pinned) continue;
      const cat = item.data.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    const present = Object.keys(groups);
    const ordered = [
      ...CATEGORY_ORDER.filter((cat) => groups[cat]),
      ...present
        .filter((cat) => !CATEGORY_ORDER.includes(cat) && cat !== 'Other')
        .sort(),
      ...(groups['Other'] ? ['Other'] : []),
    ];
    return ordered.map((cat) => ({
      name: cat,
      slug: categorySlug(cat),
      items: groups[cat],
    }));
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
