import  adminApi  from "../admin.api";

export function fetchAdminCollections(params = {}) {
  return adminApi.get("/travel-styles/", { params });
}

export function fetchAdminCollectionTours(slug) {
  return adminApi.get(`/travel-styles/${slug}/tours/`);
}

export function attachTourToCollection(slug, tourId) {
  return adminApi.post(`/travel-styles/${slug}/tours/`, { tour_id: tourId });
}

export function removeTourFromCollection(slug, tourId) {
  return adminApi.delete(`/travel-styles/${slug}/tours/${tourId}/`);
}

export function reorderCollectionTours(slug, items) {
  return adminApi.patch(`/travel-styles/${slug}/tours/reorder/`, { items });
}

export function toggleCollectionTourFeatured(slug, tourId, isFeatured) {
  return adminApi.patch(`/travel-styles/${slug}/tours/${tourId}/`, {
    is_featured: isFeatured,
  });
}
