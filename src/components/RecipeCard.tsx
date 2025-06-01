import React, { CSSProperties, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Recipe } from '@/types';
import { BLUR_DATA_URL } from '@/lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
  style?: CSSProperties;
  index?: number; // Add index prop to identify first 6 cards
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  className = '',
  style = {},
  index = -1
}) => {
  // Ensure image path always has leading slash
  const imagePath = recipe.img.startsWith('/') ? recipe.img : `/${recipe.img}`;
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Get homepage display title (shorter version for specific recipes)
  const getDisplayTitle = (slug: string, originalTitle: string): string => {
    // Only modify specific recipes that need shortened titles
    if (slug === 'cucumber-salad') {
      return 'Cucumber Salad';
    }
    else if (slug === 'beet-slaw') {
      return 'Beet Slaw';
    }
    // Add more specific cases here as needed
    
    // Default: return the original title
    return originalTitle;
  };
  
  return (
    <Link 
      href={`/${recipe.link}`} 
      className={`bg-dark-gray border-divider-all hover:border-light-grayish-orange-all rounded-3xl overflow-hidden shadow-lg relative h-48 sm:h-64 block group transition-all duration-500 transform hover:scale-[1.01] ${className}`}
      data-tags={recipe.tags.join(' ')}
      style={style}
    >
      <div className="relative w-full h-full bg-[#2A2F1E]">
        {index < 6 ? (
          <Image 
            src={imagePath}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-500 group-hover:opacity-90"
            priority={true}
            placeholder="empty"
            onLoad={() => setIsLoaded(true)}
          />
        ) : (
          <Image 
            src={imagePath}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-500 group-hover:opacity-90 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            placeholder="empty"
            onLoad={() => setIsLoaded(true)}
          />
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full text-center py-4 pb-0">
        <div className="w-11/12 mx-auto border-grayish-orange-all py-2 bg-[#e2d7a0] rounded-3xl transition-colors duration-500 group-hover:bg-[#eadfae]">
          <div className="font-bold text-[#141416] text-xs uppercase pt-2 pb-2 recipe-title leading-2 sm:leading-5">
            {getDisplayTitle(recipe.link, recipe.title)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;