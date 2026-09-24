"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "./ui";

// WHY: "only logged-in users can open product pages". Wrap any page with this.
// useEffect because localStorage exists only in the browser, not on the Next.js server.
export default function AuthGuard({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
    else setOk(true);
  }, [router]);
  if (!ok) return <Loader />; // avoids flashing protected content before the check ends
  const logout = () => { localStorage.removeItem("token"); router.replace("/login"); };
  return (
    <div className="mx-auto max-w-6xl p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Product Admin</h1>
        <button onClick={logout} className="rounded border px-3 py-1 text-sm">Logout</button>
      </header>
      {children}
    </div>
  );
}
