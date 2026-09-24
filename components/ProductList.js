"use client";
import Link from "next/link";

// WHY: one component, two layouts. Tailwind md: shows TABLE on desktop, CARDS on mobile.
const Thumb = ({ p }) => (p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="h-12 w-12 rounded object-cover" /> : <div className="h-12 w-12 rounded bg-slate-200" />);
const Actions = ({ p, onEdit, onDelete }) => (
  <div className="flex gap-2 text-sm">
    <button onClick={() => onEdit(p)} className="text-indigo-600">Edit</button>
    <button onClick={() => onDelete(p)} className="text-red-600">Delete</button>
  </div>
);

export default function ProductList({ items, onEdit, onDelete }) {
  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b text-slate-500"><tr>{["", "Title", "Category", "Price", "Rating", "Stock", ""].map((h, i) => <th key={i} className="p-2">{h}</th>)}</tr></thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2"><Thumb p={p} /></td>
              <td className="p-2"><Link href={`/products/${p.id}`} className="text-indigo-700 hover:underline">{p.title}</Link></td>
              <td className="p-2">{p.category}</td><td className="p-2">${p.price}</td>
              <td className="p-2">{p.rating}</td><td className="p-2">{p.stock}</td>
              <td className="p-2"><Actions p={p} onEdit={onEdit} onDelete={onDelete} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid gap-3 md:hidden">
        {items.map((p) => (
          <div key={p.id} className="flex gap-3 rounded border p-3">
            <Thumb p={p} />
            <div className="flex-1 text-sm">
              <Link href={`/products/${p.id}`} className="font-medium text-indigo-700">{p.title}</Link>
              <p className="text-slate-500">{p.category} · ${p.price} · ★{p.rating} · stock {p.stock}</p>
              <Actions p={p} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
