"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { Loader, ErrorBox } from "@/components/ui";
import { fetchProduct } from "@/services/productService";
import { read } from "@/lib/localStore";

export default function Details() {
  const { id } = useParams();
  const [s, setS] = useState({ p: null, status: "loading", msg: "" });
  const [tries, setTries] = useState(0);

  useEffect(() => {
    const local = read();
    const num = Number(id);
    const back = { p: null, status: "notfound" };
    if (!Number.isInteger(num) || local.deleted.includes(num)) return setS(back); // /products/abc -> not found, no crash
    const added = local.added.find((a) => a.id === num); // locally created products don't exist on the server
    if (added) return setS({ p: added, status: "ok" });
    setS({ p: null, status: "loading" });
    fetchProduct(num)
      .then((p) => setS({ p: { ...p, ...local.edited[num] }, status: "ok" }))
      .catch((e) => setS(e.response?.status === 404 ? back : { p: null, status: "error", msg: e.userMessage })); // 404 vs real failure
  }, [id, tries]);

  return (
    <AuthGuard>
      <Link href="/products" className="text-sm text-indigo-600">← Back to products</Link>
      {s.status === "loading" && <Loader />}
      {s.status === "error" && <ErrorBox message={s.msg} onRetry={() => setTries((t) => t + 1)} />}
      {s.status === "notfound" && <p className="p-12 text-center text-slate-500">Product not found.</p>}
      {s.status === "ok" && (
        <div className="mt-4">
          <h2 className="text-2xl font-semibold">{s.p.title}</h2>
          <p className="text-slate-500">{s.p.category} · ${s.p.price} · ★{s.p.rating}</p>
          <div className="my-3 flex gap-2 overflow-x-auto">{(s.p.images || []).map((src) => <img key={src} src={src} alt="" className="h-40 rounded" />)}</div>
          <p className="mb-4">{s.p.description}</p>
          <h3 className="font-medium">Reviews</h3>
          {(s.p.reviews || []).length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
          {(s.p.reviews || []).map((r, i) => (
            <div key={i} className="border-b py-2 text-sm"><b>{r.reviewerName}</b> · ★{r.rating}<p>{r.comment}</p></div>
          ))}
        </div>
      )}
    </AuthGuard>
  );
}
