"use client";
import { useCallback, useEffect, useState } from "react";
import { friendlyError } from "@/lib/supabase";

/** Load async data in a client component, with loading/error state and a reload(). */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    fn()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((err) => {
        console.error(err);
        if (alive) setState({ error: friendlyError(err, "Couldn't load this. Check your connection and try again."), loading: false });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
