import React from 'react';
import Head from 'next/head';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/constants';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schemaData?: Record<string, unknown> | Array<Record<string, unknown>>;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  url = SITE_URL,
  type = 'website',
  schemaData,
  publishedTime,
  modifiedTime,
  breadcrumbs
}) => {
  // If image is relative path, make it absolute
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  // Prepare breadcrumb schema if provided
  const breadcrumbSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url
    }))
  } : null;

  // Prepare schema JSON-LD - combine main schema with breadcrumbs if both exist
  const schemas: Array<Record<string, unknown>> = [];

  if (schemaData) {
    // Handle both single schema objects and arrays of schemas
    if (Array.isArray(schemaData)) {
      schemas.push(...schemaData);
    } else {
      schemas.push(schemaData);
    }
  } else {
    schemas.push({
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
  }

  if (breadcrumbSchema) {
    schemas.push(breadcrumbSchema);
  }

  const schemaJSON = schemas.length === 1 ? JSON.stringify(schemas[0]) : JSON.stringify(schemas);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

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