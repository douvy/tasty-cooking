import { NextApiRequest, NextApiResponse } from 'next';
import { getRecipeSlugs } from '@/lib/mdx-utils';
import { handleApiError } from '@/lib/api-utils';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get recipe slugs from MDX files
    const mdxSlugs = getRecipeSlugs();
    
    // Fallback slugs if no MDX files yet
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
      'chimichurri'
    ];
    
    // Combine both sources, remove duplicates
    const allSlugs = Array.from(new Set([...mdxSlugs, ...fallbackSlugs]));
    
    // Generate sitemap XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tasty.cooking/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  ${allSlugs.map(slug => `
  <url>
    <loc>https://www.tasty.cooking/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;
    
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
    res.status(200).send(xml);
  } catch (error) {
    handleApiError(res, error);
  }
}