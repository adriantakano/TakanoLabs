/* Feed RSS del blog -> /rss.xml */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site';
import { getArticleUrl } from '../config/categories';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: `${SITE.name} — Blog`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    language: 'es-MX',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: getArticleUrl(post.data.section, post.data.slug),
      categories: post.data.tags,
    })),
    customData: `<language>es-MX</language>`,
  });
}
