import { GetServerSideProps } from 'next';
import { formatDate } from '@/lib/utils';
import { getRecipeSlugs } from '@/lib/mdx-utils';

function SiteMap() {
  // getServerSideProps will handle rendering
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Get recipe slugs from MDX files
  const mdxSlugs = getRecipeSlugs();
  
  // Fallback recipe slugs if no MDX files yet
  const fallbackSlugs = [
    'sesame-green-beans',
    'guacamole',
    'roasted-cauliflower',
    'roasted-broccolini',
    'nashville-hot-chicken',
    'honey-butter-pancakes',
    'charred-brussels-sprouts',
    'cajun-honey-butter-salmon',
    'salsa',
    'japanese-tebasaki-wings',
    'crunchy-pappardelle',
    'chimichurri',
    'roasted-chicken',
    'eggplant-with-buttermilk-sauce',
    'sesame-orange-chicken',
    'cucumber-salad',
    'sweet-potato-cakes',
    'black-pepper-tofu',
    'leek-fritters',
    'sweet-potato-hash',
    'roasted-beets',
    'potato-green-bean-soup',
    'roasted-garlic-lentil-soup',
    'avocado-wraps',
    'citrus-vinaigrette',
    'spiced-green-sauce',
    'roasted-radishes',
    'green-garlic-butter',
    'alla-diavola-butter',
    'almonds',
    'brown-butter',
    'pineapple-ginger-smoothie',
    'pineapple-kimchi',
    'pistachio-butter',
    'pomodoro-sauce',
    'quesadillas',
    'ratatouille',
    'romesco',
    'soffrito',
    'spaghetti-pomodoro',
    'spicy-kimchi-broccoli-rabe',
    'sweet-potato-cakes',
    'tomato-confit',
    'white-bean-wraps',
    'garlic-confit',
    'grilled-buffalo-wings',
    'roasted-sweet-potato-salad',
    'falafels',
    'beet-slaw',
    'mojo-de-ajo',
    'california-za\'atar'
  ];
  
  // Combine both sources, remove duplicates
  const allSlugs = Array.from(new Set([...mdxSlugs, ...fallbackSlugs]));
  
  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tasty.cooking/</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <priority>1.0</priority>
  </url>
  ${allSlugs.map(slug => `
  <url>
    <loc>https://www.tasty.cooking/${slug}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;

  // Set appropriate headers
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  
  // Send the XML
  res.write(sitemap);
  res.end();

  return {
    props: {}
  };
};

export default SiteMap;