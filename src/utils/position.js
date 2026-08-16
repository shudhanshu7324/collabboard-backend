/**
 * Fractional rank between two neighbors for drag-and-drop reorder.
 * Dropped at start: prevPos is null → first / 2
 * Dropped at end: nextPos is null → last + 1
 * Empty collection: both null → 1
 */
export function calculateNewPosition(prevPos, nextPos) {
  if (prevPos == null && nextPos == null) return 1;
  if (prevPos == null) return nextPos / 2;
  if (nextPos == null) return prevPos + 1;
  return (prevPos + nextPos) / 2;
}
