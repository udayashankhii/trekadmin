import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw, Upload } from "lucide-react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import {
  createAdminTravelStyle,
  deleteAdminTravelStyle,
  getAdminTravelStyle,
  getAdminTravelStyles,
  getAdminTravelStyleTours,
  importAdminTravelStyles,
  updateAdminTravelStyle,
} from "../api/admin.api";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  hero_image_url: "",
  icon: "",
  accent_color: "",
  metadata: "{}",
  is_published: true,
  order: 0,
};

const SAMPLE_STYLE_JSON = `{
  "styles": [
    {
      "name": "Heritage Walks",
      "slug": "heritage-walks",
      "description": "Cultural walks through historic cities.",
      "hero_image_url": "https://example.com/heritage-hero.jpg",
      "metadata": {
        "season": "All year",
        "pace": "Leisurely"
      },
      "is_published": true,
      "order": 2
    }
  ]
}`;

const stringifyField = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return "";
  }
};

const parseJsonField = (value, fallback = {}) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const TravelStylesAdminPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editorMode, setEditorMode] = useState("create");
  const [activeSlug, setActiveSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);
  const [toursModalOpen, setToursModalOpen] = useState(false);
  const [toursLoading, setToursLoading] = useState(false);
  const [styleTours, setStyleTours] = useState([]);
  const [styleTitle, setStyleTitle] = useState("");

  const loadStyles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminTravelStyles();
      const list = Array.isArray(data) ? data : data.results || [];
      setRows(list);
    } catch (err) {
      setError(err?.message || "Failed to load travel styles.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStyles();
  }, []);

  const handleImportFile = async (event) => {
    const file = event.target?.files?.[0];
    if (!file) return;
    setImportError("");
    setImportSummary(null);
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await importAdminTravelStyles(formData);
      setImportSummary(response);
      if ((response?.created || 0) + (response?.updated || 0) > 0) {
        loadStyles();
      }
    } catch (err) {
      setImportError(err?.message || "Import failed.");
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const openStyleTours = async (style) => {
    setToursModalOpen(true);
    setStyleTitle(style.name || style.slug);
    setToursLoading(true);
    setStyleTours([]);
    try {
      const data = await getAdminTravelStyleTours(style.slug);
      setStyleTours(Array.isArray(data) ? data : []);
    } catch (err) {
      setStyleTours([]);
      console.error("Failed to load style tours:", err);
    } finally {
      setToursLoading(false);
    }
  };

  const openEditor = (mode = "create") => {
    setEditorMode(mode);
    setFormData({ ...emptyForm });
    setActiveSlug("");
    setModalOpen(true);
    setError("");
  };

  const openEdit = async (slug) => {
    setEditorMode("edit");
    setModalOpen(true);
    setActiveSlug(slug);
    setIsSaving(false);
    try {
      const style = await getAdminTravelStyle(slug);
      setFormData({
        name: style.name || "",
        slug: style.slug || "",
        description: style.description || "",
        hero_image_url: style.hero_image_url || "",
        icon: style.icon || "",
        accent_color: style.accent_color || "",
        metadata: stringifyField(style.metadata || {}),
        is_published: Boolean(style.is_published),
        order: style.order ?? 0,
      });
    } catch (err) {
      setError(err?.message || "Unable to load style.");
      setModalOpen(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      description: formData.description,
      hero_image_url: formData.hero_image_url,
      icon: formData.icon,
      accent_color: formData.accent_color,
      metadata: parseJsonField(formData.metadata, {}),
      is_published: Boolean(formData.is_published),
      order: Number(formData.order) || 0,
    };

    try {
      if (editorMode === "edit" && activeSlug) {
        await updateAdminTravelStyle(activeSlug, payload);
      } else {
        await createAdminTravelStyle(payload);
      }
      setModalOpen(false);
      loadStyles();
    } catch (err) {
      setError(err?.message || "Failed to save travel style.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Delete this travel style?")) return;
    try {
      await deleteAdminTravelStyle(slug);
      loadStyles();
    } catch (err) {
      setError(err?.message || "Failed to delete travel style.");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter === "published" && !row.is_published) return false;
      if (statusFilter === "draft" && row.is_published) return false;
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        (row.name || "").toLowerCase().includes(term) ||
        (row.slug || "").toLowerCase().includes(term) ||
        (row.description || "").toLowerCase().includes(term)
      );
    });
  }, [rows, search, statusFilter]);

  const columns = [
    {
      header: "Name",
      render: (row) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500">{row.description}</div>
        </div>
      ),
    },
    { header: "Slug", key: "slug" },
    {
      header: "Status",
      render: (row) => (
        <Badge variant={row.is_published ? "success" : "warning"}>
          {row.is_published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    { header: "Order", key: "order" },
    {
      header: "Tours",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tours_preview?.length ? (
            row.tours_preview.map((relation) => (
              <span
                key={relation.id || relation.tour_slug}
                className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-slate-600"
              >
                {relation.tour_title || relation.tour_slug}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No tours yet</span>
          )}
        </div>
      ),
    },
    {
      header: "Updated",
      render: (row) => formatDate(row.updated_at),
    },
    {
      header: "Actions",
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              icon={<Upload size={16} />}
              onClick={() => openStyleTours(row)}
            >
              Tours
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Edit size={16} />}
              onClick={() => openEdit(row.slug)}
            >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={() => handleDelete(row.slug)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 min-w-[220px] items-center gap-2">
            <Search className="text-slate-400" size={16} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, slug, or description…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <Button
              variant="ghost"
              size="md"
              icon={<RefreshCw size={16} />}
              onClick={loadStyles}
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={<Upload size={16} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? "Importing…" : "Import JSON"}
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => openEditor("create")}
            >
              New Travel Style
            </Button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6">
        {importSummary && (
          <Card className="mb-4 bg-emerald-50 border-emerald-200">
            <div className="flex flex-col gap-2 text-sm text-emerald-900">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
                  Import summary
                </p>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Pulled from the latest bulk upload
                </span>
              </div>
              <p>
                Created: <strong>{importSummary.created ?? 0}</strong>{" "}
                · Updated: <strong>{importSummary.updated ?? 0}</strong>{" "}
                · Failed: <strong>{importSummary.failed ?? 0}</strong>
              </p>
              {importSummary.errors?.length > 0 && (
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="text-slate-500 font-semibold">Errors from backend</p>
                  {importSummary.errors.slice(0, 3).map((err, idx) => (
                    <p key={idx} className="leading-tight">
                      {err.slug ? `${err.slug} → ` : ""}{err.error ?? "Unknown error"}
                    </p>
                  ))}
                  {importSummary.errors.length > 3 && <p>…and {importSummary.errors.length - 3} more</p>}
                </div>
              )}
            </div>
          </Card>
        )}
        {importError && <p className="mb-3 text-sm text-red-600">{importError}</p>}
        <Card className="mb-4 border-slate-200 bg-white">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Import & seed guidance</p>
              <p className="text-sm text-slate-700">
                Drop a JSON file that matches the backend schema{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{"{ \"styles\": [...] }"}</code>,
                or paste the same payload in the CLI helper to normalize everything before uploading. Every style must expose
                a `slug`, `hero_image_url`, and optional `metadata` object so tours can link to it seamlessly.
              </p>
              <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                <li>Upload or POST a payload that is either a list or an object with `styles`.</li>
                <li>Include `name` + `slug` (the API derives the slug from the name if you skip it).</li>
                <li>Run `python3 manage.py seed_travel_styles` when you need the default Hiking + Sivapuri tour pair.</li>
                <li>After importing, attach tours by hitting the Tours admin (with `primary_style` + `travel_styles`).</li>
              </ol>
              {importSummary?.failed > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                  The backend reported {importSummary.failed} failure{importSummary.failed === 1 ? "" : "s"} – inspect the
                  error list above or check the console for full validation messages.
                </div>
              )}
            </div>
            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Seed + sync</p>
              <p className="text-slate-600 text-sm">
                CLI tip:
              </p>
              <pre className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 overflow-x-auto">
                python3 manage.py resync_travel_styles --file path/to/bundle.json
              </pre>
              <p className="text-xs text-slate-500">
                Repeat `--file` per bundle or omit `--file` to resync from existing tours.
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sample payload</p>
              <pre className="h-48 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 overflow-x-auto">
                {SAMPLE_STYLE_JSON}
              </pre>
            </div>
          </div>
        </Card>
          {loading ? (
            <p className="text-sm text-slate-500">Loading travel styles…</p>
          ) : (
            <Table columns={columns} data={filteredRows} />
          )}
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="hidden"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editorMode === "edit" ? "Update Travel Style" : "Create Travel Style"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save travel style"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Slug"
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
          />
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
            placeholder="Short description"
          />
          <Input
            placeholder="Hero image URL"
            value={formData.hero_image_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, hero_image_url: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Icon (optional)"
              value={formData.icon}
              onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
            />
            <Input
              placeholder="Accent color"
              value={formData.accent_color}
              onChange={(e) => setFormData((prev) => ({ ...prev, accent_color: e.target.value }))}
            />
          </div>
          <textarea
            rows={4}
            value={formData.metadata}
            onChange={(e) => setFormData((prev) => ({ ...prev, metadata: e.target.value }))}
            className="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
            placeholder='Metadata JSON (optional), e.g. {"highlight":"culture"}'
          />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
              />
              <span>Published</span>
            </label>
            <Input
              type="number"
              placeholder="Display order"
              value={formData.order}
              onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
            />
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={toursModalOpen}
        onClose={() => setToursModalOpen(false)}
        title={`Tours for ${styleTitle}`}
        footer={
          <Button variant="ghost" onClick={() => setToursModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3">
          {toursLoading ? (
            <p className="text-sm text-slate-500">Loading tours…</p>
          ) : styleTours.length === 0 ? (
            <p className="text-sm text-slate-500">No tours attached to this style yet.</p>
          ) : (
            <div className="space-y-3">
              {styleTours.map((relation) => (
                <Card
                  key={relation.id || relation.tour_slug}
                  className="rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{relation.tour_title}</p>
                      <p className="text-xs text-slate-500">{relation.tour_slug}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={relation.tour_is_published ? "text-emerald-600" : "text-amber-700"}
                      >
                        {relation.tour_is_published ? "Published" : "Draft"}
                      </span>
                      <span className="text-slate-500">Order {relation.order}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TravelStylesAdminPage;
