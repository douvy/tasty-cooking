import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';
import RecipeGrid from '@/components/RecipeGrid';
import { Recipe } from '@/types';
import SEO from '@/components/SEO';
import { getAllRecipes, convertMDXToRecipeList } from '@/lib/mdx-utils';

// Constants for revalidation times
const REVALIDATION_TIME = {
  NORMAL: 60 * 60, // 1 hour in seconds
  ERROR: 60,       // 1 minute in seconds
};

/**
 * Home page props interface
 */
interface HomeProps {
  initialRecipes: Recipe[];
}

/**
 * Home page component
 * Displays a grid of recipe cards
 */
export default function Home({ initialRecipes }: HomeProps): JSX.Element {
  const pageTitle = "Home • Tasty Cooking";
  const pageDescription = "A collection of delicious and easy-to-follow recipes with a clean, modern web interface.";
  
  // Schema.org data for SEO - combine Organization and WebPage schemas
  const schemaData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Tasty Cooking",
      "url": "https://www.tasty.cooking",
      "logo": "https://www.tasty.cooking/assets/img/favicon.png",
      "description": pageDescription,
      "sameAs": [
        "https://www.instagram.com/tastycooking",
        "https://www.pinterest.com/tastycooking",
        "https://www.youtube.com/tastycooking"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": pageTitle,
      "url": "https://www.tasty.cooking",
      "description": pageDescription,
      "isPartOf": {
        "@type": "WebSite",
        "name": "Tasty Cooking",
        "url": "https://www.tasty.cooking"
      }
    }
  ];

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        schemaData={schemaData}
      />
      <RecipeGrid initialRecipes={initialRecipes} />
    </Layout>
  );
}

/**
 * Static site generation function for the home page
 * Fetches all recipes from MDX files
 */
export const getStaticProps: GetStaticProps = async () => {
  try {
    // Get recipes from MDX files
    const mdxRecipes = getAllRecipes();
    
    // Convert MDX recipes to the Recipe format used by RecipeGrid
    const recipes = convertMDXToRecipeList(mdxRecipes);
    
    return {
      props: { 
        initialRecipes: recipes 
      },
      revalidate: REVALIDATION_TIME.NORMAL
    };
  } catch (error: unknown) {
    // In a production app, we would use a proper logging service here
    // instead of console.error
    console.error('Failed to load recipes:', error instanceof Error ? error.message : String(error));
    
    return {
      props: { 
        initialRecipes: [] 
      },
      revalidate: REVALIDATION_TIME.ERROR
    };
  }
};