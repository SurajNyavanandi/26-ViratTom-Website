import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for data fetching with loading, error, and manual refetch states
 * @param {Function} fetchFn - Async function returning data
 * @param {boolean} autoFetch - Whether to immediately fetch on mount
 */
export function useFetch(fetchFn, autoFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      let isMounted = true;
      fetchFnRef.current()
        .then((result) => {
          if (isMounted) {
            setData(result);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err);
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
  };
}

export default useFetch;
