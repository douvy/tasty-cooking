import React, { useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { BLUR_DATA_URL, RECIPE_CUSTOM_ORDER } from '@/lib/constants';
import { getRecipeSlugs, getRecipeBySlug } from '@/lib/mdx-utils';


interface IngredientSubsection {
  title: string;
  items: string[];
}

// Recipe template that works with MDX files
interface RecipeProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  lastUpdated?: string;
  imgSrc: string;
  imgAlt?: string;
  prepTime: string;
  readyTime: string;
  servings: string;
  tags: string[];
  ingredients: string[];
  ingredients_subsections?: IngredientSubsection[];
  instructions: string[];
}

const RecipePage = ({
  slug,
  title,
  description,
  date,
  lastUpdated,
  imgSrc,
  imgAlt,
  prepTime,
  readyTime,
  servings,
  tags,
  ingredients,
  ingredients_subsections = [],
  instructions
}: RecipeProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  // Create Schema.org Recipe JSON-LD data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": title,
    "image": `https://www.tasty.cooking${imgSrc}`,
    "author": {
      "@type": "Organization",
      "name": "Tasty Cooking",
      "url": "https://www.tasty.cooking"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tasty Cooking"
    },
    "datePublished": date,
    "dateModified": lastUpdated || date,
    "description": description,
    "prepTime": `PT${prepTime.replace(' min', 'M')}`,
    "totalTime": `PT${readyTime.replace(' min', 'M')}`,
    "recipeYield": servings,
    "recipeIngredient": ingredients,
    "recipeInstructions": instructions.map((step) => ({
      "@type": "HowToStep",
      "text": step
    })),
    "keywords": tags.join(", ").toLowerCase(),
    "recipeCategory": "Recipe"
  };

  return (
    <Layout
      title={`${title} • Tasty Cooking`}
      description={description}
    >
      <SEO
        title={`${title} • Tasty Cooking`}
        description={description}
        image={`https://www.tasty.cooking${imgSrc}`}
        url={`https://www.tasty.cooking/${slug}`}
        type="article"
        schemaData={schemaData}
      />
      
      {/* Make header transparent on recipe pages */}
      <style jsx global>{`
        .container-fluid.border-divider-b.absolute.top-0.left-0.w-full.z-30.bg-primary {
          background-color: rgba(56, 61, 35, 0.85) !important;
        }
      `}</style>
      
      {/* Hero Section - no negative margin needed now */}
      <section className="relative mt-0">
        <div className="relative w-full h-[400px]">
          <Image 
            src={imgSrc}
            alt={imgAlt || title} 
            fill
            className={`object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="100vw"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="bg-secondary mb-5 inline-flex px-6 py-0 border-grayish-orange-all rounded-3xl items-center">
              <h1 className="text-black text-2xl sm:text-3xl font-bold mt-4">{title}</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-8 pt-6 mt-0 sm:mt-0">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-6 mb-5">
            <div className="flex items-center">
              <i className="fas fa-clock text-[#efece5] text-sm sm:text-base mr-2"></i>
              <span className="text-sm sm:text-lg font-bold text-off-white">Prep: {prepTime}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-hourglass-half text-[#efece5] text-sm sm:text-base mr-2"></i>
              <span className="text-sm sm:text-lg font-bold text-off-white">Ready: {readyTime}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-utensils text-[#efece5] text-sm sm:text-base mr-2"></i>
              <span className="text-sm sm:text-lg font-bold text-off-white">{servings}</span>
            </div>
          </div>
          
          {/* Tags Section */}
          <div className="mb-2 flex flex-wrap">
            {tags.map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-base font-medium bg-[#2e3523] capitalize text-off-white mr-3 sm:mr-4 mb-3"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="max-w-3xl text-[#efece5]">
            <p className="leading-7">{description}</p>
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="bg-secondary text-black py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Ingredients</h2>
          
          {/* Main ingredients list - only show if not empty */}
          {ingredients.length > 0 && (
            <ul className="list-disc pl-6 leading-8">
              {ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          )}
          
          {/* Ingredient subsections */}
          {ingredients_subsections.map((subsection, sectionIndex) => (
            <div key={`section-${sectionIndex}`}>
              <h3 className="text-lg font-semibold mb-1 mt-4">{subsection.title}</h3>
              <ul className="list-disc pl-6 leading-8">
                {subsection.items.map((item, itemIndex) => (
                  <li key={`subsection-${sectionIndex}-item-${itemIndex}`}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Instructions Section */}
      <section className="py-8 mb-2">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-light-gray">Instructions</h2>
          <ol className="list-decimal pl-6 text-light-gray leading-8">
            {instructions.map((instruction, index) => (
              <li key={index} className="mb-2">{instruction}</li>
            ))}
          </ol>
        </div>
      </section>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Get slugs from the utility function that has fallback mechanisms
    const slugs = getRecipeSlugs();
    
    // Create paths array
    const paths = slugs.map(slug => ({
      params: { slug }
    }));
    
    return {
      paths,
      fallback: 'blocking' // Enable blocking fallback for server-side generation
    };
  } catch (error) {
    
    // If there's an error but we have the custom order, use that as fallback
    if (RECIPE_CUSTOM_ORDER && RECIPE_CUSTOM_ORDER.length > 0) {
      const paths = RECIPE_CUSTOM_ORDER.map(slug => ({
        params: { slug }
      }));
      
      return {
        paths,
        fallback: 'blocking'
      };
    }
    
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps<RecipeProps> = async ({ params }) => {
  try {
    if (!params?.slug) {
      return { notFound: true };
    }
    
    const slug = params.slug as string;
    
    // Use the utility function that has fallback mechanisms
    const recipeData = getRecipeBySlug(slug);
    
    // If no recipe data found, return 404
    if (!recipeData) {
      return { notFound: true };
    }
    
    // Extract data from the recipe
    const { frontmatter } = recipeData;
    
    // Handle image path
    let imgSrc = frontmatter.imgSrc || `/assets/img/${slug}.jpg`;
    if (!imgSrc.startsWith('/')) {
      imgSrc = `/${imgSrc}`;
    }
    
    // Handle date serialization (convert Date objects to strings)
    const date = frontmatter.date 
      ? (typeof frontmatter.date === 'object' ? new Date(frontmatter.date as any).toISOString() : String(frontmatter.date)) 
      : '';
      
    const lastUpdated = frontmatter.lastUpdated 
      ? (typeof frontmatter.lastUpdated === 'object' ? new Date(frontmatter.lastUpdated as any).toISOString() : String(frontmatter.lastUpdated)) 
      : date;
    
    return {
      props: {
        slug,
        title: frontmatter.title || '',
        description: frontmatter.description || '',
        date,
        lastUpdated,
        imgSrc,
        imgAlt: frontmatter.imgAlt || '',
        prepTime: frontmatter.prepTime || '',
        readyTime: frontmatter.readyTime || '',
        servings: frontmatter.servings || '',
        tags: frontmatter.tags || [],
        ingredients: frontmatter.ingredients || [],
        ingredients_subsections: frontmatter.ingredients_subsections || [],
        instructions: frontmatter.instructions || []
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    return { notFound: true };
  }
};

export default RecipePage;