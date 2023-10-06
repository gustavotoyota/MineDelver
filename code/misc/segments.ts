export interface Segment<T> {
  from: number;
  items: T[];
}

export type Segments<T> = Segment<T>[];

export function findSegmentIndex<T>(segments: Segments<T>, from: number) {
  // TODO: Binary search

  let segmentIndex = 0;

  while (segmentIndex < segments.length) {
    const currentSegment = segments[segmentIndex];

    if (from <= currentSegment.from + currentSegment.items.length) {
      break;
    }

    segmentIndex++;
  }

  return segmentIndex;
}

export function putInSegments<T>(
  segments: Segments<T>,
  from: number,
  items: T[]
) {
  // Find target segment index

  const targetSegmentIndex = findSegmentIndex(segments, from);

  // Merge neighbour segments

  const targetSegment = segments[targetSegmentIndex];
  const targetSegmentContainsSegment =
    targetSegment != null && targetSegment.from <= from;

  const finalSegment: Segment<T> = {
    from: targetSegmentContainsSegment ? targetSegment.from : from,
    items: [],
  };

  if (targetSegmentContainsSegment) {
    finalSegment.items = [...targetSegment.items];
    finalSegment.items.splice(
      from - targetSegment.from,
      items.length,
      ...items
    );
  } else {
    finalSegment.items = [...items];
  }

  let mergeSegmentIndex = targetSegmentContainsSegment
    ? targetSegmentIndex + 1
    : targetSegmentIndex;

  while (
    mergeSegmentIndex < segments.length &&
    segments[mergeSegmentIndex].from <= from + items.length
  ) {
    const nextSegment = segments[mergeSegmentIndex];

    const nextSegmentStart = nextSegment.from - finalSegment.from;

    finalSegment.items.splice(
      nextSegmentStart,
      nextSegment.items.length,
      ...nextSegment.items
    );

    mergeSegmentIndex++;
  }

  segments.splice(
    targetSegmentIndex,
    mergeSegmentIndex - targetSegmentIndex,
    finalSegment
  );

  return segments;
}

export function getFromSegments<T>(
  segments: Segments<T>,
  from: number,
  count: number
): (T | undefined)[] {
  // Find start segment index

  const startSegmentIndex = findSegmentIndex(segments, from);
  const startSegment = segments[startSegmentIndex];

  // Find end segment index

  let endSegmentIndex = startSegmentIndex;

  while (endSegmentIndex < segments.length) {
    const currentSegment = segments[endSegmentIndex];

    if (currentSegment.from + currentSegment.items.length >= from + count) {
      break;
    }

    endSegmentIndex++;
  }

  // Include start items

  const resultItems: (T | undefined)[] = new Array(count).fill(undefined);

  if (startSegment != null) {
    const startIndex = startSegment.from - from;

    const startItems = startSegment.items.slice(
      Math.max(0, -startIndex),
      Math.max(0, count - startIndex)
    );

    resultItems.splice(
      Math.max(0, startIndex),
      startItems.length,
      ...startItems
    );
  }

  // Include items in between

  for (let i = startSegmentIndex + 1; i < endSegmentIndex; i++) {
    const currentSegment = segments[i];

    resultItems.splice(
      currentSegment.from - from,
      currentSegment.items.length,
      ...currentSegment.items
    );
  }

  // Include end items

  const endSegment = segments[endSegmentIndex];

  if (startSegmentIndex !== endSegmentIndex && endSegment != null) {
    const endItems = endSegment.items.slice(0, from + count - endSegment.from);

    resultItems.splice(endSegment.from - from, endItems.length, ...endItems);
  }

  return resultItems;
}

export function removeFromSegments<T>(
  segments: Segments<T>,
  from: number,
  count: number
): (T | undefined)[] {
  // Find start segment index

  const startSegmentIndex = findSegmentIndex(segments, from);
  const startSegment = segments[startSegmentIndex];

  // Find end segment index

  let endSegmentIndex = startSegmentIndex;

  while (endSegmentIndex < segments.length) {
    const currentSegment = segments[endSegmentIndex];

    if (currentSegment.from + currentSegment.items.length >= from + count) {
      break;
    }

    endSegmentIndex++;
  }

  // Remove start items

  const removedItems: (T | undefined)[] = new Array(count).fill(undefined);

  if (startSegment != null) {
    const removeStartIndex = startSegment.from - from;
    const removedStartItems = startSegment.items.splice(
      Math.max(0, -removeStartIndex),
      Math.max(0, count - removeStartIndex)
    );

    removedItems.splice(
      Math.max(0, removeStartIndex),
      removedStartItems.length,
      ...removedStartItems
    );
  }

  // Include segments in between

  for (let i = startSegmentIndex + 1; i < endSegmentIndex; i++) {
    const currentSegment = segments[i];

    removedItems.splice(
      currentSegment.from - from,
      currentSegment.items.length,
      ...currentSegment.items
    );
  }

  // Remove end items and segment if necessary

  const endSegment = segments[endSegmentIndex];

  if (startSegmentIndex !== endSegmentIndex && endSegment != null) {
    const endRemovedItems = endSegment.items.splice(
      0,
      from + count - endSegment.from
    );

    removedItems.splice(
      endSegment.from - from,
      endRemovedItems.length,
      ...endRemovedItems
    );

    if (endSegment.items.length === 0) {
      segments.splice(endSegmentIndex, 1);
    } else {
      endSegment.from += endRemovedItems.length;
    }
  }

  // Remove segments in between

  segments.splice(
    startSegmentIndex + 1,
    endSegmentIndex - startSegmentIndex - 1
  );

  // Remove start segment if empty

  if (startSegment.items.length === 0) {
    segments.splice(startSegmentIndex, 1);
  }

  return removedItems;
}
