import { useEffect, useState } from "react";

/** Simulates a short network fetch so loading skeletons are visible. Remove when wiring real data. */
export function useMockLoading(ms = 450) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
