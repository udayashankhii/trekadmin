export const FULL_IMPORT_TEMPLATE = {
  meta: {
    schema_version: "1.0",
    mode: "replace_nested",
    generated_by: "admin_panel",
    generated_at: new Date().toISOString(),
  },
  regions: [
    {
      name: "Everest",
      slug: "everest",
      short_label: "EBC, Gokyo, Three Passes",
      order: 1,
      marker_x: 50,
      marker_y: 50,
      cover_path: "",
    },
  ],
  treks: [
    {
      slug: "everest-base-camp-trek",
      title: "Everest Base Camp Trek",
      region_slug: "everest",
      duration: "14 Days",
      trip_grade: "Moderate",
      start_point: "Lukla",
      group_size: "1-12",
      max_altitude: "5364m",
      activity: "Trekking",
      review_text: "Classic trek to Everest Base Camp",
      rating: 4.9,
      reviews: 150,
      hero_section: {
        title: "Everest Base Camp Trek",
        subtitle: "Journey to the base of the world's highest peak",
        tagline: "EBC Trek",
        cta_text: "Book Now",
        cta_link: "/booking/everest-base-camp-trek",
        image_path: "",
      },
      overview: {
        sections: [
          {
            heading: "Trek Overview",
            articles: ["Experience the legendary trek to Everest Base Camp..."],
            order: 1,
            bullets: [
              { text: "Max altitude 5364m", icon: "mountain", order: 1 },
              { text: "Best seasons: Spring & Autumn", icon: "calendar", order: 2 },
            ],
          },
        ],
      },
      itinerary_days: [
        {
          day: 1,
          title: "Arrival in Kathmandu",
          description: "Welcome to Nepal",
          accommodation: "Hotel",
          altitude: "1400m",
          duration: "",
          distance: "",
          meals: "Dinner",
          place_name: "Kathmandu",
          latitude: 27.7172,
          longitude: 85.324,
        },
      ],
      highlights: [
        {
          title: "Everest Views",
          description: "Stunning views of Mt. Everest",
          icon: "scenery",
        },
      ],
      action: {
        pdf_path: "",
        map_image_path: "",
      },
      cost: {
        title: "Cost Includes / Excludes",
        cost_inclusions: ["Guide", "Permits", "Accommodation"],
        cost_exclusions: ["International flights", "Personal expenses"],
      },
      cost_and_date_section: {
        intro_text: "Choose your preferred departure dates",
      },
      departures: [
        {
          start: "2026-03-10",
          end: "2026-03-23",
          status: "Available",
          price: 1299.0,
          seats_left: 10,
        },
      ],
      group_prices: [
        { label: "1 Person", price: 1499.0 },
        { label: "2-4 Person", price: 1299.0 },
      ],
      date_highlights: [{ highlight: "Best window: March–May" }],
      faq_categories: [
        {
          title: "General",
          icon: "general",
          order: 1,
          questions: [
            {
              question: "What is the best time to trek?",
              answer: "Spring (March-May) and Autumn (September-November)",
              order: 1,
            },
          ],
        },
      ],
      gallery_images: [],
      elevation_chart: {
        title: "Elevation Profile",
        subtitle: "Day-wise elevation changes",
        background_image_path: "",
        points: [],
      },
      booking_card: {
        base_price: 1299.0,
        original_price: 1499.0,
        pricing_mode: "base_only",
        badge_label: "Popular",
        secure_payment: true,
        no_hidden_fees: true,
        free_cancellation: true,
        support_24_7: true,
        trusted_reviews: true,
        group_prices: [
          { min_size: 1, max_size: 1, price: 1499.0 },
          { min_size: 2, max_size: 4, price: 1299.0 },
        ],
      },
      additional_info_sections: [],
      similar_treks: [],
      reviews_list: [],
    },
  ],
};

export const downloadTemplate = (format = "json") => {
  try {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(FULL_IMPORT_TEMPLATE, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trek-import-template-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true };
    }
    return { success: false, error: "Unsupported format" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
