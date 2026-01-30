import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { fetchAdminCollections } from "../components/api/collections/adminCollectionsService";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export default function CollectionsListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["adminCollections", debouncedSearch],
    queryFn: () => fetchAdminCollections(debouncedSearch ? { search: debouncedSearch } : {}),
    placeholderData: (previousData) => previousData,
  });

  const collections = useMemo(
    () => (Array.isArray(data) ? data : data?.results || []),
    [data]
  );

  return (
    <div className="page-section">
      <div className="page-section__header">
        <div>
          <p className="eyebrow">Collections</p>
          <h2>Curated Styles</h2>
          <p className="subtle">Organize the tours that belong to each travel style.</p>
        </div>
        <Link className="button button--primary" to="/admin/collections/new">
          + Add new collection
        </Link>
      </div>

      <div className="search-row">
        <input
          type="search"
          placeholder="Search collections..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Published</th>
              <th>Order</th>
              <th>Tours Curated</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              new Array(3).fill(null).map((_, idx) => (
                <tr key={idx} className="skeleton-row">
                  <td colSpan="7">
                    <div className="skeleton-line" />
                  </td>
                </tr>
              ))}
            {!isLoading && collections.length === 0 && (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">No collections found.</div>
                </td>
              </tr>
            )}
            {!isLoading &&
              collections.map((collection) => (
                <tr key={collection.id}>
                  <td>
                    <strong>{collection.name}</strong>
                  </td>
                  <td>{collection.slug}</td>
                  <td>{collection.is_published ? "Published" : "Draft"}</td>
                  <td>{collection.order}</td>
                  <td>{collection.tours_count ?? 0}</td>
                  <td>{new Date(collection.updated_at).toLocaleDateString()}</td>
                  <td>
                    <Link className="link-button" to={`/admin/collections/${collection.slug}/edit`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
