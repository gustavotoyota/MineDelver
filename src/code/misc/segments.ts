export interface Segment<T> {
  from: number;
  items: T[];
}

export type Segments<T> = Segment<T>[];

export type ToOrCount = { count: number } | { to: number };

export function getTo(input: { from: number } & ToOrCount) {
  if ('count' in input) {
    return input.from + input.count;
  } else {
    return input.to;
  }
}

export function getCount(input: { from: number } & ToOrCount) {
  if ('count' in input) {
    return input.count;
  } else {
    return input.to - input.from;
  }
}

export function getToAndCount(input: { from: number } & ToOrCount) {
  return {
    to: getTo(input),
    count: getCount(input),
  };
}

export function findSegmentIndex<T>(segments: Segments<T>, from: number) {
  // TODO: Binary search

  let segmentIndex = 0;

  while (segmentIndex < segments.length) {
    const currentSegment = segments[segmentIndex];

    if (from < currentSegment.from + currentSegment.items.length) {
      break;
    }

    segmentIndex++;
  }

  return segmentIndex;
}

export function putItemsInSegments<T>(
  segments: Segments<T>,
  from: number,
  items: T[]
) {
  // Find target segment index

  const targetSegmentIndex = findSegmentIndex(segments, from);

  // Merge neighbour segments

  const targetSegment = segments[targetSegmentIndex];
  const targetSegmentContainsSegment =
    targetSegment !== undefined && targetSegment.from <= from;

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

export function getSliceFromSegments<T>(
  segments: Segments<T>,
  from: number,
  params: ToOrCount
): Segments<T> {
  const { to, count } = getToAndCount({ from, ...params });

  // Find start segment index

  const startSegmentIndex = findSegmentIndex(segments, from);
  const startSegment = segments[startSegmentIndex];

  if (startSegment === undefined) {
    return [];
  }

  // Find end segment index

  let endSegmentIndex = startSegmentIndex;
  let nextEndSegmentIndex = endSegmentIndex + 1;

  while (nextEndSegmentIndex < segments.length) {
    const nextSegment = segments[nextEndSegmentIndex];

    if (nextSegment.from >= to) {
      break;
    }

    endSegmentIndex++;
    nextEndSegmentIndex++;
  }

  const result: Segments<T> = [];

  // Include start items

  const startIndex = startSegment.from - from;

  result.push({
    from: Math.max(from, startSegment.from),
    items: startSegment.items.slice(
      Math.max(0, -startIndex),
      Math.max(0, count - startIndex)
    ),
  });

  // Include items in between

  for (let i = startSegmentIndex + 1; i < endSegmentIndex; i++) {
    result.push({ from: segments[i].from, items: [...segments[i].items] });
  }

  // Include end items

  const endSegment = segments[endSegmentIndex];

  if (startSegmentIndex !== endSegmentIndex && endSegment !== undefined) {
    result.push({
      from: endSegment.from,
      items: endSegment.items.slice(0, to - endSegment.from),
    });
  }

  return result;
}

export function getItemsFromSegments<T>(
  segments: Segments<T>,
  from: number,
  params: ToOrCount
): (T | undefined)[] {
  const count = getCount({ from, ...params });

  const slice = getSliceFromSegments(segments, from, params);

  const items: (T | undefined)[] = new Array(count).fill(undefined);

  for (const segment of slice) {
    items.splice(segment.from - from, segment.items.length, ...segment.items);
  }

  return items;
}

export function removeItemsFromSegments<T>(
  segments: Segments<T>,
  from: number,
  params: ToOrCount
): (T | undefined)[] {
  const { to, count } = getToAndCount({ from, ...params });

  // Find start segment index

  const startSegmentIndex = findSegmentIndex(segments, from);
  const startSegment = segments[startSegmentIndex];

  // Find end segment index

  let endSegmentIndex = startSegmentIndex;

  while (endSegmentIndex < segments.length) {
    const currentSegment = segments[endSegmentIndex];

    if (currentSegment.from + currentSegment.items.length >= to) {
      break;
    }

    endSegmentIndex++;
  }

  // Remove start items

  const removedItems: (T | undefined)[] = new Array(count).fill(undefined);

  if (startSegment !== undefined) {
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

  if (startSegmentIndex !== endSegmentIndex && endSegment !== undefined) {
    const endRemovedItems = endSegment.items.splice(0, to - endSegment.from);

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
