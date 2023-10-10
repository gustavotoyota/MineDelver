import { describe, expect, it } from 'vitest';

import {
  getItemsFromSegments,
  getSliceFromSegments,
  putItemsInSegments,
  removeItemsFromSegments,
  Segments,
} from './segments';

describe('Segments', () => {
  describe('Insertion', () => {
    it('should add a segment to an empty list', () => {
      const segments: Segments<number> = [];

      putItemsInSegments(segments, 2, [1, 2, 3]);

      expect(segments).toEqual([{ from: 2, items: [1, 2, 3] }]);
    });

    it('should merge a segment at the start of an existing one', () => {
      const segments: Segments<number> = [{ from: 4, items: [4, 5, 6] }];

      putItemsInSegments(segments, 2, [1, 2, 3]);

      expect(segments).toEqual([{ from: 2, items: [1, 2, 4, 5, 6] }]);
    });

    it('should merge a segment at the end of an existing one', () => {
      const segments: Segments<number> = [{ from: 2, items: [1, 2, 3] }];

      putItemsInSegments(segments, 4, [4, 5, 6]);

      expect(segments).toEqual([{ from: 2, items: [1, 2, 4, 5, 6] }]);
    });

    it('should merge with multiple existing segments', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 6, items: [6, 7, 8] },
      ];

      putItemsInSegments(segments, 3, [3, 4, 5, 6]);

      expect(segments).toEqual([{ from: 1, items: [1, 2, 3, 4, 5, 6, 7, 8] }]);
    });

    it('should keep separate segments', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 7, items: [7, 8, 9] },
      ];

      putItemsInSegments(segments, 5, [5]);

      expect(segments).toEqual([
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5] },
        { from: 7, items: [7, 8, 9] },
      ]);
    });
  });

  describe('Slicing', () => {
    it('should slice the center segment only', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const items = getSliceFromSegments(segments, 5, { count: 3 });

      expect(items).toEqual([{ from: 5, items: [5, 6, 7] }]);
    });

    it('should slice the center segment only 2', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const items = getSliceFromSegments(segments, 4, { count: 5 });

      expect(items).toEqual([{ from: 5, items: [5, 6, 7] }]);
    });

    it('should slice in the middle of segments in this case', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const items = getSliceFromSegments(segments, 3, { count: 7 });

      expect(items).toEqual([
        { from: 3, items: [3] },
        {
          from: 5,
          items: [5, 6, 7],
        },
        {
          from: 9,
          items: [9],
        },
      ]);
    });
  });

  describe('Querying', () => {
    it('should query the start of this segment', () => {
      const segments: Segments<number> = [{ from: 1, items: [1, 2, 3] }];

      const items = getItemsFromSegments(segments, 0, { count: 3 });

      expect(items).toEqual([undefined, 1, 2]);
    });

    it('should query the end of this segment', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
      ];

      const items = getItemsFromSegments(segments, 2, { count: 3 });

      expect(items).toEqual([2, 3, undefined]);
    });

    it('should query the center segment only', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const items = getItemsFromSegments(segments, 5, { count: 3 });

      expect(items).toEqual([5, 6, 7]);
    });

    it('should query the center segment only 2', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const items = getItemsFromSegments(segments, 4, { count: 5 });

      expect(items).toEqual([undefined, 5, 6, 7, undefined]);
    });

    it('should query this wide segment', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const items = getItemsFromSegments(segments, 3, { count: 7 });

      expect(items).toEqual([3, undefined, 5, 6, 7, undefined, 9]);
    });
  });

  describe('Deletion', () => {
    it('should not remove the start of this segment', () => {
      const segments: Segments<number> = [{ from: 1, items: [1, 2, 3] }];

      const removedItems = removeItemsFromSegments(segments, -1, { count: 2 });

      expect(segments).toEqual([{ from: 1, items: [1, 2, 3] }]);
      expect(removedItems).toEqual([undefined, undefined]);
    });

    it('should remove the start of this segment', () => {
      const segments: Segments<number> = [{ from: 1, items: [1, 2, 3] }];

      const removedItems = removeItemsFromSegments(segments, 0, { count: 3 });

      expect(segments).toEqual([{ from: 1, items: [3] }]);
      expect(removedItems).toEqual([undefined, 1, 2]);
    });

    it('should remove the end of this segment', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
      ];

      const removedItems = removeItemsFromSegments(segments, 2, { count: 3 });

      expect(segments).toEqual([
        { from: 1, items: [1] },
        { from: 5, items: [5, 6, 7] },
      ]);
      expect(removedItems).toEqual([2, 3, undefined]);
    });

    it('should remove this segment completely', () => {
      const segments: Segments<number> = [{ from: 1, items: [1, 2, 3] }];

      const removedItems = removeItemsFromSegments(segments, 0, { count: 5 });

      expect(segments).toEqual([]);
      expect(removedItems).toEqual([undefined, 1, 2, 3, undefined]);
    });

    it('should remove this wide segment', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const removedItems = removeItemsFromSegments(segments, 3, { count: 7 });

      expect(segments).toEqual([
        { from: 1, items: [1, 2] },
        { from: 10, items: [10, 11] },
      ]);
      expect(removedItems).toEqual([3, undefined, 5, 6, 7, undefined, 9]);
    });

    it('should remove the center segment only', () => {
      const segments: Segments<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const removedItems = removeItemsFromSegments(segments, 4, { count: 5 });

      expect(segments).toEqual([
        { from: 1, items: [1, 2, 3] },
        { from: 9, items: [9, 10, 11] },
      ]);
      expect(removedItems).toEqual([undefined, 5, 6, 7, undefined]);
    });
  });
});
