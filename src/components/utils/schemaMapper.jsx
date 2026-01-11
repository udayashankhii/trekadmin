// src/components/utils/schemaMapper.js

/**
 * Map between different JSON schema formats
 * Handles variations in field naming between different sources
 */

// Field mappings: [input_field] -> [output_field]
const FIELD_MAPPINGS = {
  // Trek level fields
  'hero': 'hero_section',
  'hero_section': 'hero_section',
  
  'actions': 'action',
  'action': 'action',
  
  'cost_dates': 'cost_and_date_section',
  'cost_and_date_section': 'cost_and_date_section',
  
  'gallery': 'gallery_images',
  'gallery_images': 'gallery_images',
  
  'similar': 'similar_treks',
  'similar_treks': 'similar_treks',
  
  'additional_info': 'additional_info_sections',
  'additional_info_sections': 'additional_info_sections',
  
  // Hero section fields
  'image_path': 'image_path',
  'tagline': 'tagline',
  'cta_text': 'cta_label',
  'cta_label': 'cta_label',
  'cta_link': 'cta_link',
  
  // Actions fields
  'pdf_url': 'pdf_path',
  'pdf_path': 'pdf_path',
  'map_image': 'map_image_path',
  'map_image_path': 'map_image_path',
  
  // Cost fields
  'inclusions': 'cost_inclusions',
  'cost_inclusions': 'cost_inclusions',
  'exclusions': 'cost_exclusions',
  'cost_exclusions': 'cost_exclusions',
  
  // Cost and dates
  'departures_by_month': 'departures',
  'departures': 'departures',
  'groupPrices': 'group_prices',
  'group_prices': 'group_prices',
  'highlights': 'date_highlights',
  'date_highlights': 'date_highlights',
  
  // FAQ fields
  'faqs': 'questions',
  'questions': 'questions',
  
  // Overview fields
  'articles': 'articles',
};

/**
 * Normalize trek data to match Django API schema
 */
export function normalizeTrekSchema(trek) {
  const normalized = { ...trek };
  
  console.log('📝 Normalizing trek schema:', trek.slug || trek.title);
  
  // 1. Normalize hero section
  if (trek.hero && !trek.hero_section) {
    normalized.hero_section = normalizeHeroSection(trek.hero);
    delete normalized.hero;
  } else if (trek.hero_section) {
    normalized.hero_section = normalizeHeroSection(trek.hero_section);
  }
  
  // 2. Normalize actions
  if (trek.actions && !trek.action) {
    normalized.action = normalizeActions(trek.actions);
    delete normalized.actions;
  } else if (trek.action) {
    normalized.action = normalizeActions(trek.action);
  }
  
  // 3. Normalize cost
  if (trek.cost) {
    normalized.cost = normalizeCost(trek.cost);
  }
  
  // 4. Normalize cost_and_date_section
  if (trek.cost_dates && !trek.cost_and_date_section) {
    normalized.cost_and_date_section = normalizeCostDates(trek.cost_dates);
    normalized.departures = normalizeDepartures(trek.cost_dates);
    normalized.group_prices = normalizeGroupPrices(trek.cost_dates);
    normalized.date_highlights = normalizeDateHighlights(trek.cost_dates);
    delete normalized.cost_dates;
  } else if (trek.cost_and_date_section) {
    normalized.cost_and_date_section = trek.cost_and_date_section;
  }
  
  // 5. Normalize FAQ
  if (trek.faq_categories) {
    normalized.faq_categories = trek.faq_categories.map(normalizeFaqCategory);
  }
  
  // 6. Normalize gallery
  if (trek.gallery && !trek.gallery_images) {
    normalized.gallery_images = trek.gallery;
    delete normalized.gallery;
  }
  
  // 7. Normalize additional info
  if (trek.additional_info && !trek.additional_info_sections) {
    normalized.additional_info_sections = normalizeAdditionalInfo(trek.additional_info);
    delete normalized.additional_info;
  }
  
  // 8. Normalize similar treks
  if (trek.similar && !trek.similar_treks) {
    normalized.similar_treks = trek.similar;
    delete normalized.similar;
  }
  
  // 9. Normalize overview
  if (trek.overview?.sections) {
    normalized.overview = {
      sections: trek.overview.sections.map(normalizeOverviewSection)
    };
  }
  
  console.log('✅ Schema normalized successfully');
  return normalized;
}

function normalizeHeroSection(hero) {
  return {
    title: hero.title || '',
    subtitle: hero.subtitle || '',
    tagline: hero.tagline || '',
    image_path: hero.image_path || '',
    season: hero.season || '',
    duration: hero.duration || '',
    difficulty: hero.difficulty || '',
    location: hero.location || '',
    cta_label: hero.cta_text || hero.cta_label || 'Book This Trek',
    cta_link: hero.cta_link || '',
  };
}

function normalizeActions(actions) {
  return {
    pdf_path: actions.pdf_path || actions.pdf_url || '',
    map_image_path: actions.map_image_path || actions.map_image || '',
  };
}

function normalizeCost(cost) {
  return {
    title: cost.title || 'Cost Includes / Excludes',
    cost_inclusions: cost.cost_inclusions || cost.inclusions || [],
    cost_exclusions: cost.cost_exclusions || cost.exclusions || [],
  };
}

function normalizeCostDates(costDates) {
  return {
    intro_text: costDates.intro_text || '',
  };
}

function normalizeDepartures(costDates) {
  if (!costDates.departures_by_month) {
    return costDates.departures || [];
  }
  
  // Flatten departures_by_month into a single array
  const allDepartures = [];
  costDates.departures_by_month.forEach(monthData => {
    if (monthData.departures && Array.isArray(monthData.departures)) {
      allDepartures.push(...monthData.departures);
    }
  });
  
  return allDepartures;
}

function normalizeGroupPrices(costDates) {
  return costDates.groupPrices || costDates.group_prices || [];
}

function normalizeDateHighlights(costDates) {
  return costDates.highlights || costDates.date_highlights || [];
}

function normalizeFaqCategory(category) {
  return {
    title: category.title || '',
    icon: category.icon || 'general',
    order: category.order || 1,
    questions: (category.faqs || category.questions || []).map((q, idx) => ({
      question: q.question || '',
      answer: q.answer || '',
      order: q.order ?? idx + 1,
    })),
  };
}

function normalizeAdditionalInfo(additionalInfo) {
  return additionalInfo.map(section => {
    // Handle different articles formats
    let articles = [];
    
    if (section.articles) {
      if (Array.isArray(section.articles)) {
        articles = section.articles;
      } else if (section.articles.articles) {
        articles = section.articles.articles;
      } else if (typeof section.articles === 'string') {
        articles = [section.articles];
      }
    }
    
    return {
      heading: section.heading || '',
      articles: articles,
      order: section.order ?? 1,
      bullets: section.bullets || [],
    };
  });
}

function normalizeOverviewSection(section) {
  // Handle different articles formats
  let articles = [];
  
  if (section.articles) {
    if (Array.isArray(section.articles)) {
      articles = section.articles;
    } else if (section.articles.details) {
      // Convert details object to article string
      articles = [JSON.stringify(section.articles.details)];
    } else if (typeof section.articles === 'string') {
      articles = [section.articles];
    }
  }
  
  return {
    heading: section.heading || '',
    articles: articles,
    order: section.order ?? 1,
    bullets: section.bullets || [],
  };
}

/**
 * Validate normalized schema
 */
export function validateNormalizedSchema(trek) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!trek.slug) errors.push('Missing required field: slug');
  if (!trek.title) errors.push('Missing required field: title');
  
  // Recommended fields
  if (!trek.hero_section) warnings.push('Missing hero_section');
  if (!trek.overview) warnings.push('Missing overview');
  if (!trek.itinerary_days || trek.itinerary_days.length === 0) {
    warnings.push('Missing itinerary_days');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalize entire import payload
 */
export function normalizeImportPayload(payload) {
  console.log('🔄 Normalizing import payload...');
  
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload: Expected object');
  }
  
  const normalized = {
    meta: payload.meta || {
      schema_version: "1.0",
      mode: "replace_nested",
      generated_by: "admin_panel",
      generated_at: new Date().toISOString(),
    },
    regions: payload.regions || [],
    treks: [],
  };
  
  // Normalize each trek
  if (payload.treks && Array.isArray(payload.treks)) {
    normalized.treks = payload.treks.map((trek, index) => {
      try {
        const normalizedTrek = normalizeTrekSchema(trek);
        
        // Validate
        const validation = validateNormalizedSchema(normalizedTrek);
        if (!validation.valid) {
          console.error(`❌ Trek ${index + 1} validation failed:`, validation.errors);
        }
        if (validation.warnings.length > 0) {
          console.warn(`⚠️ Trek ${index + 1} warnings:`, validation.warnings);
        }
        
        return normalizedTrek;
      } catch (error) {
        console.error(`❌ Failed to normalize trek ${index + 1}:`, error);
        throw new Error(`Trek ${index + 1} (${trek.title || trek.slug}): ${error.message}`);
      }
    });
  }
  
  console.log('✅ Payload normalized successfully', {
    regions: normalized.regions.length,
    treks: normalized.treks.length,
  });
  
  return normalized;
}
