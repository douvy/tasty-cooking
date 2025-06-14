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
  
  // Map of shortened display titles for the homepage cards
  const displayTitleMap: Record<string, string> = {
    'roasted-cauliflower': 'Roasted Cauliflower',
    'roasted-broccolini': 'Roasted Broccolini',
    'charred-brussels-sprouts': 'Charred Brussels Sprouts',
    'eggplant-with-buttermilk-sauce': 'Eggplant w/ Buttermilk Sauce',
    'cucumber-salad': 'Cucumber Salad',
    'roasted-beets': 'Roasted Beets',
    'beet-slaw': 'Beet Slaw',
    'roasted-radishes': 'Roasted Radishes',
    'almonds': 'Brined & Roasted Almonds',
    'white-bean-wraps': 'White Bean Wraps',
    'crushed-fried-potatoes': 'Crushed & Fried Potatoes'
  };

  // Get homepage display title (shorter version for specific recipes)
  const getDisplayTitle = (slug: string, originalTitle: string): string => {
    return displayTitleMap[slug] || originalTitle;
  };
  
  return (
    <Link 
      href={`/${recipe.link}`} 
      className={`bg-dark-gray border-divider-all hover:border-light-grayish-orange-all rounded-3xl overflow-hidden shadow-lg relative h-48 sm:h-64 block group transition-all duration-500 transform ${className}`}
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
            className="object-cover transition-all duration-500 group-hover:opacity-70"
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
        <div className="w-11/12 mx-auto border-grayish-orange-all py-2 bg-[#e2d7a0] rounded-3xl transition-colors duration-500 group-hover:bg-[#eee3b7]">
          <div className="font-bold text-[#141416] text-xs uppercase pt-2 pb-2 recipe-title leading-2 sm:leading-5">
            {getDisplayTitle(recipe.link, recipe.title)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;