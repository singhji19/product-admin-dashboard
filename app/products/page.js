"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import ProductList from "@/components/ProductList";
import ProductForm from "@/components/ProductForm";
import { Loader, Empty, ErrorBox, Modal, Confirm, Pagination } from "@/components/ui";
import useProducts from "@/hooks/useProducts";
import useDebounce from "@/hooks/useDebounce";
import { fetchCategories, addProduct, updateProduct, deleteProduct } from "@/services/productService";
import { applyLocal, addLocal, editLocal, deleteLocal } from "@/lib/localStore";

const SIZES = [10, 20, 50];
const SORTS = ["title", "price", "rating"];

function Products() {
  const sp = useSearchParams();
  const router = useRouter();

  // KEY POINT: URL is the single source of truth (refresh/share works). Every value is VALIDATED,
  // so ?page=abc falls back to 1 and ?size=7 falls back to 10 instead of breaking the page.
  const params = {
    q: sp.get("q") || "",
    category: sp.get("category") || "",
    page: Math.max(1, parseInt(sp.get("page"), 10) || 1),
    size: SIZES.includes(+sp.get("size")) ? +sp.get("size") : 10,
    sortBy: SORTS.includes(sp.get("sortBy")) ? sp.get("sortBy") : "",
    order: sp.get("order") === "desc" ? "desc" : "asc",
  };
  const update = (patch) => {
    const n = { ...params, ...patch };
    const u = new URLSearchParams();
    if (n.q) u.set("q", n.q);
    if (n.category) u.set("category", n.category);
    if (n.page > 1) u.set("page", n.page);
    if (n.size !== 10) u.set("size", n.size);
    if (n.sortBy) { u.set("sortBy", n.sortBy); u.set("order", n.order); }
    router.replace(`/products?${u}`); // replace (not push) so Back button isn't flooded by keystrokes
  };

  const { data, loading, error, retry } = useProducts(params);
  const [categories, setCategories] = useState([]);
  const [ver, setVer] = useState(0); // WHY: bump to re-merge local changes after add/edit/delete
  const [form, setForm] = useState(null); // null | {} (add) | product (edit)
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);

  // Search box: local text for instant typing, debounced value goes to the URL.
  const [text, setText] = useState(params.q);
  const debounced = useDebounce(text);
  useEffect(() => { if (debounced !== params.q) update({ q: debounced.trim(), page: 1 }); }, [debounced]); // page 1 on new search

  // WHY: ?page=999 -> jump to the last real page instead of showing an empty screen.
  useEffect(() => {
    if (data && data.total > 0 && params.page > Math.ceil(data.total / params.size)) update({ page: Math.ceil(data.total / params.size) });
  }, [data]);

  const items = useMemo(
    () => (data ? applyLocal(data.products, params.page === 1 && !params.q && !params.category) : []),
    [data, ver] // eslint-disable-line
  );

  const save = async (v) => {
    if (form.id) { await updateProduct(form.id, v); editLocal(form.id, v); }
    else { await addProduct(v); addLocal(v); }
    setForm(null); setVer((x) => x + 1);
  };
  const remove = async () => {
    try { await deleteProduct(toDelete.id); deleteLocal(toDelete.id); setVer((x) => x + 1); } catch {}
    setToDelete(null);
  };

  return (
    <AuthGuard>
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search products…" className="min-w-40 flex-1 rounded border px-2 py-1" />
        {/* KEY DECISION: category is disabled while searching (API can't do both) */}
        <select value={params.category} disabled={!!params.q} title={params.q ? "Clear search to filter by category" : ""}
          onChange={(e) => update({ category: e.target.value, page: 1 })} className="rounded border px-2 py-1 disabled:opacity-50">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={params.sortBy ? `${params.sortBy}-${params.order}` : ""}
          onChange={(e) => { const [s, o] = e.target.value.split("-"); update({ sortBy: s || "", order: o || "asc", page: 1 }); }}
          className="rounded border px-2 py-1">
          <option value="">Sort by…</option>
          <option value="title-asc">Title A–Z</option><option value="title-desc">Title Z–A</option>
          <option value="price-asc">Price low–high</option><option value="price-desc">Price high–low</option>
          <option value="rating-desc">Top rated</option>
        </select>
        <button onClick={() => setForm({})} className="rounded bg-indigo-600 px-3 py-1 text-white">Add product</button>
      </div>

      {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={retry} /> :
        items.length === 0 ? <Empty text="No products found. Try a different search or filter." /> : (
          <>
            <ProductList items={items} onEdit={setForm} onDelete={setToDelete} />
            <Pagination page={params.page} size={params.size} total={data.total} onPage={(page) => update({ page })} onSize={(size) => update({ size, page: 1 })} />
          </>
        )}

      {form && <Modal><ProductForm initial={form.id ? form : undefined} categories={categories} onSave={save} onCancel={() => setForm(null)} /></Modal>}
      {toDelete && <Confirm text={`Delete "${toDelete.title}"?`} onYes={remove} onNo={() => setToDelete(null)} />}
    </AuthGuard>
  );
}

// WHY Suspense: Next.js requires it around useSearchParams for production builds.
export default function Page() { return <Suspense fallback={<Loader />}><Products /></Suspense>; }
