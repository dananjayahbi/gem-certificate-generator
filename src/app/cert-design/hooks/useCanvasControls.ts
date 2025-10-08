// Hooks for Certificate Designer
import { useEffect, RefObject } from 'react';
import { PanState } from '../types';

export function useCanvasZoom(
  canvasContainerRef: RefObject<HTMLDivElement>,
  setScale: (scale: number | ((prev: number) => number)) => void
) {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && canvasContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prevScale => Math.max(0.5, Math.min(3, prevScale + delta)));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [canvasContainerRef, setScale]);
}

export function useCanvasPan(
  canvasContainerRef: RefObject<HTMLDivElement>,
  isPanning: boolean,
  panStart: PanState
) {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.ctrlKey && canvasContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [canvasContainerRef]);

  const handleCanvasPanStart = (e: React.MouseEvent) => {
    if (e.ctrlKey && e.button === 2 && canvasContainerRef.current) {
      e.preventDefault();
      return {
        isPanning: true,
        panStart: {
          x: e.clientX,
          y: e.clientY,
          scrollLeft: canvasContainerRef.current.scrollLeft,
          scrollTop: canvasContainerRef.current.scrollTop,
        },
      };
    }
    return null;
  };

  const handleCanvasPanMove = (e: React.MouseEvent) => {
    if (isPanning && canvasContainerRef.current) {
      e.preventDefault();
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      canvasContainerRef.current.scrollLeft = panStart.scrollLeft - dx;
      canvasContainerRef.current.scrollTop = panStart.scrollTop - dy;
    }
  };

  const handleCanvasPanEnd = () => {
    return { isPanning: false };
  };

  return {
    handleCanvasPanStart,
    handleCanvasPanMove,
    handleCanvasPanEnd,
  };
}
