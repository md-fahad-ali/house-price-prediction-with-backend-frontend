"use client";

import { useState, useEffect, FormEvent } from "react";

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const furnishingOptions = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi-furnished", label: "Semi-furnished" },
  { value: "furnished", label: "Furnished" },
];

export default function Home() {
  /* ----------------------- state ----------------------- */
  const [apiBase, setApiBase] = useState<string>("");
  const [backendInput, setBackendInput] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [form, setForm] = useState({
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    stories: 0,
    mainroad: "yes",
    guestroom: "no",
    basement: "no",
    hotwaterheating: "no",
    airconditioning: "no",
    parking: 0,
    prefarea: "no",
    furnishingstatus: "unfurnished",
  });

  const [loading, setLoading] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------- effects ----------------------- */
  useEffect(() => {
    const stored = localStorage.getItem("apiBase");
    if (stored) {
      setApiBase(stored);
      setBackendInput(stored);
      setIsModalOpen(false);
    } else {
      setIsModalOpen(true);
    }
  }, []);

  /* ----------------------- handlers ----------------------- */
  const handleSaveBackend = () => {
    if (!backendInput.trim()) return;
    const trimmed = backendInput.trim();
    setApiBase(trimmed);
    localStorage.setItem("apiBase", trimmed);
    setIsModalOpen(false);
  };

  const numericFields = ["area", "bedrooms", "bathrooms", "stories", "parking"] as const;
  type NumericField = typeof numericFields[number];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name as NumericField) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPredictedPrice(null);
    setError(null);

    if (!apiBase) {
      setError("Please save a backend link first.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBase.replace(/\/$/, "")}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const data: unknown = await response.json();
      // assume API returns { price: number } or just number
      const price =
        typeof data === "number"
          ? data
          : (data as { price?: number; predicted_price?: number; result?: number })
              .price ??
            (data as { predicted_price?: number }).predicted_price ??
            (data as { result?: number }).result;
      if (price === undefined) throw new Error("Unexpected response from server");
      setPredictedPrice(price);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format field names
  const formatFieldName = (field: string) => {
    const fieldMap: { [key: string]: string } = {
      mainroad: "Main Road",
      guestroom: "Guest Room",
      basement: "Basement",
      hotwaterheating: "Hot Water Heating",
      airconditioning: "Air Conditioning",
      prefarea: "Preferred Area",
    };
    return fieldMap[field] || field;
  };

  /* ----------------------- ui ----------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            House Price Predictor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get accurate house price predictions using machine learning
          </p>
        </div>

        {/* Backend link summary / change button */}
        {apiBase && (
          <div className="w-full max-w-2xl mx-auto mb-8 bg-white dark:bg-zinc-800/60 rounded-xl p-4 flex items-center justify-between text-sm text-gray-700 dark:text-slate-300 shadow-sm border border-gray-100 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="truncate">API Connected: {apiBase}</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-4 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Change
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 flex flex-col gap-4 border border-gray-100 dark:border-zinc-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200">Enter Backend API Link</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect to your machine learning API endpoint
              </p>
              <input
                type="text"
                placeholder="https://xxxx.ngrok-free.app"
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-700 text-gray-800 dark:text-slate-100 placeholder:text-gray-400 transition-all"
                value={backendInput}
                onChange={(e) => setBackendInput(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBackend}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prediction form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-zinc-800/60 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200">House Details</h2>
            </div>

            {/* Numeric inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Property Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <span className="font-medium">Area (sq ft)</span>
                  <input
                    type="number"
                    name="area"
                    min="0"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-700 dark:text-white transition-all"
                    value={form.area}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <span className="font-medium">Bedrooms</span>
                  <input
                    type="number"
                    name="bedrooms"
                    min="0"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-700 dark:text-white transition-all"
                    value={form.bedrooms}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <span className="font-medium">Bathrooms</span>
                  <input
                    type="number"
                    name="bathrooms"
                    min="0"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-700 dark:text-white transition-all"
                    value={form.bathrooms}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <span className="font-medium">Stories</span>
                  <input
                    type="number"
                    name="stories"
                    min="0"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-700 dark:text-white transition-all"
                    value={form.stories}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <span className="font-medium">Parking Spaces</span>
                  <input
                    type="number"
                    name="parking"
                    min="0"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-700 dark:text-white transition-all"
                    value={form.parking}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </div>

            {/* Yes/No selects */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Features & Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "mainroad",
                  "guestroom",
                  "basement",
                  "hotwaterheating",
                  "airconditioning",
                  "prefarea",
                ].map((field) => (
                  <label key={field} className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <span className="font-medium">{formatFieldName(field)}</span>
                    <select
                      name={field}
                      value={form[field as keyof typeof form] as string}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-700 dark:text-white transition-all"
                    >
                      {yesNoOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            {/* Furnishing status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Furnishing
              </h3>
              <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Furnishing Status</span>
                <select
                  name="furnishingstatus"
                  value={form.furnishingstatus}
                  onChange={handleChange}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-700 dark:text-white transition-all"
                >
                  {furnishingOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Predicting...
                </div>
              ) : (
                "Predict Price"
              )}
            </button>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}
            
            {/* Results */}
            {predictedPrice !== null && !loading && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="text-center">
                  <p className="text-green-700 dark:text-green-400 font-medium mb-2">Predicted Price</p>
                  <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                    ৳ {predictedPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-2">
                    Based on the provided house specifications
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}