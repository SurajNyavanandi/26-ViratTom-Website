import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically resets scroll position to (0,0) when switching routes
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
