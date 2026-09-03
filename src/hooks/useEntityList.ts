import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
type ApiPage<T> = { items: T[]; nextCursor: string | null };
type State<T> = {
  items: T[];
  nextCursor: string | null;
  loading: boolean;
  error: string;
};
const TTL = 45_000;
const cache = new Map<string, { expires: number; data: ApiPage<unknown> }>();
export function useEntityList<T>(
  collection: string,
  fallback: T[],
  rawParams?: Record<string, string>,
) {
  const [revision, setRevision] = useState(0);
  const { demoMode, getToken } = useAuth();
  const query = useMemo(() => new URLSearchParams(rawParams), [rawParams]);
  const key = `${collection}?${query}#${revision}`;
  const [state, setState] = useState<State<T>>({
    items: fallback,
    nextCursor: null,
    loading: !demoMode,
    error: "",
  });
  useEffect(() => {
    if (demoMode) return;
    let active = true;
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      console.info("[CACHE HIT]", key);
      queueMicrotask(
        () =>
          active &&
          setState({
            ...(cached.data as ApiPage<T>),
            loading: false,
            error: "",
          }),
      );
      return;
    }
    console.info("[CACHE MISS]", key);
    queueMicrotask(
      () =>
        active &&
        setState((current) => ({ ...current, loading: true, error: "" })),
    );
    void getToken()
      .then((token) => {
        if (!token) throw new Error("UNAUTHENTICATED");
        return api.list<T>(collection, token, query);
      })
      .then((data) => {
        cache.set(key, { expires: Date.now() + TTL, data });
        if (active) setState({ ...data, loading: false, error: "" });
      })
      .catch((error) => {
        if (active)
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : "LOAD_FAILED",
          }));
      });
    return () => {
      active = false;
    };
  }, [collection, demoMode, getToken, key, query]);
  const reload = useCallback(() => {
    invalidateEntityCache(collection);
    setRevision((value) => value + 1);
  }, [collection]);
  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ collection?: string }>).detail;
      if (detail?.collection === collection) reload();
    };
    window.addEventListener("entity-changed", listener);
    return () => window.removeEventListener("entity-changed", listener);
  }, [collection, reload]);
  return { ...state, reload };
}
export function invalidateEntityCache(collection: string) {
  for (const key of cache.keys())
    if (key.startsWith(collection + "?")) cache.delete(key);
  console.info("[CACHE INVALIDATE]", collection);
}
