import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
export function useResource(path) {
  const [state, setState] = useState({ path, data: null, loading: true, error: '' });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    api(path, { signal: controller.signal })
      .then((data) => setState({ path, data, loading: false, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError')
          setState({ path, data: null, loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [path, version]);
  return state.path === path
    ? { ...state, reload }
    : { data: null, loading: true, error: '', reload };
}
