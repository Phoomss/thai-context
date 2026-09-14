import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
export default function HeroFlashOverlay({
  overlayRef,
}: {
  overlayRef: RefObject<HTMLDivElement | null>;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted
    ? createPortal(
        <div
          ref={overlayRef}
          className="flash-overlay transition-overlay"
          aria-hidden="true"
        />,
        document.body,
      )
    : null;
}
