import React from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function ServerError() {
  return (
    <Layout title="Server Error • Tasty Cooking" description="An unexpected error occurred.">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-windsor-bold text-off-white mb-6">Server Error</h1>
        <p className="text-xl text-off-white mb-8">Sorry, an unexpected error occurred. Please try again later.</p>
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