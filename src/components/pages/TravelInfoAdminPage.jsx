import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import {
  createAdminTravelInfoPage,
  deleteAdminTravelInfoPage,
  getAdminTravelInfoPage,
  getAdminTravelInfoPages,
  updateAdminTravelInfoPage,
} from "../api/admin.api";

const emptyForm = {
  slug: "",
  title: "",
  subtitle: "",
  summary: "",
  hero_image_url: "",
  highlights: "[]",
  sections: "[]",
  tips: "[]",
  faqs: "[]",
  meta_title: "",
  meta_description: "",
  meta_keywords: "[]",
  og_image_url: "",
  twitter_image_url: "",
  last_reviewed: "",
  is_published: true,
  order: 0,
};

const parseJsonField = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const stringifyField = (value) => {
  if (value === null || value === undefined) return "[]";
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return "[]";
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const TravelInfoAdminPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create");
  const [formData, setFormData] = useState({ ...emptyForm });
  const [activeSlug, setActiveSlug] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [jsonErrors, setJsonErrors] = useState({});

  const loadPages = async ({ resetPage = false } = {}) => {
    setLoading(true);
    setError("");
    if (resetPage) setPage(1);
    const params = { page: resetPage ? 1 : page };
    if (search.trim()) params.search = search.trim();

    try {
      const data = await getAdminTravelInfoPages(params);
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      const filtered =
        statusFilter === "all"
          ? list
          : list.filter((item) => Boolean(item.is_published) === (statusFilter === "published"));
      setRows(filtered);
      setPagination({
        count: data?.count ?? filtered.length,
        next: data?.next || null,
        previous: data?.previous || null,
      });
    } catch (err) {
      setError(err?.message || "Failed to load travel info pages.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages({ resetPage: true });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPages({ resetPage: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  useEffect(() => {
    loadPages();
  }, [page]);

  const openCreate = () => {
    setEditorMode("create");
    setFormData({ ...emptyForm });
    setActiveSlug("");
    setAdvancedOpen(false);
    setEditorOpen(true);
  };

  const openEdit = async (slug) => {
    setEditorMode("edit");
    setEditorOpen(true);
    setAdvancedOpen(false);
    try {
      const data = await getAdminTravelInfoPage(slug);
      setActiveSlug(slug);
      setFormData({
        slug: data.slug || "",
        title: data.title || "",
        subtitle: data.subtitle || "",
        summary: data.summary || "",
        hero_image_url: data.hero_image_url || "",
        highlights: stringifyField(data.highlights || []),
        sections: stringifyField(data.sections || []),
        tips: stringifyField(data.tips || []),
        faqs: stringifyField(data.faqs || []),
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        meta_keywords: stringifyField(data.meta_keywords || []),
        og_image_url: data.og_image_url || "",
        twitter_image_url: data.twitter_image_url || "",
        last_reviewed: data.last_reviewed || "",
        is_published: Boolean(data.is_published),
        order: data.order || 0,
      });
    } catch (err) {
      setError(err?.message || "Failed to load travel info page.");
      setEditorOpen(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Delete this travel info page?")) return;
    try {
      await deleteAdminTravelInfoPage(slug);
      loadPages({ resetPage: true });
    } catch (err) {
      setError(err?.message || "Failed to delete travel info page.");
    }
  };

  const handleSave = async () => {
    setError("");
    const errors = {};
    const highlightValue = parseJsonField(formData.highlights, null);
    if (!Array.isArray(highlightValue)) {
      errors.highlights = "Highlights must be a JSON array.";
    }
    const sectionsValue = parseJsonField(formData.sections, null);
    if (!Array.isArray(sectionsValue)) {
      errors.sections = "Sections must be a JSON array.";
    }
    const tipsValue = parseJsonField(formData.tips, null);
    if (!Array.isArray(tipsValue)) {
      errors.tips = "Tips must be a JSON array.";
    }
    const faqsValue = parseJsonField(formData.faqs, null);
    if (!Array.isArray(faqsValue)) {
      errors.faqs = "FAQs must be a JSON array.";
    }
    const keywordsValue = parseJsonField(formData.meta_keywords, null);
    if (!Array.isArray(keywordsValue)) {
      errors.meta_keywords = "Meta keywords must be a JSON array.";
    }
    setJsonErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the JSON validation errors.");
      return;
    }
    const payload = {
      slug: formData.slug.trim(),
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      summary: formData.summary.trim(),
      hero_image_url: formData.hero_image_url.trim(),
      highlights: highlightValue || [],
      sections: sectionsValue || [],
      tips: tipsValue || [],
      faqs: faqsValue || [],
      meta_title: formData.meta_title.trim(),
      meta_description: formData.meta_description.trim(),
      meta_keywords: keywordsValue || [],
      og_image_url: formData.og_image_url.trim(),
      twitter_image_url: formData.twitter_image_url.trim(),
      last_reviewed: formData.last_reviewed || null,
      is_published: formData.is_published,
      order: Number(formData.order || 0),
    };

    try {
      if (editorMode === "create") {
        await createAdminTravelInfoPage(payload);
      } else {
        await updateAdminTravelInfoPage(activeSlug, payload);
      }
      setEditorOpen(false);
      loadPages({ resetPage: true });
    } catch (err) {
      setError(err?.message || "Failed to save travel info page.");
    }
  };

  const columns = useMemo(
    () => [
      { key: "title", header: "Title" },
      { key: "slug", header: "Slug" },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <Badge variant={row.is_published ? "success" : "warning"}>
            {row.is_published ? "Published" : "Draft"}
          </Badge>
        ),
      },
      {
        key: "updated_at",
        header: "Updated",
        render: (row) => formatDate(row.updated_at),
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye size={16} />}
              onClick={() => window.open(`/travel-info/${row.slug}`, "_blank")}
            >
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit size={16} />}
              onClick={() => openEdit(row.slug)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={() => handleDelete(row.slug)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Search travel info..."
                icon={<Search size={16} />}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<RefreshCw size={18} />}
              onClick={() => loadPages({ resetPage: true })}
            >
              Refresh
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={openCreate}>
              New Page
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading travel info pages...
          </div>
        ) : rows.length ? (
          <Table columns={columns} data={rows} />
        ) : (
          <div className="py-12 text-center text-sm text-slate-500">
            No travel info pages yet.
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing {rows.length} of {pagination.count} pages
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft size={16} />}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className={!pagination.previous ? "opacity-50 pointer-events-none" : ""}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight size={16} />}
              onClick={() => setPage((prev) => prev + 1)}
              className={!pagination.next ? "opacity-50 pointer-events-none" : ""}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editorMode === "create" ? "Create Travel Info Page" : "Edit Travel Info Page"}
        footer={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            placeholder="Slug (e.g. visa-information)"
            value={formData.slug}
            onChange={(event) => setFormData((prev) => ({ ...prev, slug: event.target.value }))}
          />
          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
          />
          <Input
            placeholder="Subtitle"
            value={formData.subtitle}
            onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
          />
          <Input
            placeholder="Hero image URL"
            value={formData.hero_image_url}
            onChange={(event) => setFormData((prev) => ({ ...prev, hero_image_url: event.target.value }))}
          />
          <Input
            placeholder="Summary"
            value={formData.summary}
            onChange={(event) => setFormData((prev) => ({ ...prev, summary: event.target.value }))}
            className="md:col-span-2"
          />
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Content JSON
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Highlights</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        highlights: JSON.stringify(["Visa on arrival", "Required documents", "Fee table"], null, 2),
                      }))
                    }
                    className="text-teal-700"
                  >
                    Insert sample
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const value = parseJsonField(formData.highlights, null);
                      setJsonErrors((prev) => ({
                        ...prev,
                        highlights: Array.isArray(value) ? "" : "Highlights must be a JSON array.",
                      }));
                    }}
                    className="text-slate-500"
                  >
                    Validate
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                placeholder='Highlights JSON: ["Item 1", "Item 2"]'
                value={formData.highlights}
                onChange={(event) => setFormData((prev) => ({ ...prev, highlights: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {jsonErrors.highlights && (
                <p className="mt-2 text-xs text-red-600">{jsonErrors.highlights}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Sections</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        sections: JSON.stringify(
                          [
                            {
                              heading: "Visa on Arrival",
                              body: "Complete the arrival form and bring a valid passport.",
                              bullets: ["Passport valid 6+ months", "USD cash", "Passport photo"],
                            },
                          ],
                          null,
                          2
                        ),
                      }))
                    }
                    className="text-teal-700"
                  >
                    Insert sample
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const value = parseJsonField(formData.sections, null);
                      setJsonErrors((prev) => ({
                        ...prev,
                        sections: Array.isArray(value) ? "" : "Sections must be a JSON array.",
                      }));
                    }}
                    className="text-slate-500"
                  >
                    Validate
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                placeholder='Sections JSON: [{"heading":"...","body":"...","bullets":["..."]}]'
                value={formData.sections}
                onChange={(event) => setFormData((prev) => ({ ...prev, sections: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {jsonErrors.sections && (
                <p className="mt-2 text-xs text-red-600">{jsonErrors.sections}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tips</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        tips: JSON.stringify(
                          [
                            {
                              title: "Complete the online form",
                              description: "Submit within 15 days of arrival for faster processing.",
                            },
                          ],
                          null,
                          2
                        ),
                      }))
                    }
                    className="text-teal-700"
                  >
                    Insert sample
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const value = parseJsonField(formData.tips, null);
                      setJsonErrors((prev) => ({
                        ...prev,
                        tips: Array.isArray(value) ? "" : "Tips must be a JSON array.",
                      }));
                    }}
                    className="text-slate-500"
                  >
                    Validate
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                placeholder='Tips JSON: [{"title":"...","description":"..."}]'
                value={formData.tips}
                onChange={(event) => setFormData((prev) => ({ ...prev, tips: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {jsonErrors.tips && (
                <p className="mt-2 text-xs text-red-600">{jsonErrors.tips}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>FAQs</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        faqs: JSON.stringify(
                          [
                            {
                              question: "Can I extend my visa?",
                              answer: "Yes, extensions are available in Kathmandu and Pokhara.",
                            },
                          ],
                          null,
                          2
                        ),
                      }))
                    }
                    className="text-teal-700"
                  >
                    Insert sample
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const value = parseJsonField(formData.faqs, null);
                      setJsonErrors((prev) => ({
                        ...prev,
                        faqs: Array.isArray(value) ? "" : "FAQs must be a JSON array.",
                      }));
                    }}
                    className="text-slate-500"
                  >
                    Validate
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                placeholder='FAQs JSON: [{"question":"...","answer":"..."}]'
                value={formData.faqs}
                onChange={(event) => setFormData((prev) => ({ ...prev, faqs: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {jsonErrors.faqs && (
                <p className="mt-2 text-xs text-red-600">{jsonErrors.faqs}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className="mt-6 text-sm font-semibold text-teal-700"
        >
          {advancedOpen ? "Hide SEO settings" : "Show SEO settings"}
        </button>

        {advancedOpen && (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <Input
              placeholder="Meta title"
              value={formData.meta_title}
              onChange={(event) => setFormData((prev) => ({ ...prev, meta_title: event.target.value }))}
            />
            <Input
              placeholder="Meta description"
              value={formData.meta_description}
              onChange={(event) => setFormData((prev) => ({ ...prev, meta_description: event.target.value }))}
            />
            <textarea
              rows={4}
              placeholder='Meta keywords JSON: ["nepal", "visa"]'
              value={formData.meta_keywords}
              onChange={(event) => setFormData((prev) => ({ ...prev, meta_keywords: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 md:col-span-2"
            />
            <div className="md:col-span-2 flex items-center justify-between text-xs text-slate-500">
              <span>Meta keywords</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      meta_keywords: JSON.stringify(["nepal travel", "visa", "permits"], null, 2),
                    }))
                  }
                  className="text-teal-700"
                >
                  Insert sample
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const value = parseJsonField(formData.meta_keywords, null);
                    setJsonErrors((prev) => ({
                      ...prev,
                      meta_keywords: Array.isArray(value) ? "" : "Meta keywords must be a JSON array.",
                    }));
                  }}
                  className="text-slate-500"
                >
                  Validate
                </button>
              </div>
            </div>
            {jsonErrors.meta_keywords && (
              <p className="text-xs text-red-600 md:col-span-2">{jsonErrors.meta_keywords}</p>
            )}
            <Input
              placeholder="Open Graph image URL"
              value={formData.og_image_url}
              onChange={(event) => setFormData((prev) => ({ ...prev, og_image_url: event.target.value }))}
            />
            <Input
              placeholder="Twitter image URL"
              value={formData.twitter_image_url}
              onChange={(event) => setFormData((prev) => ({ ...prev, twitter_image_url: event.target.value }))}
            />
            <Input
              type="date"
              placeholder="Last reviewed"
              value={formData.last_reviewed || ""}
              onChange={(event) => setFormData((prev) => ({ ...prev, last_reviewed: event.target.value }))}
            />
            <Input
              type="number"
              placeholder="Order"
              value={formData.order}
              onChange={(event) => setFormData((prev) => ({ ...prev, order: event.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, is_published: event.target.checked }))
                }
              />
              Published
            </label>
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                SEO preview
              </p>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm text-emerald-700 font-semibold">
                  {formData.meta_title || formData.title || "Untitled Travel Info"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  /travel-info/{formData.slug || "your-slug"}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  {formData.meta_description ||
                    formData.summary ||
                    "Write a concise meta description that highlights the key value."}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TravelInfoAdminPage;
