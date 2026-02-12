import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  MoreVertical,
  FileJson,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Layers,
  ImageIcon,
} from "lucide-react";
import BlogImageUpload from "../gallery/BlogImageUpload";
import Dropdown from "../components/ui/Dropdown";
import Badge from "../components/ui/Badge";
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  getAdminBlogPosts,
  importBlogPosts,
  updateAdminBlogPost,
} from "../components/api/admin.api";
import UploadCard from "../treks/model/UploadCard";
import BlogUploadResults from "../components/blog/BlogUploadResults";
import BlogUploadInstructions from "../components/blog/BlogUploadInstructions";

import {
  validateBlogFile,
  readBlogFileAsText,
  parseBlogJSON
} from "../components/utils/blogFileValidation";
import { downloadBlogTemplate } from "../components/utils/blogTempleteGenerator";
const statusLabel = (value) => {
  const normalized = (value || "").toLowerCase();
  if (normalized === "published") return "Published";
  if (normalized === "draft") return "Draft";
  if (normalized === "scheduled") return "Scheduled";
  if (normalized === "archived") return "Archived";
  return value || "Unknown";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 140);

const stringifyField = (value) => {
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return "";
  }
};

const parseJsonField = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const validateJsonFields = (fields) => {
  for (const field of fields) {
    if (!field.value) continue;
    try {
      JSON.parse(field.value);
    } catch (error) {
      return `Invalid JSON in ${field.label}.`;
    }
  }
  return "";
};

const emptyForm = {
  slug: "",
  title: "",
  subtitle: "",
  status: "draft",
  type: "blog",
  contentType: "article",
  language: "en",
  categorySlug: "",
  regionSlug: "",
  authorSlug: "",
  publishDate: "",
  metaTitle: "",
  metaDescription: "",
  description: "",
  excerpt: "",
  difficulty: "Moderate",
  canonicalUrl: "",
  image: "",
  imageFile: null,
  featuredImageFile: null,
  views: 0,
  likes: 0,
  shares: 0,
  isFeatured: false,
  allowComments: true,
  isLiked: false,
  isBookmarked: false,
  featuredImageJson: "",
  imagesJson: "",
  taxonomiesJson: "",
  contentSettingsJson: "",
  tocJson: "",
  contentJson: "",
  ctaJson: "",
  linksJson: "",
  relatedPostsJson: "",
  seoJson: "",
  schemaJson: "",
  socialJson: "",
  editorialJson: "",
};

const BlogPage = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create");
  const [formData, setFormData] = useState({ ...emptyForm });
  const [activePost, setActivePost] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [viewJson, setViewJson] = useState(false);

  const pageSize = 10;

  // Simple toast helper (displays via error banner or can be extended)
  const showToast = (message, type = "info") => {
    if (type === "error") {
      setError(message);
    } else if (type === "success") {
      setError(""); // clear errors on success
      // Could integrate with a proper toast library here
      console.log(`✅ ${message}`);
    } else {
      console.log(`ℹ️ ${message}`);
    }
  };

  const loadPosts = async (targetPage = page) => {
    setLoading(true);
    setError("");

    const params = {
      page: targetPage,
    };
    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;
    if (languageFilter !== "all") params.language = languageFilter;
    if (categoryFilter !== "all") params.category = categoryFilter;

    try {
      const data = await getAdminBlogPosts(params);
      const rows = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      setPosts(rows);
      setTotalCount(data?.count ?? rows.length);
      setPage(targetPage);
    } catch (err) {
      setError(err?.message || "Failed to load blog posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  const categories = useMemo(() => {
    const values = new Set();
    posts.forEach((post) => {
      const label = post.category?.name || post.categorySlug || "";
      if (label) values.add(label);
    });
    return ["all", ...Array.from(values)];
  }, [posts]);

  const languages = useMemo(() => {
    const values = new Set();
    posts.forEach((post) => {
      if (post.language) values.add(post.language);
    });
    return ["all", ...Array.from(values)];
  }, [posts]);

  const statusCounts = useMemo(() => {
    const counts = { published: 0, draft: 0, scheduled: 0, archived: 0 };
    posts.forEach((post) => {
      const key = (post.status || "").toLowerCase();
      if (counts[key] !== undefined) counts[key] += 1;
    });
    return counts;
  }, [posts]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleDelete = async (post) => {
    if (!post?.slug) return;
    const ok = window.confirm(`Delete "${post.title || post.slug}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteAdminBlogPost(post.slug, post.language ? { language: post.language } : {});
      await loadPosts(page);
    } catch (err) {
      setError(err?.message || "Failed to delete blog post.");
    }
  };

  const handleQuickStatus = async (post, nextStatus) => {
    if (!post?.slug) return;
    try {
      await updateAdminBlogPost(post.slug, { status: nextStatus }, post.language ? { language: post.language } : {});
      await loadPosts(page);
    } catch (err) {
      setError(err?.message || "Failed to update status.");
    }
  };

  const handleCopyJson = async (payload) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    } catch (err) {
      setError("Failed to copy JSON.");
    }
  };

  const handleBlogJsonUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ Use blog-specific validation
    const validation = validateBlogFile(file, "json");
    if (!validation.valid) {
      setError(validation.error);
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setUploadResults([]);

    try {
      // ✅ Use blog-specific file reader
      const text = await readBlogFileAsText(file);

      // ✅ Use blog-specific JSON parser
      const parsed = parseBlogJSON(text);

      if (!parsed.success) {
        setError(`Invalid JSON format: ${parsed.error}`);
        event.target.value = "";
        setUploading(false);
        return;
      }

      console.log("🔍 Detected format:", parsed.importType);
      console.log("📦 Normalized payload:", parsed.data);

      // ✅ Send normalized payload to backend
      const response = await importBlogPosts(parsed.data);

      const created = response?.created || 0;
      const updated = response?.updated || 0;
      const errors = response?.errors || [];

      const results = [];
      if (created || updated) {
        results.push({
          post: "Blog import summary",
          success: true,
          message: `Created: ${created}, Updated: ${updated}`,
        });
      }

      errors.forEach((err, index) => {
        results.push({
          post: err?.slug || (typeof err?.index === "number" ? `Post ${err.index + 1}` : `Post ${index + 1}`),
          success: false,
          message: err?.detail || err?.message || "Import failed",
        });
      });

      if (!results.length) {
        results.push({
          post: "Blog import",
          success: response?.ok === true,
          message: response?.ok ? "Import completed" : "Import failed",
        });
      }

      setUploadResults(results);
      await loadPosts(1);
    } catch (err) {
      console.error("❌ Blog import error:", err);
      setError(err?.message || "Failed to import blog posts.");
      setUploadResults([
        { post: "Blog import", success: false, message: err?.message || "Import failed" },
      ]);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };


  const handleDownloadTemplate = () => {
    const result = downloadBlogTemplate("json");
    if (!result.success) {
      setError(result.error || "Failed to download template.");
    }
  };

  const handleClearUploadResults = () => {
    setUploadResults([]);
  };

  const openCreate = () => {
    setEditorMode("create");
    setActivePost(null);
    setFormData({ ...emptyForm });
    setAdvancedOpen(false);
    setViewJson(false);
    setEditorOpen(true);
  };

  const openEdit = (post) => {
    setEditorMode("edit");
    setActivePost(post);
    setFormData({
      slug: post.slug || "",
      title: post.title || "",
      subtitle: post.subtitle || "",
      status: post.status || "draft",
      type: post.type || "blog",
      contentType: post.contentType || post.content_type || "article",
      language: post.language || "en",
      categorySlug: post.categorySlug || post.category?.slug || "",
      regionSlug: post.regionSlug || post.region?.slug || "",
      authorSlug: post.authorSlug || post.author?.slug || "",
      publishDate: post.publishDate || "",
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      description: post.description || "",
      excerpt: post.excerpt || "",
      difficulty: post.difficulty || "Moderate",
      canonicalUrl: post.canonicalUrl || "",
      image: post.image || "",
      imageFile: null,
      featuredImageFile: null,
      views: post.views ?? post.engagement?.views ?? 0,
      likes: post.likes ?? post.engagement?.likes ?? 0,
      shares: post.shares ?? post.engagement?.shares ?? 0,
      isFeatured: post.isFeatured ?? post.flags?.isFeatured ?? false,
      allowComments: post.allowComments ?? post.flags?.allowComments ?? true,
      isLiked: post.isLiked ?? post.flags?.isLiked ?? false,
      isBookmarked: post.isBookmarked ?? post.flags?.isBookmarked ?? false,
      featuredImageJson: stringifyField(post.featuredImage),
      imagesJson: stringifyField(post.images),
      taxonomiesJson: stringifyField(post.taxonomies),
      contentSettingsJson: stringifyField(post.contentSettings),
      tocJson: stringifyField(post.toc),
      contentJson: stringifyField(post.content),
      ctaJson: stringifyField(post.cta),
      linksJson: stringifyField(post.links),
      relatedPostsJson: stringifyField(post.relatedPosts),
      seoJson: stringifyField(post.seo),
      schemaJson: stringifyField(post.schema),
      socialJson: stringifyField(post.social),
      editorialJson: stringifyField(post.editorial),
    });
    setAdvancedOpen(false);
    setViewJson(false);
    setEditorOpen(true);
  };

  const openView = (post) => {
    setEditorMode("view");
    setActivePost(post);
    setViewJson(false);
    setEditorOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => {
    const payload = {
      slug: formData.slug,
      title: formData.title,
      subtitle: formData.subtitle,
      status: formData.status,
      type: formData.type,
      contentType: formData.contentType,
      language: formData.language,
      categorySlug: formData.categorySlug,
      regionSlug: formData.regionSlug,
      authorSlug: formData.authorSlug,
      publishDate: formData.publishDate || undefined,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      description: formData.description,
      excerpt: formData.excerpt,
      difficulty: formData.difficulty,
      canonicalUrl: formData.canonicalUrl,
      image: formData.image,
      views: Number(formData.views) || 0,
      likes: Number(formData.likes) || 0,
      shares: Number(formData.shares) || 0,
      isFeatured: Boolean(formData.isFeatured),
      allowComments: Boolean(formData.allowComments),
      isLiked: Boolean(formData.isLiked),
      isBookmarked: Boolean(formData.isBookmarked),
    };

    const featuredImage = parseJsonField(formData.featuredImageJson, undefined);
    if (featuredImage !== undefined) payload.featuredImage = featuredImage;
    const images = parseJsonField(formData.imagesJson, undefined);
    if (images !== undefined) payload.images = images;
    const taxonomies = parseJsonField(formData.taxonomiesJson, undefined);
    if (taxonomies !== undefined) payload.taxonomies = taxonomies;
    const contentSettings = parseJsonField(formData.contentSettingsJson, undefined);
    if (contentSettings !== undefined) payload.contentSettings = contentSettings;
    const toc = parseJsonField(formData.tocJson, undefined);
    if (toc !== undefined) payload.toc = toc;
    const content = parseJsonField(formData.contentJson, undefined);
    if (content !== undefined) payload.content = content;
    const cta = parseJsonField(formData.ctaJson, undefined);
    if (cta !== undefined) payload.cta = cta;
    const links = parseJsonField(formData.linksJson, undefined);
    if (links !== undefined) payload.links = links;
    const relatedPosts = parseJsonField(formData.relatedPostsJson, undefined);
    if (relatedPosts !== undefined) payload.relatedPosts = relatedPosts;
    const seo = parseJsonField(formData.seoJson, undefined);
    if (seo !== undefined) payload.seo = seo;
    const schema = parseJsonField(formData.schemaJson, undefined);
    if (schema !== undefined) payload.schema = schema;
    const social = parseJsonField(formData.socialJson, undefined);
    if (social !== undefined) payload.social = social;
    const editorial = parseJsonField(formData.editorialJson, undefined);
    if (editorial !== undefined) payload.editorial = editorial;

    const hasFiles = Boolean(formData.imageFile || formData.featuredImageFile);

    if (!hasFiles) {
      return { payload, isForm: false };
    }

    const form = new FormData();
    const appendField = (key, value) => {
      if (value === undefined || value === null || value === "") return;
      if (typeof value === "object" && !(value instanceof File)) {
        form.append(key, JSON.stringify(value));
        return;
      }
      form.append(key, value);
    };

    Object.entries(payload).forEach(([key, value]) => {
      appendField(key, value);
    });

    if (formData.imageFile) {
      form.append("imageFile", formData.imageFile);
    }
    if (formData.featuredImageFile) {
      form.append("featuredImageFile", formData.featuredImageFile);
    }

    return { payload: form, isForm: true };
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.title) {
      setError("Slug and Title are required.");
      return;
    }

    try {
      const jsonError = validateJsonFields([
        { label: "Featured image", value: formData.featuredImageJson },
        { label: "Images", value: formData.imagesJson },
        { label: "Taxonomies", value: formData.taxonomiesJson },
        { label: "Content settings", value: formData.contentSettingsJson },
        { label: "TOC", value: formData.tocJson },
        { label: "Content", value: formData.contentJson },
        { label: "CTA", value: formData.ctaJson },
        { label: "Links", value: formData.linksJson },
        { label: "Related posts", value: formData.relatedPostsJson },
        { label: "SEO", value: formData.seoJson },
        { label: "Schema", value: formData.schemaJson },
        { label: "Social", value: formData.socialJson },
        { label: "Editorial", value: formData.editorialJson },
      ]);
      if (jsonError) {
        setError(jsonError);
        return;
      }

      const { payload } = buildPayload();
      if (editorMode === "create") {
        await createAdminBlogPost(payload);
      } else if (editorMode === "edit" && activePost) {
        await updateAdminBlogPost(
          activePost.slug,
          payload,
          activePost.language ? { language: activePost.language } : {}
        );
      }
      setEditorOpen(false);
      await loadPosts(page);
    } catch (err) {
      setError(err?.message || "Failed to save blog post.");
    }
  };

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.title || "Untitled"}</p>
          <p className="text-xs text-slate-500">{row.slug}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "published" ? "success" : "warning"}>
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <Badge variant="info">{row.category?.name || row.categorySlug || "Uncategorized"}</Badge>
      ),
    },
    { key: "author", header: "Author", render: (row) => row.author?.name || "-" },
    { key: "language", header: "Lang", render: (row) => row.language || "-" },
    { key: "date", header: "Published", render: (row) => formatDate(row.publishDate) },
    { key: "views", header: "Views", render: (row) => row.engagement?.views ?? row.views ?? 0 },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Dropdown
          trigger={
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical size={18} />
            </button>
          }
        >
          <button
            className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            onClick={() => openView(row)}
          >
            <Eye size={16} /> View
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            onClick={() => openEdit(row)}
          >
            <Edit size={16} /> Edit
          </button>
          {row.status === "published" ? (
            <button
              className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleQuickStatus(row, "draft")}
            >
              <Filter size={16} /> Set Draft
            </button>
          ) : (
            <button
              className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleQuickStatus(row, "published")}
            >
              <Filter size={16} /> Publish
            </button>
          )}
          <button
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
            onClick={() => handleDelete(row)}
          >
            <Trash2 size={16} /> Delete
          </button>
        </Dropdown>
      ),
    },
  ];

  const editorTitle =
    editorMode === "create" ? "Create Blog Post" : editorMode === "edit" ? "Edit Blog Post" : "Blog Details";

  const tabs = [
    { id: "posts", label: "Posts", icon: <Eye size={16} /> },
    { id: "import", label: "Import", icon: <FileJson size={16} /> },
    { id: "gallery", label: "Gallery", icon: <Layers size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Blog Admin Panel</h2>
          <p className="text-sm text-slate-500">Manage, publish, and maintain all blog content.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => loadPosts(page)}>
            Refresh
          </Button>
          <Button icon={<Plus size={18} />} onClick={openCreate}>
            New Story
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab.id
                  ? "text-violet-700 border-violet-600 bg-violet-50/50"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ===================== POSTS TAB ===================== */}
      {activeTab === "posts" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card title="Total">
              <p className="text-xs text-slate-500">All posts (filtered)</p>
              <div className="text-2xl font-semibold text-slate-900 mt-2">{totalCount}</div>
            </Card>
            <Card title="Published">
              <p className="text-xs text-slate-500">Visible on site</p>
              <div className="text-2xl font-semibold text-slate-900 mt-2">{statusCounts.published}</div>
            </Card>
            <Card title="Drafts">
              <p className="text-xs text-slate-500">Needs review</p>
              <div className="text-2xl font-semibold text-slate-900 mt-2">{statusCounts.draft}</div>
            </Card>
            <Card title="Scheduled">
              <p className="text-xs text-slate-500">Future publish</p>
              <div className="text-2xl font-semibold text-slate-900 mt-2">{statusCounts.scheduled}</div>
            </Card>
          </div>

          <Card
            title={`Blog Stories (${totalCount})`}
            actions={
              <div className="flex gap-2">
                <Button variant="secondary" icon={<Filter size={18} />}>
                  Filters
                </Button>
                <Button variant="secondary" icon={<Download size={18} />}>
                  Export
                </Button>
              </div>
            }
          >
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
            )}

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
              <Input
                placeholder="Search title, slug, author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search size={16} />}
              />
              <select
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
              <select
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === "all" ? "All languages" : lang}
                  </option>
                ))}
              </select>
              <select
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All categories" : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Button variant="secondary" onClick={() => loadPosts(1)}>
                Apply Filters
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setLanguageFilter("all");
                  setCategoryFilter("all");
                  loadPosts(1);
                }}
              >
                Reset
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading && (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-6 text-sm text-slate-500">
                        Loading blog posts...
                      </td>
                    </tr>
                  )}
                  {!loading && posts.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-6 text-sm text-slate-500">
                        No blog posts found.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    posts.map((row, rowIdx) => (
                      <tr key={row.id || rowIdx} className="hover:bg-slate-50 transition-colors">
                        {columns.map((col, colIdx) => (
                          <td key={colIdx} className="px-6 py-4 text-sm text-slate-900">
                            {col.render ? col.render(row) : row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => loadPosts(Math.max(1, page - 1))}
                  className={page <= 1 ? "opacity-50 pointer-events-none" : ""}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => loadPosts(Math.min(totalPages, page + 1))}
                  className={page >= totalPages ? "opacity-50 pointer-events-none" : ""}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ===================== IMPORT TAB ===================== */}
      {activeTab === "import" && (
        <Card title="Bulk Import Blog Posts">
          <div className="space-y-6">
            <UploadCard
              title="Upload JSON File"
              description="Upload a JSON file with full blog import structure"
              Icon={FileJson}
              iconColor="text-blue-600"
              buttonText={uploading ? "Uploading..." : "Choose JSON File"}
              buttonColor="bg-blue-600"
              onUpload={handleBlogJsonUpload}
              onDownloadTemplate={handleDownloadTemplate}
              accept=".json"
              disabled={uploading}
              inputId="blog-json-upload"
            />

            {uploading && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm text-gray-700">Uploading blog posts...</p>
              </div>
            )}

            {uploadResults.length > 0 && !uploading && (
              <BlogUploadResults results={uploadResults} onClear={handleClearUploadResults} onViewList={() => loadPosts(1)} />
            )}

            <BlogUploadInstructions />
          </div>
        </Card>
      )}

      {/* ===================== GALLERY TAB ===================== */}
      {activeTab === "gallery" && (
        <BlogImageUpload
          showToast={showToast}
        />
      )}

      <Modal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editorTitle}
        footer={
          editorMode !== "view" && (
            <>
              <Button variant="secondary" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          )
        }
      >
        {editorMode === "view" && activePost && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">{activePost.title}</h4>
                <p className="text-sm text-slate-500">Slug: {activePost.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                {activePost.canonicalUrl && (
                  <a
                    className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline"
                    href={activePost.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open <ExternalLink size={14} />
                  </a>
                )}
                <Badge variant={activePost.status === "published" ? "success" : "warning"}>
                  {statusLabel(activePost.status)}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card title="Summary">
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Category: {activePost.category?.name || activePost.categorySlug || "-"}</p>
                  <p>Author: {activePost.author?.name || "-"}</p>
                  <p>Language: {activePost.language || "-"}</p>
                  <p>Published: {formatDate(activePost.publishDate)}</p>
                  <p>Views: {activePost.engagement?.views ?? activePost.views ?? 0}</p>
                </div>
              </Card>
              <Card title="Meta">
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Meta title: {activePost.metaTitle || "-"}</p>
                  <p>Meta description: {activePost.metaDescription || "-"}</p>
                  <p>Canonical URL: {activePost.canonicalUrl || "-"}</p>
                </div>
              </Card>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" icon={<Copy size={16} />} onClick={() => handleCopyJson(activePost)}>
                Copy JSON
              </Button>
              <Button variant="ghost" onClick={() => setViewJson((prev) => !prev)}>
                {viewJson ? "Hide" : "Show"} Raw JSON
              </Button>
            </div>

            {viewJson && (
              <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 overflow-x-auto">
                {JSON.stringify(activePost, null, 2)}
              </pre>
            )}
          </div>
        )}

        {editorMode !== "view" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Core Details</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFormChange("title", value);
                    if (!formData.slug) {
                      handleFormChange("slug", slugify(value));
                    }
                  }}
                />
                <Input
                  placeholder="Slug"
                  value={formData.slug}
                  onChange={(e) => handleFormChange("slug", e.target.value)}
                />
                <Input
                  placeholder="Subtitle"
                  value={formData.subtitle}
                  onChange={(e) => handleFormChange("subtitle", e.target.value)}
                />
                <Input
                  placeholder="Language (e.g. en)"
                  value={formData.language}
                  onChange={(e) => handleFormChange("language", e.target.value)}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Publishing</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <select
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg"
                  value={formData.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg"
                  value={formData.type}
                  onChange={(e) => handleFormChange("type", e.target.value)}
                >
                  <option value="blog">Blog</option>
                  <option value="page">Page</option>
                  <option value="vlog">Vlog</option>
                </select>
                <select
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg"
                  value={formData.contentType}
                  onChange={(e) => handleFormChange("contentType", e.target.value)}
                >
                  <option value="article">Article</option>
                  <option value="guide">Guide</option>
                  <option value="news">News</option>
                </select>
              </div>
              <div className="mt-3">
                <Input
                  placeholder="Publish date (ISO 8601)"
                  value={formData.publishDate}
                  onChange={(e) => handleFormChange("publishDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Classification</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="Category slug"
                  value={formData.categorySlug}
                  onChange={(e) => handleFormChange("categorySlug", e.target.value)}
                />
                <Input
                  placeholder="Region slug"
                  value={formData.regionSlug}
                  onChange={(e) => handleFormChange("regionSlug", e.target.value)}
                />
                <Input
                  placeholder="Author slug"
                  value={formData.authorSlug}
                  onChange={(e) => handleFormChange("authorSlug", e.target.value)}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">SEO + Summary</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Meta title"
                  value={formData.metaTitle}
                  onChange={(e) => handleFormChange("metaTitle", e.target.value)}
                />
                <Input
                  placeholder="Meta description"
                  value={formData.metaDescription}
                  onChange={(e) => handleFormChange("metaDescription", e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-3">
                <textarea
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Short description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleFormChange("excerpt", e.target.value)}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Media + URLs</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Hero image URL"
                  value={formData.image}
                  onChange={(e) => handleFormChange("image", e.target.value)}
                />
                <Input
                  placeholder="Canonical URL"
                  value={formData.canonicalUrl}
                  onChange={(e) => handleFormChange("canonicalUrl", e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">Hero image file</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFormChange("imageFile", e.target.files?.[0] || null)}
                  />
                  {formData.imageFile && (
                    <p className="text-xs text-slate-500">Selected: {formData.imageFile.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">Featured image file</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFormChange("featuredImageFile", e.target.files?.[0] || null)}
                  />
                  {formData.featuredImageFile && (
                    <p className="text-xs text-slate-500">Selected: {formData.featuredImageFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Engagement</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="Views"
                  type="number"
                  value={formData.views}
                  onChange={(e) => handleFormChange("views", e.target.value)}
                />
                <Input
                  placeholder="Likes"
                  type="number"
                  value={formData.likes}
                  onChange={(e) => handleFormChange("likes", e.target.value)}
                />
                <Input
                  placeholder="Shares"
                  type="number"
                  value={formData.shares}
                  onChange={(e) => handleFormChange("shares", e.target.value)}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Flags</h4>
              <div className="grid gap-4 md:grid-cols-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => handleFormChange("isFeatured", e.target.checked)}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.allowComments}
                    onChange={(e) => handleFormChange("allowComments", e.target.checked)}
                  />
                  Allow comments
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isLiked}
                    onChange={(e) => handleFormChange("isLiked", e.target.checked)}
                  />
                  Liked
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isBookmarked}
                    onChange={(e) => handleFormChange("isBookmarked", e.target.checked)}
                  />
                  Bookmarked
                </label>
              </div>
            </div>

            <button
              type="button"
              className="text-sm text-teal-700 font-medium"
              onClick={() => setAdvancedOpen((prev) => !prev)}
            >
              {advancedOpen ? "Hide" : "Show"} advanced JSON fields
            </button>

            {advancedOpen && (
              <div className="space-y-3">
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Featured image JSON"
                  value={formData.featuredImageJson}
                  onChange={(e) => handleFormChange("featuredImageJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Images JSON"
                  value={formData.imagesJson}
                  onChange={(e) => handleFormChange("imagesJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Taxonomies JSON"
                  value={formData.taxonomiesJson}
                  onChange={(e) => handleFormChange("taxonomiesJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Content settings JSON"
                  value={formData.contentSettingsJson}
                  onChange={(e) => handleFormChange("contentSettingsJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="TOC JSON"
                  value={formData.tocJson}
                  onChange={(e) => handleFormChange("tocJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Content JSON"
                  value={formData.contentJson}
                  onChange={(e) => handleFormChange("contentJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="CTA JSON"
                  value={formData.ctaJson}
                  onChange={(e) => handleFormChange("ctaJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Links JSON"
                  value={formData.linksJson}
                  onChange={(e) => handleFormChange("linksJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Related posts JSON"
                  value={formData.relatedPostsJson}
                  onChange={(e) => handleFormChange("relatedPostsJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="SEO JSON"
                  value={formData.seoJson}
                  onChange={(e) => handleFormChange("seoJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Schema JSON"
                  value={formData.schemaJson}
                  onChange={(e) => handleFormChange("schemaJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Social JSON"
                  value={formData.socialJson}
                  onChange={(e) => handleFormChange("socialJson", e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-lg"
                  rows={3}
                  placeholder="Editorial JSON"
                  value={formData.editorialJson}
                  onChange={(e) => handleFormChange("editorialJson", e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BlogPage;
