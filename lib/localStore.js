// WHY: DummyJSON never really saves. We keep add/edit/delete in localStorage and MERGE them into
// API data so the UI behaves like a real app (README #2).
const KEY = "local-changes";
const empty = () => ({ added: [], edited: {}, deleted: [] });
export const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || empty(); } catch { return empty(); }
};
const write = (d) => localStorage.setItem(KEY, JSON.stringify(d));

export const addLocal = (p) => {
  const d = read();
  d.added.unshift({ ...p, id: Date.now(), thumbnail: "", images: [], reviews: [], rating: 0 }); // Date.now() = unique id
  write(d);
};
export const editLocal = (id, p) => {
  const d = read();
  const i = d.added.findIndex((a) => a.id === id);
  if (i > -1) d.added[i] = { ...d.added[i], ...p }; else d.edited[id] = { ...d.edited[id], ...p };
  write(d);
};
export const deleteLocal = (id) => {
  const d = read();
  d.added = d.added.filter((a) => a.id !== id);
  d.deleted.push(id);
  write(d);
};
// WHY: one merge function; new items only show on page 1 when no search/filter is active.
export const applyLocal = (items, showAdded) => {
  const d = read();
  const out = items.filter((p) => !d.deleted.includes(p.id)).map((p) => ({ ...p, ...d.edited[p.id] }));
  return showAdded ? [...d.added, ...out] : out;
};
