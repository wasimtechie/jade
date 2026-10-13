"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type DashboardDropdownMenuProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
};

export function DashboardDropdownMenu({
  open,
  onClose,
  anchorRef,
  children,
  align = "end",
  className = "",
}: DashboardDropdownMenuProps) {
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const menu = menuRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const menuWidth = menu?.offsetWidth ?? 176;
    const menuHeight = menu?.offsetHeight ?? 200;
    const gap = 4;
    const left =
      align === "end"
        ? Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)
        : Math.max(8, rect.left);
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    const top = openUp
      ? Math.max(8, rect.top - menuHeight - gap)
      : rect.bottom + gap;
    setPos({ top, left: Math.max(8, left) });
  }, [anchorRef, align]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
    const id = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(id);
  }, [open, updatePosition, children]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      className={`dash-dropdown-menu ${className}`.trim()}
      style={
        pos
          ? { position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }
          : { position: "fixed", visibility: "hidden", zIndex: 9999 }
      }
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}
