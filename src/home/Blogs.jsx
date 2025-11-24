import React, { useState, useMemo } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Plus, Edit, Trash2, Eye, Filter, Download, MoreVertical } from "lucide-react";
import Dropdown from "../components/ui/Dropdown";
import Badge from "../components/ui/badge";

// Sample blog post data for admin panel
const mockAdminPosts = [
  {
    id: 1,
    title: "Langtang Valley: Hidden Gem",
    author: "Priya Singh",
    category: "Trekking",
    status: "Published",
    date: "2025-11-12",
    views: 122,
    likes: 24,
  },
  {
    id: 2,
    title: "Gear Guide for Annapurna",
    author: "Ajay Shrestha",
    category: "Gear",
    status: "Draft",
    date: "2025-11-10",
    views: 89,
    likes: 15,
  },
  {
    id: 3,
    title: "Wildlife Encounters on Everest",
    author: "Sunil Karki",
    category: "Wildlife",
    status: "Published",
    date: "2025-11-05",
    views: 100,
    likes: 33,
  },
  // ...add more as needed
];

const columns = [
  { key: "title", header: "Title", render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.title}</p>
        <p className="text-xs text-slate-500">By {row.author}</p>
      </div>
    )
  },
  { key: "category", header: "Category", render: (row) => (
      <Badge variant="info">{row.category}</Badge>
    )
  },
  { key: "status", header: "Status", render: (row) => (
      <Badge variant={row.status === "Published" ? "success" : "warning"}>{row.status}</Badge>
    )
  },
  { key: "date", header: "Date" },
  { key: "views", header: "Views" },
  { key: "likes", header: "Likes" },
  { key: "actions", header: "Actions", render: () => (
      <Dropdown trigger={
        <button className="text-slate-400 hover:text-slate-600">
          <MoreVertical size={18} />
        </button>
      }>
        <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          <Eye size={16} /> View
        </button>
        <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          <Edit size={16} /> Edit
        </button>
        <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
          <Trash2 size={16} /> Delete
        </button>
      </Dropdown>
    )
  }
];

const BlogPage = () => {
  const [posts, setPosts] = useState(mockAdminPosts);
  const [modalOpen, setModalOpen] = useState(false);

  // For category filtering and future expansion
  const [filter, setFilter] = useState("all");

  const visiblePosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((post) => post.category === filter);
  }, [filter, posts]);

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Blog Stories Admin</h2>
        <Button icon={<Plus size={18} />} onClick={() => setModalOpen(true)}>
          New Story
        </Button>
      </div>

      <Card title="Blog Stories" actions={
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Filter size={18} />}>Filter</Button>
          <Button variant="secondary" icon={<Download size={18} />}>Export</Button>
        </div>
      }>
        <div className="mb-4 flex gap-2">
          {/* Category filter examples */}
          <Button variant={filter === "all" ? "primary" : "secondary"} onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "Trekking" ? "primary" : "secondary"} onClick={() => setFilter("Trekking")}>Trekking</Button>
          <Button variant={filter === "Gear" ? "primary" : "secondary"} onClick={() => setFilter("Gear")}>Gear</Button>
          <Button variant={filter === "Wildlife" ? "primary" : "secondary"} onClick={() => setFilter("Wildlife")}>Wildlife</Button>
        </div>
        {/* Blog table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visiblePosts.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
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
      </Card>
      {/* You can utilize a modal for adding/editing new blog posts */}
      {/* Modal example (uses Button, can wire form logic) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add New Story</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 size={20} />
              </button>
            </div>
            <div className="px-6 py-4">
              {/* Example form fields */}
              <input type="text" placeholder="Title" className="w-full mb-4 px-4 py-2 border rounded" />
              <input type="text" placeholder="Author" className="w-full mb-4 px-4 py-2 border rounded" />
              <select className="w-full mb-4 px-4 py-2 border rounded">
                <option value="">Select Category</option>
                <option value="Trekking">Trekking</option>
                <option value="Gear">Gear</option>
                <option value="Wildlife">Wildlife</option>
              </select>
              <Button variant="primary">Save Story</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
