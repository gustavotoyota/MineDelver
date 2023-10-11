const _bombCountColors = [
  '',
  '#ff0000',
  '#00c000',
  '#6060ff',
  '#000088',
  '#880000',
  '#008888',
  '#880088',
  '#888888',
  '',
];

export function getBombCountColor(count: number): string {
  return _bombCountColors[count];
}
