'use client';

import {
  ReactNode,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Minimal portaled popover. Renders `children` into document.body with
 * `position: fixed` so it escapes ancestor `overflow: hidden / auto` clipping
 * and z-index stacking. Positions itself relative to `anchorRef`'s bounding
 * rect and re-measures on scroll/resize so it tracks the trigger.
 *
 * Why not just bump z-index on the inline popover? z-index doesn't escape a
 * parent that clips with `overflow: hidden` — the popover renders, but the
 * parent crops it. The only fix is to take the popover out of that subtree.
 */
export interface FloatingPanelProps {
  anchorRef: RefObject<HTMLElement>;
  open: boolean;
  onClose: () => void;
  /** Anchor alignment. 'bottom-start' = anchor's left/below; 'bottom-end' =
   *  anchor's right/below. Both fall back to flipping above when there's no
   *  room below (computed from window.innerHeight). */
  placement?: 'bottom-start' | 'bottom-end';
  /** Pixel gap between anchor and panel. Default 4 (matches the form's
   *  previous `top-9` / `top-10` / `top-11` spacing). */
  offset?: number;
  /** Optional fixed width; when set, also clamps right-edge to viewport. */
  width?: number;
  className?: string;
  children: ReactNode;
}

interface Position {
  top: number;
  left: number;
}

export function FloatingPanel({
  anchorRef,
  open,
  onClose,
  placement = 'bottom-start',
  offset = 4,
  width,
  className,
  children,
}: FloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<Position | null>(null);

  // Compute panel position from the anchor's rect. Done in a layout effect so
  // the first paint is already in the right place — no visible jump.
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }

    const compute = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const panel = panelRef.current;
      const panelWidth = width ?? panel?.offsetWidth ?? rect.width;
      const panelHeight = panel?.offsetHeight ?? 0;

      // Vertical: prefer below; flip above if it would overflow the viewport.
      const spaceBelow = window.innerHeight - rect.bottom;
      const flipAbove = panelHeight > 0 && spaceBelow < panelHeight + offset;
      const top = flipAbove ? rect.top - panelHeight - offset : rect.bottom + offset;

      // Horizontal: align to anchor's start or end edge, then clamp to viewport.
      let left =
        placement === 'bottom-end' ? rect.right - panelWidth : rect.left;
      const margin = 8;
      left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin));

      setPos({ top, left });
    };

    compute();

    // Reposition on any scroll (capture mode catches scroll on every ancestor,
    // including modal bodies and the page itself) and on resize. RAF avoids
    // pile-ups during continuous scroll.
    let raf = 0;
    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, anchorRef, placement, offset, width]);

  // Outside-click and Escape to dismiss. Anchor clicks are excluded so the
  // trigger can keep its own toggle behavior.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      const target = e.target as Node | null;
      if (!target) return;
      if (panel && panel.contains(target)) return;
      if (anchor && anchor.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, anchorRef, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        // Hide until measured to avoid the first-frame flicker at -9999.
        visibility: pos ? 'visible' : 'hidden',
        ...(width ? { width } : {}),
        zIndex: 9999,
      }}
      className={className}
    >
      {children}
    </div>,
    document.body
  );
}
