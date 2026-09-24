import { useEffect, useState } from "react";

// WHY: wait until the user STOPS typing (500ms) before calling the API -> fewer requests.
export default function useDebounce(value, ms = 500) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t); // every new keystroke cancels the previous timer
  }, [value, ms]);
  return v;
}
