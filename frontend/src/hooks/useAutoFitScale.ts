import { useState, useEffect, useCallback } from 'react';

export const useAutoFitScale = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  mobileView: 'editor' | 'preview'
) => {
  const [scale, setScale] = useState(0.85);

  const updateAutoFitScale = useCallback(() => {
    if (containerRef.current) {
      const clientWidth = containerRef.current.clientWidth || window.innerWidth;
      if (clientWidth > 0) {
        const isMobile = window.innerWidth < 1024;
        const padding = isMobile ? 24 : 48;
        const availableWidth = clientWidth - padding;
        const targetWidth = 794;

        if (availableWidth < targetWidth) {
          const calculatedScale = Number((availableWidth / targetWidth).toFixed(3));
          setScale(Math.max(0.35, Math.min(1.0, calculatedScale)));
        } else {
          const desktopScale = Math.min(0.92, Number((availableWidth / targetWidth).toFixed(2)));
          setScale(Math.max(0.75, desktopScale));
        }
      }
    }
  }, [containerRef]);

  useEffect(() => {
    updateAutoFitScale();
    const t1 = setTimeout(updateAutoFitScale, 60);
    const t2 = setTimeout(updateAutoFitScale, 200);

    const resizeObserver = new ResizeObserver(() => {
      updateAutoFitScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateAutoFitScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateAutoFitScale);
    };
  }, [mobileView, updateAutoFitScale, containerRef]);

  const zoomIn = () => {
    setScale((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.35, Number((prev - 0.1).toFixed(2))));
  };

  const resetZoom = () => {
    updateAutoFitScale();
  };

  return {
    scale,
    zoomIn,
    zoomOut,
    resetZoom,
  };
};
