import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";

import {
  createAdminTravelStyle,
  getAdminTravelStyle,
  updateAdminTravelStyle,
} from "../components/api/collections/adminTravelStylesService";
import {
  fetchAdminCollectionTours,
  attachTourToCollection,
  removeTourFromCollection,
  reorderCollectionTours,
  toggleCollectionTourFeatured,
} from "../components/api/collections/adminCollectionsService";
import { fetchAdminTours } from "../components/api/admin.api";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const collectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  hero_image_url: z.string().optional(),
  icon: z.string().optional(),
  accent_color: z.string().optional(),
  metadata: z.string().optional(),
  is_published: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});

const emptyMetadata = JSON.stringify({}, null, 2);

function parseMetadata(value) {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    toast.error("Unable to parse metadata JSON. Using empty object.");
    return {};
  }
}

function SortableTourRow({ item, onToggleFeatured, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="collection-tour-row">
      <span className="collection-tour__handle" {...attributes} {...listeners}>
        ☰
      </span>
      <div className="collection-tour__meta">
        <strong>{item.tour_title}</strong>
        <div className="collection-tour__slug">{item.tour_slug}</div>
      </div>
      <div className="collection-tour__status">
        <span className="badge">{item.is_featured ? "Featured" : "Curated"}</span>
      </div>
      <div className="collection-tour__actions">
        <button
          type="button"
          className="link-button"
          onClick={() => onToggleFeatured(item.tour_id, !item.is_featured)}
        >
          {item.is_featured ? "Unfeature" : "Feature"}
        </button>
        <button
          type="button"
          className="link-button link-button--danger"
          onClick={() => onRemove(item.tour_id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function CollectionToursTab({ slug }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const queryClient = useQueryClient();

  const {
    data: curatedTours,
    isLoading: isCuratedLoading,
    refetch: refetchCurated,
  } = useQuery({
    queryKey: ["collectionTours", slug],
    queryFn: () => fetchAdminCollectionTours(slug),
    enabled: Boolean(slug),
  });

  const [dragItems, setDragItems] = useState([]);

  useEffect(() => {
    if (curatedTours) {
      setDragItems(
        [...curatedTours].sort((a, b) => a.order - b.order)
      );
    }
  }, [curatedTours]);

  const {
    data: searchData,
    isLoading: isSearchLoading,
  } = useQuery({
    queryKey: ["adminTours", debouncedSearch],
    queryFn: () =>
      fetchAdminTours({
        search: debouncedSearch,
        ordering: "-created_at",
      }),
    enabled: Boolean(slug),
  });

  const attachMutation = useMutation({
    mutationFn: (tourId) => attachTourToCollection(slug, tourId),
    onSuccess: () => {
      toast.success("Tour added to collection");
      refetchCurated();
    },
    onError: () => toast.error("Unable to add tour"),
  });

  const reorderMutation = useMutation({
    mutationFn: (items) => reorderCollectionTours(slug, items),
    onSuccess: () => {
      toast.success("Collection order updated");
      refetchCurated();
    },
    onError: () => toast.error("Unable to reorder tours"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ tourId, isFeatured }) => toggleCollectionTourFeatured(slug, tourId, isFeatured),
    onSuccess: () => {
      refetchCurated();
    },
    onError: () => toast.error("Failed to toggle featured flag"),
  });

  const removeMutation = useMutation({
    mutationFn: (tourId) => removeTourFromCollection(slug, tourId),
    onSuccess: () => {
      toast.success("Tour removed");
      refetchCurated();
    },
    onError: () => toast.error("Unable to remove tour"),
  });

  const handleAddTour = (tourId) => {
    if (attachMutation.isLoading) return;
    attachMutation.mutate(tourId);
  };

  const handleRemove = (tourId) => {
    removeMutation.mutate(tourId);
  };

  const handleToggleFeatured = (tourId, isFeatured) => {
    toggleMutation.mutate({ tourId, isFeatured });
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }) => {
    if (!over || !dragItems.length || active.id === over.id) {
      return;
    }

    const oldIndex = dragItems.findIndex((item) => item.id === active.id);
    const newIndex = dragItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const ordered = arrayMove(dragItems, oldIndex, newIndex);
    setDragItems(ordered);
    reorderMutation.mutate(
      ordered.map((item, index) => ({
        tour_id: item.tour_id,
        order: index + 1,
      }))
    );
  };

  const existingTourIds = useMemo(
    () => new Set((curatedTours || []).map((item) => item.tour_id)),
    [curatedTours]
  );

  const searchResults = useMemo(
    () => (Array.isArray(searchData) ? searchData : searchData?.results || []),
    [searchData]
  );

  return (
        <div className="collection-tab">
      <div className="search-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tours to add..."
        />
      </div>

      <div className="collection-tab__section">
        <h3>Search results</h3>
        <div className="collection-search-results">
          {searchResults
            .slice(0, 8)
            .map((tour) => (
              <div key={tour.id} className="collection-search-card">
                <div>
                  <strong>{tour.title}</strong>
                  <div className="collection-tour__slug">{tour.slug}</div>
                </div>
                <button
                  type="button"
                  disabled={existingTourIds.has(tour.id)}
                  onClick={() => handleAddTour(tour.id)}
                >
                  {existingTourIds.has(tour.id) ? "Already added" : "Add"}
                </button>
              </div>
            ))}
          {!searchData?.length && !isSearchLoading && (
            <p className="subtle">No tours found for that query.</p>
          )}
        </div>
      </div>

      <div className="collection-tab__section">
        <div className="collection-tab__section-header">
          <h3>Tours in this collection</h3>
          <span className="subtle">Drag to reorder</span>
        </div>
        {isCuratedLoading && <div className="skeleton-line" />}
        {!isCuratedLoading && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={(dragItems || []).map((item) => item.id)} strategy={verticalListSortingStrategy}>
              {(dragItems || []).map((item) => (
                <SortableTourRow
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
        {!isCuratedLoading && dragItems?.length === 0 && (
          <div className="empty-state">No tours curated yet.</div>
        )}
      </div>
    </div>
  );
}

export default function CollectionEditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");

  const { data: collection, isLoading } = useQuery({
    queryKey: ["adminCollection", slug],
    queryFn: () => getAdminTravelStyle(slug),
    enabled: Boolean(slug),
  });

  const form = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      hero_image_url: "",
      icon: "",
      accent_color: "",
      metadata: emptyMetadata,
      is_published: true,
      order: 0,
    },
  });

  const { handleSubmit, register, reset } = form;

  useEffect(() => {
    if (collection) {
      reset({
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        hero_image_url: collection.hero_image_url,
        icon: collection.icon,
        accent_color: collection.accent_color,
        metadata: JSON.stringify(collection.metadata || {}, null, 2),
        is_published: collection.is_published,
        order: collection.order || 0,
      });
    }
  }, [collection, reset]);

  const saveMutation = useMutation({
    mutationFn: (value) =>
      slug
        ? updateAdminTravelStyle(slug, value)
        : createAdminTravelStyle(value),
    onSuccess: (result) => {
      toast.success("Collection saved");
      queryClient.invalidateQueries({ queryKey: ["adminCollections"] });
      if (!slug && result?.slug) {
        navigate(`/admin/collections/${result.slug}/edit`, { replace: true });
      }
    },
    onError: () => toast.error("Unable to save collection"),
  });

  const onSubmit = (values) => {
    const payload = {
      ...values,
      metadata: parseMetadata(values.metadata),
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="page-section">
      <div className="page-section__header">
        <div>
          <p className="eyebrow">{slug ? "Edit" : "New"} Collection</p>
          <h2>{slug ? collection?.name ?? "Loading..." : "Create a collection"}</h2>
        </div>
        <div className="page-actions">
          <Link className="link-button" to="/admin/collections">
            Back to list
          </Link>
          <button
            type="button"
            className="button button--primary"
            onClick={handleSubmit(onSubmit)}
            disabled={saveMutation.isLoading}
          >
            {saveMutation.isLoading ? "Saving..." : "Save collection"}
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab${activeTab === "details" ? " tab--active" : ""}`}
          type="button"
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          className={`tab${activeTab === "tours" ? " tab--active" : ""}`}
          type="button"
          onClick={() => setActiveTab("tours")}
          disabled={!slug}
        >
          Tours in this collection
        </button>
      </div>

      {activeTab === "details" && (
        <form className="card" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <label>
              Name
              <input type="text" {...register("name")} />
            </label>
            <label>
              Slug
              <input type="text" {...register("slug")} />
            </label>
            <label>
              Description
              <textarea {...register("description")} rows="3" />
            </label>
            <label>
              Hero image
              <input type="url" {...register("hero_image_url")} />
            </label>
            <label>
              Icon
              <input type="text" {...register("icon")} />
            </label>
            <label>
              Accent color
              <input type="text" {...register("accent_color")} />
            </label>
            <label>
              Order
              <input type="number" {...register("order")} min="0" />
            </label>
            <label className="checkbox-field">
              <input type="checkbox" {...register("is_published")} />
              Published
            </label>
            <label>
              Metadata (JSON)
              <textarea {...register("metadata")} rows="6" />
            </label>
          </div>
        </form>
      )}

      {activeTab === "tours" && slug && <CollectionToursTab slug={slug} />}
    </div>
  );
}
