"use client";
import { useState } from "react";

// WHY: pure function = easy to read/test; returns an object of error messages.
const validate = (f) => {
  const e = {};
  if (f.title.trim().length < 3) e.title = "Title needs at least 3 characters";
  if (!f.category) e.category = "Category is required";
  if (!(Number(f.price) > 0)) e.price = "Price must be more than 0";
  if (f.stock === "" || !Number.isInteger(Number(f.stock)) || Number(f.stock) < 0) e.stock = "Stock must be a whole number, 0 or more";
  return e;
};

export default function ProductForm({ initial, categories, onSave, onCancel }) {
  const [f, setF] = useState({ title: "", category: "", price: "", stock: "", description: "", ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    if (saving) return; // KEY POINT: double-click guard -> only ONE request
    const e = validate(f);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try { await onSave({ ...f, price: Number(f.price), stock: Number(f.stock) }); }
    catch (err) { setErrors({ form: err.userMessage || "Could not save" }); setSaving(false); }
  };

  const field = (name, label, type = "text") => (
    <label className="mb-3 block text-sm">
      {label}
      <input type={type} value={f[name]} onChange={(e) => setF({ ...f, [name]: e.target.value })} className="mt-1 w-full rounded border px-2 py-1" />
      {errors[name] && <span className="text-xs text-red-600">{errors[name]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="mb-3 font-semibold">{initial ? "Edit product" : "Add product"}</h2>
      {field("title", "Title")}
      <label className="mb-3 block text-sm">
        Category
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="mt-1 w-full rounded border px-2 py-1">
          <option value="">Select…</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        {errors.category && <span className="text-xs text-red-600">{errors.category}</span>}
      </label>
      {field("price", "Price", "number")}
      {field("stock", "Stock", "number")}
      {field("description", "Description")}
      {errors.form && <p className="mb-2 text-sm text-red-600">{errors.form}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded border px-3 py-1">Cancel</button>
        <button disabled={saving} className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
