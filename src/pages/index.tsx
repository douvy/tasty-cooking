import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';
import RecipeGrid from '@/components/RecipeGrid';
import { Recipe } from '@/types';
import SEO from '@/components/SEO';
import { getAllRecipes, convertMDXToRecipeList } from '@/lib/mdx-utils';

interface HomeProps {
  initialRecipes: Recipe[];
}

export default function Home({ initialRecipes }: HomeProps) {
  // Schema.org data for SEO
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tasty Cooking",
    "url": "https://www.tasty.cooking",
    "logo": "https://www.tasty.cooking/assets/img/favicon.png",
    "description": "A collection of delicious and easy-to-follow recipes with a clean, modern web interface.",
    "sameAs": [
      "https://www.instagram.com/tastycooking",
      "https://www.pinterest.com/tastycooking",
      "https://www.youtube.com/tastycooking"
    ]
  };

  return (
    <Layout
      title="Home • Tasty Cooking"
      description="A collection of delicious and easy-to-follow recipes with a clean, modern web interface."
    >
      <SEO
        title="Home • Tasty Cooking"
        description="A collection of delicious and easy-to-follow recipes with a clean, modern web interface."
        schemaData={schemaData}
      />
      <RecipeGrid initialRecipes={initialRecipes} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Get recipes from MDX files
  const mdxRecipes = getAllRecipes();
  
  // Convert MDX recipes to the Recipe format used by RecipeGrid
  let recipes: Recipe[] = [];
  
  if (mdxRecipes.length > 0) {
    recipes = convertMDXToRecipeList(mdxRecipes);
    // Log count of MDX recipes for debugging
  }
  
  // If no MDX recipes, we'll return an empty array and let client-side loading handle it
  // This maintains backward compatibility during the transition to MDX
  
  return {
    props: {
      initialRecipes: recipes
    },
    // Revalidate every hour
    revalidate: 3600
  };
}