export function getBombCountColor(count: number): string {
  if (count === 1) {
    return '#ff0000';
  } else if (count === 2) {
    return '#00c000';
  } else if (count === 3) {
    return '#6060ff';
  } else if (count === 4) {
    return '#000088';
  } else if (count === 5) {
    return '#880000';
  } else if (count === 6) {
    return '#008888';
  } else if (count === 7) {
    return '#880088';
  } else if (count === 8) {
    return '#888888';
  } else {
    return '#000000';
  }
}
