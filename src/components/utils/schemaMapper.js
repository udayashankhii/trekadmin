



// / src/components/utils/schemaMapper.js

/**
 * Map between different JSON schema formats with meta support
 * Handles variations in field naming and auto-generates metadata
 */

/**
 * Normalize itinerary day with GPS coordinates
 */
function normalizeItineraryDay(day) {
  // Parse latitude and longitude to ensure they're numbers
  let lat = null;
  let lng = null;

  if (day.latitude !== undefined && day.latitude !== null) {
    lat = typeof day.latitude === 'string' ? parseFloat(day.latitude) : day.latitude;
    // Validate latitude range
    if (isNaN(lat) || lat < -90 || lat > 90) {
      console.warn(`Invalid latitude for day ${day.day}: ${day.latitude}`);
      lat = null;
    }
  }

  if (day.longitude !== undefined && day.longitude !== null) {
    lng = typeof day.longitude === 'string' ? parseFloat(day.longitude) : day.longitude;
    // Validate longitude range
    if (isNaN(lng) || lng < -180 || lng > 180) {
      console.warn(`Invalid longitude for day ${day.day}: ${day.longitude}`);
      lng = null;
    }
  }

  return {
    day: day.day || 1,
    title: day.title || '',
    description: day.description || '',
    accommodation: day.accommodation || '',
    altitude: day.altitude || '',
    duration: day.duration || '',
    distance: day.distance || '',
    meals: day.meals || '',
    place_name: day.place_name || '',
    latitude: lat,
    longitude: lng,
  };
}

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

  // ✅ 10. Normalize itinerary days (including GPS coordinates)
  if (trek.itinerary_days && Array.isArray(trek.itinerary_days)) {
    normalized.itinerary_days = trek.itinerary_days.map(normalizeItineraryDay);

    // Count how many have GPS coordinates
    const withGPS = normalized.itinerary_days.filter(
      day => day.latitude !== null && day.longitude !== null
    ).length;

    console.log(`📍 Normalized ${normalized.itinerary_days.length} itinerary days`);
    console.log(`🗺️  ${withGPS} days have GPS coordinates`);

    if (withGPS === 0) {
      console.warn('⚠️  No GPS coordinates found in itinerary - map will not work!');
    } else if (withGPS < normalized.itinerary_days.length) {
      console.warn(`⚠️  Only ${withGPS}/${normalized.itinerary_days.length} days have GPS coordinates`);
    }
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
  let articles = [];

  if (section.articles) {
    if (Array.isArray(section.articles)) {
      articles = section.articles;
    } else if (section.articles.details) {
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

  if (!trek.slug) errors.push('Missing required field: slug');
  if (!trek.title) errors.push('Missing required field: title');

  if (!trek.hero_section) warnings.push('Missing hero_section');
  if (!trek.overview) warnings.push('Missing overview');
  if (!trek.itinerary_days || trek.itinerary_days.length === 0) {
    warnings.push('Missing itinerary_days');
  }

  // Check GPS coordinates
  if (trek.itinerary_days && trek.itinerary_days.length > 0) {
    const withGPS = trek.itinerary_days.filter(
      day => day.latitude !== null && day.longitude !== null
    ).length;

    if (withGPS === 0) {
      warnings.push('No GPS coordinates found - interactive map will not work');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate comprehensive statistics
 */
function calculateStatistics(payload) {
  const stats = {
    regions: 0,
    treks: 0,
    total_itinerary_days: 0,
    total_highlights: 0,
    total_faqs: 0,
    total_gallery_images: 0,
    total_departures: 0,
    days_with_gps: 0
  };

  if (payload.regions && Array.isArray(payload.regions)) {
    stats.regions = payload.regions.length;
  }

  if (payload.treks && Array.isArray(payload.treks)) {
    stats.treks = payload.treks.length;

    payload.treks.forEach(trek => {
      if (trek.itinerary_days) {
        stats.total_itinerary_days += trek.itinerary_days.length;

        // Count days with GPS
        const withGPS = trek.itinerary_days.filter(
          day => day.latitude !== null && day.longitude !== null
        ).length;
        stats.days_with_gps += withGPS;
      }
      if (trek.highlights) {
        stats.total_highlights += trek.highlights.length;
      }
      if (trek.faq_categories) {
        trek.faq_categories.forEach(cat => {
          if (cat.questions) {
            stats.total_faqs += cat.questions.length;
          }
        });
      }
      if (trek.gallery_images) {
        stats.total_gallery_images += trek.gallery_images.length;
      }
      if (trek.departures) {
        stats.total_departures += trek.departures.length;
      }
    });
  }

  return stats;
}

/**
 * Normalize entire import payload with meta generation
 */
export function normalizeImportPayload(payload) {
  console.log('🔄 Normalizing import payload...');

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload: Expected object');
  }

  // Auto-generate or enhance meta
  const baseMeta = {
    schema_version: '2.0',
    format: 'trek_import',
    mode: 'replace_nested',
    generated_by: 'admin_panel',
    generated_at: new Date().toISOString(),
    generator_version: '1.0.0'
  };

  const normalized = {
    meta: payload.meta ? { ...baseMeta, ...payload.meta } : baseMeta,
    regions: payload.regions || [],
    treks: [],
  };

  // Normalize each trek
  if (payload.treks && Array.isArray(payload.treks)) {
    normalized.treks = payload.treks.map((trek, index) => {
      try {
        const normalizedTrek = normalizeTrekSchema(trek);

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

  // Add statistics to meta
  const stats = calculateStatistics(normalized);
  normalized.meta.counts = stats;

  // Add default validation and options if missing
  if (!normalized.meta.validation) {
    normalized.meta.validation = {
      strict_mode: false,
      allow_partial_import: true,
      skip_missing_images: true,
      validate_slugs: true,
      required_fields: ['slug', 'title', 'region_slug']
    };
  }

  if (!normalized.meta.options) {
    normalized.meta.options = {
      overwrite_existing: true,
      create_missing_regions: false,
      preserve_reviews: true,
      preserve_bookings: true,
      update_timestamps: true
    };
  }

  if (!normalized.meta.source) {
    normalized.meta.source = {
      type: 'manual_upload',
      origin: 'trek_admin_panel',
      environment: 'production',
      user: 'admin',
      notes: ''
    };
  }

  if (!normalized.meta.processing) {
    normalized.meta.processing = {
      batch_size: 10,
      timeout_seconds: 300,
      retry_failed: true,
      max_retries: 3
    };
  }

  console.log('✅ Payload normalized successfully', normalized.meta.counts);

  return normalized;
}

// Export template
export const FULL_IMPORT_TEMPLATE = {
  meta: {
    schema_version: '2.0',
    format: 'trek_import',
    mode: 'replace_nested',
    generated_by: 'admin_panel',
    generated_at: new Date().toISOString(),
    generator_version: '1.0.0'
  },
  regions: [
    {
      name: 'Everest',
      slug: 'everest',
      short_label: 'EBC, Gokyo, Three Passes',
      order: 1,
      marker_x: 50,
      marker_y: 50,
      cover_path: '',
    },
  ],
  treks: [
    {
      slug: 'everest-base-camp-trek',
      title: 'Everest Base Camp Trek',
      region_slug: 'everest',
      duration: '14 Days',
      trip_grade: 'Moderate',
      start_point: 'Lukla',
      group_size: '1-12',
      max_altitude: '5364m',
      activity: 'Trekking',
      hero_section: {
        title: 'Everest Base Camp Trek',
        subtitle: 'Journey to the world\'s highest peak',
        image_path: '',
        season: 'Spring & Autumn',
        duration: '14',
        difficulty: 'Moderate',
        location: 'Solukhumbu',
        cta_label: 'Book Now',
        cta_link: '',
      },
      overview: {
        sections: [
          {
            heading: 'Trek Overview',
            articles: ['Experience the legendary trek...'],
            order: 1,
            bullets: []
          }
        ]
      },
      itinerary_days: [
        {
          day: 1,
          title: 'Arrival in Kathmandu',
          description: 'Welcome to Nepal',
          accommodation: 'Hotel',
          altitude: '1400m',
          duration: '',
          distance: '',
          meals: 'Dinner',
          place_name: 'Kathmandu',
          latitude: 27.7172,
          longitude: 85.324,
        },
      ],
      highlights: [],
      action: {
        pdf_path: '',
        map_image_path: '',
      },
      cost: {
        title: 'Cost Includes / Excludes',
        cost_inclusions: [],
        cost_exclusions: [],
      },
      cost_and_date_section: {
        intro_text: '',
      },
      departures: [],
      group_prices: [],
      date_highlights: [],
      faq_categories: [],
      gallery_images: [],
      elevation_chart: {
        title: 'Elevation Profile',
        subtitle: '',
        background_image_path: '',
        points: [],
      },
      booking_card: {
        base_price: 1299.0,
        original_price: 1499.0,
        pricing_mode: 'base_only',
        badge_label: 'Popular',
        secure_payment: true,
        no_hidden_fees: true,
        free_cancellation: true,
        support_24_7: true,
        trusted_reviews: true,
        group_prices: [],
      },
      additional_info_sections: [],
      similar_treks: [],
    },
  ],
};

export const downloadTemplate = (format = 'json') => {
  try {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(FULL_IMPORT_TEMPLATE, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trek-import-template-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true };
    }
    return { success: false, error: 'Unsupported format' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};