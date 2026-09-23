import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DraggableScrollRowProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  showArrows?: boolean;
  fadeEdges?: boolean;
  scrollAmount?: number;
  wheelMultiplier?: number;
}

export const DraggableScrollRow: React.FC<DraggableScrollRowProps> = ({
  children,
  className = '',
  innerClassName = '',
  showArrows = true,
  fadeEdges = true,
  scrollAmount = 180,
  wheelMultiplier = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const didDragRef = useRef(false);

  const updateScrollBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 3);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollBounds();

    const handleResize = () => updateScrollBounds();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => {
      updateScrollBounds();
    });
    observer.observe(el);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [updateScrollBounds, children]);

  // Non-passive wheel event listener to convert vertical mouse wheel to horizontal scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheelNonPassive = (e: WheelEvent) => {
      // Check if there is room to scroll horizontally
      if (el.scrollWidth > el.clientWidth) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * wheelMultiplier;
          updateScrollBounds();
        } else if (e.deltaX !== 0) {
          el.scrollLeft += e.deltaX * wheelMultiplier;
          updateScrollBounds();
        }
      }
    };

    el.addEventListener('wheel', onWheelNonPassive, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheelNonPassive);
    };
  }, [updateScrollBounds, wheelMultiplier]);

  // Window-level mousemove & mouseup for frictionless dragging even outside container
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !containerRef.current) return;
      const delta = e.pageX - startXRef.current;

      if (Math.abs(delta) > 4) {
        e.preventDefault();
        didDragRef.current = true;
        setIsDragging(true);
        containerRef.current.scrollLeft = scrollLeftRef.current - delta;
        updateScrollBounds();
      }
    };

    const handleGlobalMouseUp = () => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      if (didDragRef.current) {
        setTimeout(() => {
          setIsDragging(false);
          didDragRef.current = false;
        }, 60);
      } else {
        setIsDragging(false);
        didDragRef.current = false;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [updateScrollBounds]);

  // Start drag on mousedown
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;

    isMouseDownRef.current = true;
    startXRef.current = e.pageX;
    scrollLeftRef.current = el.scrollLeft;
    didDragRef.current = false;
  };

  // Intercept click if a drag gesture took place
  const handleClickCapture = (e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const scrollByAmount = (amount: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(updateScrollBounds, 300);
  };

  return (
    <div className={`relative flex items-center group/drag-row ${className}`}>
      {/* Left Chevron Button */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scrollByAmount(-scrollAmount)}
          disabled={!canScrollLeft}
          className={`absolute left-0 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 -ml-1 sm:-ml-2 hover:text-blue-600 ${
            canScrollLeft ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          title="Scroll Left"
          aria-label="Scroll options left"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}

      {/* Left Fade Mask */}
      {fadeEdges && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Scrollable & Draggable Inner Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onDragStart={handleDragStart}
        onClickCapture={handleClickCapture}
        onScroll={updateScrollBounds}
        className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${innerClassName}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>

      {/* Right Fade Mask */}
      {fadeEdges && (
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Right Chevron Button */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scrollByAmount(scrollAmount)}
          disabled={!canScrollRight}
          className={`absolute right-0 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 -mr-1 sm:-mr-2 hover:text-blue-600 ${
            canScrollRight ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          title="Scroll Right"
          aria-label="Scroll options right"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};
