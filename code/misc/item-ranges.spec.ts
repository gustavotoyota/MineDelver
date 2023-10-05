import { describe, expect, it } from "vitest";
import {
  ItemRanges,
  addToItemRanges,
  getFromItemRanges,
  removeFromItemRanges,
} from "./item-ranges";

describe("ItemRanges", () => {
  describe("Insertion", () => {
    it("should add a range to an empty list", () => {
      const ranges: ItemRanges<number> = [];

      addToItemRanges(ranges, 2, [1, 2, 3]);

      expect(ranges).toEqual([{ from: 2, items: [1, 2, 3] }]);
    });

    it("should merge a range at the start of an existing one", () => {
      const ranges: ItemRanges<number> = [{ from: 4, items: [4, 5, 6] }];

      addToItemRanges(ranges, 2, [1, 2, 3]);

      expect(ranges).toEqual([{ from: 2, items: [1, 2, 4, 5, 6] }]);
    });

    it("should merge a range at the end of an existing one", () => {
      const ranges: ItemRanges<number> = [{ from: 2, items: [1, 2, 3] }];

      addToItemRanges(ranges, 4, [4, 5, 6]);

      expect(ranges).toEqual([{ from: 2, items: [1, 2, 4, 5, 6] }]);
    });

    it("should merge with multiple existing ranges", () => {
      const ranges: ItemRanges<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 6, items: [6, 7, 8] },
      ];

      addToItemRanges(ranges, 3, [3, 4, 5, 6]);

      expect(ranges).toEqual([{ from: 1, items: [1, 2, 3, 4, 5, 6, 7, 8] }]);
    });

    it("should keep separate ranges", () => {
      const ranges: ItemRanges<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 7, items: [7, 8, 9] },
      ];

      addToItemRanges(ranges, 5, [5]);

      expect(ranges).toEqual([
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5] },
        { from: 7, items: [7, 8, 9] },
      ]);
    });
  });

  describe("Querying", () => {
    it("should query the start of this range", () => {
      const ranges: ItemRanges<number> = [{ from: 1, items: [1, 2, 3] }];

      const items = getFromItemRanges(ranges, 0, 3);

      expect(items).toEqual([undefined, 1, 2]);
    });

    it("should query the end of this range", () => {
      const ranges: ItemRanges<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
      ];

      const items = getFromItemRanges(ranges, 2, 3);

      expect(items).toEqual([2, 3, undefined]);
    });

    it("should query this wide range", () => {
      const ranges: ItemRanges<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const items = getFromItemRanges(ranges, 3, 7);

      expect(items).toEqual([3, undefined, 5, 6, 7, undefined, 9]);
    });
  });

  describe("Deletion", () => {
    it("should not remove the start of this range", () => {
      const ranges: ItemRanges<number> = [{ from: 1, items: [1, 2, 3] }];

      const removedItems = removeFromItemRanges(ranges, -1, 2);

      expect(ranges).toEqual([{ from: 1, items: [1, 2, 3] }]);
      expect(removedItems).toEqual([undefined, undefined]);
    });

    it("should remove the start of this range", () => {
      const ranges: ItemRanges<number> = [{ from: 1, items: [1, 2, 3] }];

      const removedItems = removeFromItemRanges(ranges, 0, 3);

      expect(ranges).toEqual([{ from: 1, items: [3] }]);
      expect(removedItems).toEqual([undefined, 1, 2]);
    });

    it("should remove the end of this range", () => {
      const ranges: ItemRanges<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
      ];

      const removedItems = removeFromItemRanges(ranges, 2, 3);

      expect(ranges).toEqual([
        { from: 1, items: [1] },
        { from: 5, items: [5, 6, 7] },
      ]);
      expect(removedItems).toEqual([2, 3, undefined]);
    });

    it("should remove this range completely", () => {
      const ranges: ItemRanges<number> = [{ from: 1, items: [1, 2, 3] }];

      const removedItems = removeFromItemRanges(ranges, 0, 5);

      expect(ranges).toEqual([]);
      expect(removedItems).toEqual([undefined, 1, 2, 3, undefined]);
    });

    it("should remove this wide range", () => {
      const ranges: ItemRanges<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const removedItems = removeFromItemRanges(ranges, 3, 7);

      expect(ranges).toEqual([
        { from: 1, items: [1, 2] },
        { from: 10, items: [10, 11] },
      ]);
      expect(removedItems).toEqual([3, undefined, 5, 6, 7, undefined, 9]);
    });

    it("should remove the center range only", () => {
      const ranges: ItemRanges<number> = [
        { from: 1, items: [1, 2, 3] },
        { from: 5, items: [5, 6, 7] },
        { from: 9, items: [9, 10, 11] },
      ];

      const removedItems = removeFromItemRanges(ranges, 4, 5);

      expect(ranges).toEqual([
        { from: 1, items: [1, 2, 3] },
        { from: 9, items: [9, 10, 11] },
      ]);
      expect(removedItems).toEqual([undefined, 5, 6, 7, undefined]);
    });
  });
});
