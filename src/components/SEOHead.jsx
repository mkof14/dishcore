import { useEffect } from "react";

export default function SEOHead({
  title = "DishCore - AI-Powered Nutrition & Health Platform",
  description = "Transform your health with AI-powered nutrition tracking, personalized meal plans, and comprehensive wellness analytics. Track meals, body measurements, and achieve your goals with DishCore.",
  keywords = "nutrition tracking, meal planning, AI nutrition, health tracking, calorie counter, macro tracking, body measurements, wellness platform, healthy eating, personalized nutrition",
  ogImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png",
  ogType = "website",
  canonical,
  schemaData
}) {
  useEffect(() => {
    const siteUrl = window.location.origin;
    const currentUrl = window.location.href;
    const canonicalUrl = canonical || currentUrl;

    // Update title
    document.title = title;

    // Update or create meta tags
    const setMetaTag = (name, content, property = false) => {
      const attr = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    
    // Open Graph
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', 'DishCore', true);

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:url', currentUrl);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // SEO
    setMetaTag('robots', 'index, follow');
    setMetaTag('language', 'English');
    setMetaTag('author', 'BioMath Core');

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Schema.org structured data
    if (schemaData) {
      let schemaScript = document.querySelector('script#schema-data');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'schema-data';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schemaData);
    }

    // Organization schema
    let orgScript = document.querySelector('script#org-schema');
    if (!orgScript) {
      orgScript = document.createElement('script');
      orgScript.id = 'org-schema';
      orgScript.type = 'application/ld+json';
      orgScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "DishCore",
        "url": siteUrl,
        "logo": ogImage,
        "description": "AI-powered nutrition and health optimization platform",
        "foundingDate": "2025",
        "sameAs": [
          "https://facebook.com/dishcore",
          "https://instagram.com/dishcore",
          "https://youtube.com/dishcore"
        ]
      });
      document.head.appendChild(orgScript);
    }
  }, [title, description, keywords, ogImage, ogType, canonical, schemaData]);

  return null;
}

// Recipe Schema Generator
export function generateRecipeSchema(dish) {
  if (!dish) return null;

  return {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": dish.name,
    "image": dish.image_url,
    "description": dish.description || dish.ai_summary,
    "keywords": dish.tags?.join(', '),
    "recipeYield": dish.servings || 1,
    "prepTime": dish.prep_time ? `PT${dish.prep_time}M` : undefined,
    "cookTime": dish.cook_time ? `PT${dish.cook_time}M` : undefined,
    "totalTime": (dish.prep_time && dish.cook_time) ? `PT${dish.prep_time + dish.cook_time}M` : undefined,
    "recipeIngredient": dish.ingredients?.map(ing => 
      typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`
    ),
    "recipeInstructions": dish.cooking_instructions?.map((instruction, idx) => ({
      "@type": "HowToStep",
      "text": instruction,
      "position": idx + 1
    })),
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": `${dish.calories || 0} calories`,
      "proteinContent": `${dish.protein || 0}g`,
      "carbohydrateContent": `${dish.carbs || 0}g`,
      "fatContent": `${dish.fat || 0}g`,
      "fiberContent": `${dish.fiber || 0}g`,
      "sugarContent": `${dish.sugar || 0}g`,
      "sodiumContent": `${dish.sodium || 0}mg`
    },
    "recipeCategory": dish.meal_type,
    "recipeCuisine": dish.cuisine_type,
    "aggregateRating": dish.rating ? {
      "@type": "AggregateRating",
      "ratingValue": dish.rating,
      "ratingCount": dish.reviewCount || 1
    } : undefined
  };
}