"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/productService";

export default function LoginPage() {
  const router = useRouter();
  const [u, setU] = useState("emilys");
  const [p, setP] = useState("emilyspass");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false); // WHY a ref: updates instantly, unlike state, so rapid clicks are blocked

  const submit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return; // KEY POINT: many quick clicks -> ONE request
    inFlight.current = true; setBusy(true); setErr("");
    try {
      const d = await login(u, p);
      localStorage.setItem("token", d.accessToken ?? d.token); // interceptor reads this key
      router.replace("/products");
    } catch (e2) {
      setErr(e2.userMessage); // "Invalid credentials" comes straight from the API
      inFlight.current = false; setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm space-y-3 rounded border p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Username" className="w-full rounded border px-2 py-1" />
      <input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="Password" className="w-full rounded border px-2 py-1" />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="w-full rounded bg-indigo-600 py-2 text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
