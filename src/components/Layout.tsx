import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Tasty Cooking',
  description = 'A collection of delicious and easy-to-follow recipes with a clean, modern web interface.'
}) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="keywords" content="recipes, cooking, food, healthy recipes, quick meals, vegetarian, vegan, gluten-free" />
        <meta name="author" content="Tasty Cooking" />
        <meta name="theme-color" content="#383d23" />
        
        {/* PWA support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Tasty Cooking" />
        
        {/* Favicon support for all devices */}
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon.png" />
        <link rel="mask-icon" href="/assets/img/favicon.png" color="#383d23" />
        <meta name="msapplication-TileColor" content="#383d23" />
        <meta name="theme-color" content="#383d23" />
      </Head>
      
      {/* Skip to content link for accessibility */}
      <a href="#recipe-grid" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-light-grayish-orange focus:outline-none focus:ring-2 focus:ring-light-grayish-orange">
        Skip to content
      </a>
      
      <Header />
      
      <main>{children}</main>
      
      <Footer />
    </>
  );
};

export default Layout;