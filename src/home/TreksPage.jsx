import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Download,
  MoreVertical,
  UploadCloud,
  FileJson,
  Grid,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Toast Notification Component
const Toast = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const id = setTimeout(onClose, 3000);
      return () => clearTimeout(id);
    }
  }, [show, onClose]);

  if (!show) return null;
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50">
      {message}
    </div>
  );
};

const TreksPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadResults, setUploadResults] = useState([]);
  const [treks, setTreks] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "" });

  // Optionally fetch treks on mount
  useEffect(() => {
    // Fetch existing treks from API here if needed
  }, []);

  // Payload builder with safe defaults and guards
  const buildTrekPayload = (trekData) => ({
    trek: {
      slug: trekData.slug || "",
      title: trekData.title || "",
      region: trekData.region || "everest",
      region_name: trekData.region_name || "Everest Region",
      duration: trekData.duration || "",
      trip_grade: trekData.trip_grade || "A",
      start_point: trekData.start_point || "Kathmandu",
      group_size: trekData.group_size || "25",
      max_altitude: trekData.max_altitude || "",
      activity: trekData.activity || "Trek",
      rating: trekData.rating || 5.0,
    },
    hero: {
      title: trekData.title || "",
      subtitle: trekData.subtitle || trekData.description || "",
      imageUrl: trekData.hero_image_url || "",
      season: trekData.season || "Spring",
      duration:
        typeof trekData.duration === "string"
          ? trekData.duration.replace(/\D/g, "")
          : "",
      difficulty: trekData.difficulty || "Moderate",
      location: trekData.location || trekData.region_name || "",
      cta_label: "Book This Trek",
      cta_link: "",
    },
    overview: {
      sections:
        trekData.overview_sections ||
        [
          {
            heading: `Trek Overview of ${trekData.title || ""}`,
            articles: {
              title: trekData.title || "",
              description: trekData.description || "",
            },
            bullets: [],
            order: 0,
          },
        ],
    },
    itinerary: trekData.itinerary || [],
    highlights: trekData.highlights || [],
    cost: {
      title: trekData.cost_title || "Cost Details",
      inclusions: trekData.inclusions || [],
      exclusions: trekData.exclusions || [],
    },
    gallery: trekData.gallery || [],
    booking_card: {
      base_price: trekData.base_price || "1000.00",
      original_price: trekData.original_price || "900.00",
      pricing_mode: "original_and_save",
      group_prices: trekData.group_prices || [],
    },
    additional_info: trekData.additional_info || [],
    similar: trekData.similar || [],
  });

  // Bulk Upload with progress and results tracking
  const handleBulkUpload = async (treksArray) => {
    setUploading(true);
    setUploadResults([]);
    setUploadProgress({ current: 0, total: treksArray.length });

    const results = [];
    const newTreks = [];

    for (let i = 0; i < treksArray.length; i++) {
      const trekData = treksArray[i];
      setUploadProgress({ current: i + 1, total: treksArray.length });

      try {
        const payload = buildTrekPayload(trekData);
        const response = await fetch("http://127.0.0.1:8000/api/treks/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json();
          results.push({
            trek: trekData.title || `Trek ${i + 1}`,
            success: false,
            message: errData.detail || "Unknown error",
          });
        } else {
          results.push({
            trek: trekData.title || `Trek ${i + 1}`,
            success: true,
          });
          newTreks.push({
            name: trekData.title || "Unknown",
            duration: trekData.duration || "-",
            difficulty: trekData.difficulty || "Moderate",
            price: trekData.base_price ? `$${trekData.base_price}` : "-",
            bookings: "0",
            status: "Active",
          });
        }
      } catch (err) {
        results.push({
          trek: trekData.title || `Trek ${i + 1}`,
          success: false,
          message: err.message,
        });
      }
    }

    setUploadResults(results);
    setUploading(false);
    setTreks((prev) => [...prev, ...newTreks]);
  };

  // JSON Upload Handler
  const handleJSONUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const treksArray = Array.isArray(parsed) ? parsed : [parsed];
        handleBulkUpload(treksArray).then(() => {
          setToast({ show: true, message: `File "${file.name}" uploaded successfully.` });
        });
      } catch (error) {
        alert("Invalid JSON file: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  // CSV Upload Handler
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim());
        const treksArray = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const trek = {};
          headers.forEach((header, index) => {
            trek[header] = values[index];
          });
          return trek;
        });
        handleBulkUpload(treksArray).then(() => {
          setToast({ show: true, message: `CSV file "${file.name}" uploaded successfully.` });
        });
      } catch (error) {
        alert("Invalid CSV file: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  // Template Download Helper
  const downloadTemplate = (format) => {
    const template = {
      slug: "everest-base-camp-trek",
      title: "Everest Base Camp Trek",
      region: "everest",
      region_name: "Everest Region",
      duration: "14 Days",
      trip_grade: "A",
      start_point: "Kathmandu",
      group_size: "25",
      max_altitude: "5500",
      activity: "Trek",
      rating: 5.0,
      difficulty: "Hard",
      description: "An amazing trek to Everest Base Camp...",
      subtitle: "The base of the God Sagarmatha will met you",
      season: "Spring",
      location: "Solukhumbu Everest",
      base_price: "1600.00",
      original_price: "1400.00",
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify([template], null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "trek-template.json";
      a.click();
    } else if (format === "csv") {
      const headers = Object.keys(template).join(",");
      const values = Object.values(template).join(",");
      const csv = `${headers}\n${values}`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "trek-template.csv";
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: "" })} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trek Management</h1>
          <p className="text-gray-600">Upload and manage your treks efficiently</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-3 font-medium ${
                activeTab === "list" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Trek List
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-3 font-medium ${
                activeTab === "upload" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Trek List */}
        {activeTab === "list" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search treks..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button
                onClick={() => setActiveTab("upload")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Treks
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trek Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {treks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No treks uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    treks.map((trek, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{trek.name}</div>
                            <div className="text-sm text-gray-500">{trek.duration}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              trek.difficulty === "Hard" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {trek.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{trek.price}</td>
                        <td className="px-6 py-4 text-gray-900">{trek.bookings}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{trek.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-gray-600 hover:text-gray-900">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bulk Upload */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            {/* Upload Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* JSON Upload */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <FileJson className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload JSON File</h3>
                  <p className="text-gray-600 text-sm mb-4">Upload a JSON file containing an array of trek objects</p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJSONUpload}
                    className="hidden"
                    id="json-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="json-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    Choose JSON File
                  </label>
                  <div className="mt-4">
                    <button
                      onClick={() => downloadTemplate("json")}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mx-auto"
                    >
                      <Download className="w-3 h-3" />
                      Download JSON Template
                    </button>
                  </div>
                </div>
              </div>

              {/* CSV Upload */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
                <div className="text-center">
                  <Grid className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                  <p className="text-gray-600 text-sm mb-4">Upload a CSV file with trek data in columns</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="csv-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    Choose CSV File
                  </label>
                  <div className="mt-4">
                    <button
                      onClick={() => downloadTemplate("csv")}
                      className="text-sm text-green-600 hover:underline flex items-center gap-1 mx-auto"
                    >
                      <Download className="w-3 h-3" />
                      Download CSV Template
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="font-medium">
                    Uploading treks... {uploadProgress.current} of {uploadProgress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Upload Results</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadResults.map((result, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        result.success ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${result.success ? "text-green-900" : "text-red-900"}`}>
                          {result.trek}
                        </p>
                        {!result.success && <p className="text-sm text-red-700 mt-1 break-words">{result.message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {uploadResults.filter((r) => r.success).length} successful,{" "}
                    {uploadResults.filter((r) => !r.success).length} failed
                  </div>
                  <button
                    onClick={() => setUploadResults([])}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Upload Instructions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Download the template file (JSON or CSV) to see the required format</li>
                    <li>• Fill in your trek data following the template structure</li>
                    <li>• Upload the file and wait for the process to complete</li>
                    <li>• Review the results and fix any errors if needed</li>
                    <li>• You can upload up to 50 treks at once</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreksPage;
