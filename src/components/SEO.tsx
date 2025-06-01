import React from 'react';
import Head from 'next/head';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/constants';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schemaData?: Record<string, unknown>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  url = SITE_URL,
  type = 'website',
  schemaData
}) => {
  // If image is relative path, make it absolute
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  
  // Prepare schema JSON-LD
  const schemaJSON = schemaData
    ? JSON.stringify(schemaData)
    : JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': SITE_NAME,
        'url': SITE_URL,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${SITE_URL}/?s={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      });

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={absoluteImage} />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJSON }}
        key="product-jsonld"
      />
    </Head>
  );
};

export default SEO;