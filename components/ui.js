"use client";
// WHY one file: tiny reusable pieces (loading / empty / error / confirm / pagination).

export const Loader = () => (
  <div className="flex justify-center p-12" role="status" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600" />
  </div>
);
export const Empty = ({ text }) => <p className="p-12 text-center text-slate-500">{text}</p>;
export const ErrorBox = ({ message, onRetry }) => (
  <div className="p-12 text-center">
    <p className="mb-3 text-red-600">{message}</p>
    <button onClick={onRetry} className="rounded bg-indigo-600 px-4 py-2 text-white">Retry</button>
  </div>
);
export const Modal = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-5">{children}</div>
  </div>
);
export const Confirm = ({ text, onYes, onNo }) => (
  <Modal>
    <p className="mb-4">{text}</p>
    <div className="flex justify-end gap-2">
      <button onClick={onNo} className="rounded border px-3 py-1">Cancel</button>
      <button onClick={onYes} className="rounded bg-red-600 px-3 py-1 text-white">Delete</button>
    </div>
  </Modal>
);

export function Pagination({ page, size, total, onPage, onSize }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const start = Math.max(1, Math.min(page - 2, pages - 4)); // sliding window of 5 numbers
  const nums = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  const from = total ? (page - 1) * size + 1 : 0;
  const to = Math.min(page * size, total);
  const btn = "rounded border px-3 py-1 disabled:opacity-40";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex flex-wrap items-center gap-1">
        <button className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        {nums.map((n) => (
          <button key={n} onClick={() => onPage(n)} className={`${btn} ${n === page ? "bg-indigo-600 text-white" : ""}`}>{n}</button>
        ))}
        <button className={btn} disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
        <select value={size} onChange={(e) => onSize(+e.target.value)} className="ml-2 rounded border px-2 py-1">
          {[10, 20, 50].map((s) => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>
    </div>
  );
}
