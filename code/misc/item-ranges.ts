export interface ItemRange<T> {
  from: number;
  items: T[];
}

export type ItemRanges<T> = ItemRange<T>[];

export function findRangeIndex<T>(ranges: ItemRanges<T>, from: number) {
  // TODO: Binary search

  let rangeIndex = 0;

  while (rangeIndex < ranges.length) {
    const currentRange = ranges[rangeIndex];

    if (from <= currentRange.from + currentRange.items.length) {
      break;
    }

    rangeIndex++;
  }

  return rangeIndex;
}

export function putInItemRanges<T>(
  ranges: ItemRanges<T>,
  from: number,
  items: T[]
) {
  // Find target range index

  const targetRangeIndex = findRangeIndex(ranges, from);

  // Merge neighbour ranges

  const targetRange = ranges[targetRangeIndex];
  const targetRangeContainsRange =
    targetRange != null && targetRange.from <= from;

  const finalRange: ItemRange<T> = {
    from: targetRangeContainsRange ? targetRange.from : from,
    items: [],
  };

  if (targetRangeContainsRange) {
    finalRange.items = [...targetRange.items];
    finalRange.items.splice(from - targetRange.from, items.length, ...items);
  } else {
    finalRange.items = [...items];
  }

  let mergeRangeIndex = targetRangeContainsRange
    ? targetRangeIndex + 1
    : targetRangeIndex;

  while (
    mergeRangeIndex < ranges.length &&
    ranges[mergeRangeIndex].from <= from + items.length
  ) {
    const nextRange = ranges[mergeRangeIndex];

    const nextRangeStart = nextRange.from - finalRange.from;

    finalRange.items.splice(
      nextRangeStart,
      nextRange.items.length,
      ...nextRange.items
    );

    mergeRangeIndex++;
  }

  ranges.splice(
    targetRangeIndex,
    mergeRangeIndex - targetRangeIndex,
    finalRange
  );

  return ranges;
}

export function getFromItemRanges<T>(
  ranges: ItemRanges<T>,
  from: number,
  count: number
): (T | undefined)[] {
  // Find start range index

  const startRangeIndex = findRangeIndex(ranges, from);
  const startRange = ranges[startRangeIndex];

  // Find end range index

  let endRangeIndex = startRangeIndex;

  while (endRangeIndex < ranges.length) {
    const currentRange = ranges[endRangeIndex];

    if (currentRange.from + currentRange.items.length >= from + count) {
      break;
    }

    endRangeIndex++;
  }

  // Include start items

  const resultItems: (T | undefined)[] = new Array(count).fill(undefined);

  if (startRange != null) {
    const startIndex = startRange.from - from;

    const startItems = startRange.items.slice(
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

  for (let i = startRangeIndex + 1; i < endRangeIndex; i++) {
    const currentRange = ranges[i];

    resultItems.splice(
      currentRange.from - from,
      currentRange.items.length,
      ...currentRange.items
    );
  }

  // Include end items

  const endRange = ranges[endRangeIndex];

  if (startRangeIndex !== endRangeIndex && endRange != null) {
    const endItems = endRange.items.slice(0, from + count - endRange.from);

    resultItems.splice(endRange.from - from, endItems.length, ...endItems);
  }

  return resultItems;
}

export function removeFromItemRanges<T>(
  ranges: ItemRanges<T>,
  from: number,
  count: number
): (T | undefined)[] {
  // Find start range index

  const startRangeIndex = findRangeIndex(ranges, from);
  const startRange = ranges[startRangeIndex];

  // Find end range index

  let endRangeIndex = startRangeIndex;

  while (endRangeIndex < ranges.length) {
    const currentRange = ranges[endRangeIndex];

    if (currentRange.from + currentRange.items.length >= from + count) {
      break;
    }

    endRangeIndex++;
  }

  // Remove start items

  const removedItems: (T | undefined)[] = new Array(count).fill(undefined);

  if (startRange != null) {
    const removeStartIndex = startRange.from - from;
    const removedStartItems = startRange.items.splice(
      Math.max(0, -removeStartIndex),
      Math.max(0, count - removeStartIndex)
    );

    removedItems.splice(
      Math.max(0, removeStartIndex),
      removedStartItems.length,
      ...removedStartItems
    );
  }

  // Include ranges in between

  for (let i = startRangeIndex + 1; i < endRangeIndex; i++) {
    const currentRange = ranges[i];

    removedItems.splice(
      currentRange.from - from,
      currentRange.items.length,
      ...currentRange.items
    );
  }

  // Remove end items and range if necessary

  const endRange = ranges[endRangeIndex];

  if (startRangeIndex !== endRangeIndex && endRange != null) {
    const endRemovedItems = endRange.items.splice(
      0,
      from + count - endRange.from
    );

    removedItems.splice(
      endRange.from - from,
      endRemovedItems.length,
      ...endRemovedItems
    );

    if (endRange.items.length === 0) {
      ranges.splice(endRangeIndex, 1);
    } else {
      endRange.from += endRemovedItems.length;
    }
  }

  // Remove ranges in between

  ranges.splice(startRangeIndex + 1, endRangeIndex - startRangeIndex - 1);

  // Remove start range if empty

  if (startRange.items.length === 0) {
    ranges.splice(startRangeIndex, 1);
  }

  return removedItems;
}
