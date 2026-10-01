import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from './api';

// GET an admin API path; reloads when the path changes. Ignores answers to stale requests.
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: !!path, error: null });
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!path) return;
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api(path);
      if (id === seq.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === seq.current) setState((s) => ({ ...s, loading: false, error }));
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

// Filters and page kept in the address bar, so a list can be refreshed, shared or gone back to.
export function useFilters(defaults) {
  const [params, setParams] = useSearchParams();
  const values = {};
  for (const [k, v] of Object.entries(defaults)) values[k] = params.get(k) ?? v;

  const set = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === '' || v === null || v === undefined || v === defaults[k]) next.delete(k);
            else next.set(k, String(v));
          }
          // Any filter change goes back to page 1.
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setParams]
  );
  return [values, set];
}

// Value that only updates after the user stops typing.
export function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
