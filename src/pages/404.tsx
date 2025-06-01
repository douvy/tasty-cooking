import React from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Layout title="Page Not Found • Tasty Cooking" description="The page you're looking for cannot be found.">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-windsor-bold text-off-white mb-6">Page Not Found</h1>
        <p className="text-xl text-off-white mb-8">Sorry, the recipe you're looking for cannot be found.</p>
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-button hover:bg-button/90 text-white font-medium rounded-full transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </Layout>
  );
}