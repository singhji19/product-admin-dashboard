import { redirect } from "next/navigation";
export default function Home() { redirect("/products"); } // WHY: "/" has no content; AuthGuard sends guests to /login
