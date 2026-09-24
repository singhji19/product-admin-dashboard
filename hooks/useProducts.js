"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { fetchProducts } from "@/services/productService";

// WHY a hook: fetching logic stays OUT of the UI (rule: small components).
export default function useProducts({ q, category, page, size, sortBy, order }) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tries, setTries] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchProducts({ q, category, limit: size, skip: (page - 1) * size, sortBy, order }, ctrl.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => { if (!axios.isCancel(e)) setState({ data: null, loading: false, error: e.userMessage }); });
    // KEY POINT: when inputs change, cleanup ABORTS the old request, so slow old results
    // can never overwrite newer ones (the &delay=2000 test).
    return () => ctrl.abort();
  }, [q, category, page, size, sortBy, order, tries]);

  return { ...state, retry: () => setTries((t) => t + 1) }; // changing `tries` re-runs the effect = Retry
}
