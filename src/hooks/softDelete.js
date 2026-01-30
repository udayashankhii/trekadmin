const SOFT_DELETE_KEY = "soft_deleted_treks";

export const getSoftDeletedTreks = () => {
  try {
    return JSON.parse(localStorage.getItem(SOFT_DELETE_KEY)) || [];
  } catch {
    return [];
  }
};

export const softDeleteTrek = (slug) => {
  const existing = getSoftDeletedTreks();
  if (!existing.includes(slug)) {
    localStorage.setItem(
      SOFT_DELETE_KEY,
      JSON.stringify([...existing, slug])
    );
  }
};

export const restoreSoftDeletedTrek = (slug) => {
  const existing = getSoftDeletedTreks();
  localStorage.setItem(
    SOFT_DELETE_KEY,
    JSON.stringify(existing.filter((s) => s !== slug))
  );
};
