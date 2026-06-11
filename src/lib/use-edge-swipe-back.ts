import { useEffect } from "react";

// Left-edge swipe (iOS-style back gesture) detector. A pragmatic web-layer
// gesture — not the true interactive UIKit pop — that fires `onBack` when a
// drag starts near the left edge and travels far enough rightward.
export function useEdgeSwipeBack(onBack: () => void) {
  useEffect(() => {
    const EDGE_PX = 24; // how close to the left edge the drag must start
    const TRAVEL_PX = 80; // horizontal distance required to trigger

    let startX: number | null = null;
    let startY = 0;

    const onPointerDown = (event: PointerEvent) => {
      startX = event.clientX <= EDGE_PX ? event.clientX : null;
      startY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      const dy = Math.abs(event.clientY - startY);
      startX = null;
      // Mostly-horizontal rightward swipe.
      if (dx > TRAVEL_PX && dy < dx) onBack();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onBack]);
}
