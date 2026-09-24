/**
 * Global Horizontal Scroll & Drag-to-Scroll Engine
 * 
 * Automatically enables:
 * 1. Mouse wheel vertical-to-horizontal scrolling on any horizontal option bar,
 *    tab strip, chip list, or container with overflow-x-auto.
 * 2. Click-and-drag (grab-to-scroll) using left or middle mouse button.
 * 3. Prevents accidental button clicks when dragging.
 */

let isInitialized = false;

function findHorizontalScrollContainer(target: EventTarget | null): HTMLElement | null {
  let el = target as HTMLElement | null;
  while (el && el !== document.body && el !== document.documentElement) {
    // Skip inputs, textareas, and content-editable elements from being dragged
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) {
      return null;
    }

    const hasScrollClass =
      el.classList.contains('overflow-x-auto') ||
      el.classList.contains('scrollbar-hide') ||
      el.classList.contains('scrollbar-none') ||
      el.classList.contains('no-scrollbar') ||
      el.hasAttribute('data-draggable-scroll');

    const style = window.getComputedStyle(el);
    const overflowX = style.overflowX;
    const overflowY = style.overflowY;

    const canScrollX = (overflowX === 'auto' || overflowX === 'scroll' || hasScrollClass) && el.scrollWidth > el.clientWidth + 2;
    const isMainlyVertical = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 40;

    // If it's horizontally scrollable and not a giant vertically scrollable table/page
    if (canScrollX && !isMainlyVertical) {
      return el;
    }

    el = el.parentElement;
  }
  return null;
}

export function initGlobalHorizontalScroll() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  let activeContainer: HTMLElement | null = null;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let isDragging = false;
  let hasMoved = false;

  // 1. Mouse Wheel vertical-to-horizontal translation
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      // Don't intercept if modifier keys like Ctrl (zoom) are pressed
      if (e.ctrlKey || e.metaKey) return;

      const container = findHorizontalScrollContainer(e.target);
      if (!container) return;

      // Only translate if deltaY is the primary scroll direction (normal mouse wheel)
      if (e.deltaY !== 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        // Check if there is room to scroll horizontally
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft <= 0) return;

        let delta = e.deltaY;
        if (e.deltaMode === 1) {
          delta *= 33; // Normalize lines to pixels (Firefox/Windows)
        } else if (e.deltaMode === 2) {
          delta *= 100; // Normalize pages to pixels
        }

        // Prevent vertical parent page scroll while hovering over the horizontal option bar
        e.preventDefault();
        container.scrollLeft += delta;
      }
    },
    { passive: false }
  );

  // 2. Mouse Drag-to-Scroll (Grab to Scroll)
  window.addEventListener(
    'mousedown',
    (e: MouseEvent) => {
      // Only left click (0) or middle wheel click (1)
      if (e.button !== 0 && e.button !== 1) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't hijack clicks on form controls
      if (target.closest('input, textarea, select, option, [contenteditable="true"]')) {
        return;
      }

      const container = findHorizontalScrollContainer(target);
      if (!container) return;

      // Check if container actually has overflow
      if (container.scrollWidth <= container.clientWidth + 2) return;

      activeContainer = container;
      startX = e.pageX;
      startY = e.pageY;
      startScrollLeft = container.scrollLeft;
      isDragging = false;
      hasMoved = false;
    },
    { passive: true }
  );

  window.addEventListener(
    'mousemove',
    (e: MouseEvent) => {
      if (!activeContainer) return;

      const deltaX = e.pageX - startX;
      const deltaY = e.pageY - startY;

      if (!hasMoved) {
        // If movement is predominantly horizontal and exceeds threshold
        if (Math.abs(deltaX) > 4) {
          if (Math.abs(deltaX) >= Math.abs(deltaY)) {
            hasMoved = true;
            isDragging = true;
            activeContainer.classList.add('cursor-grabbing');
            document.body.classList.add('cursor-grabbing');
            document.body.style.userSelect = 'none';
          } else {
            // Predominantly vertical, cancel drag
            activeContainer = null;
            return;
          }
        }
      }

      if (isDragging && activeContainer) {
        e.preventDefault();
        activeContainer.scrollLeft = startScrollLeft - deltaX;
      }
    },
    { passive: false }
  );

  const endDrag = () => {
    if (activeContainer) {
      if (isDragging) {
        // Suppress the click event that would fire after releasing the mouse button
        const captureClick = (clickEvent: MouseEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          clickEvent.stopImmediatePropagation();
        };

        window.addEventListener('click', captureClick, { capture: true, once: true });
        // Failsafe cleanup in case no click event fires
        setTimeout(() => {
          window.removeEventListener('click', captureClick, { capture: true });
        }, 80);
      }

      activeContainer.classList.remove('cursor-grabbing');
      document.body.classList.remove('cursor-grabbing');
      document.body.style.userSelect = '';
      activeContainer = null;
      isDragging = false;
      hasMoved = false;
    }
  };

  window.addEventListener('mouseup', endDrag);
  window.addEventListener('mouseleave', endDrag);
}
