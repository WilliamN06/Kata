export function getPartialFrequency(
  fundamental: number,
  index: number,
  spacing: 'harmonic' | 'inharmonic' | 'stretched' | 'compressed',
): number {
  switch (spacing) {
    case 'harmonic':
      return fundamental * index;
    case 'inharmonic':
      return fundamental * (index + Math.random() * 0.5);
    case 'stretched': {
      const B = 0.0001;
      return fundamental * index * Math.sqrt(1 + B * index * index);
    }
    case 'compressed':
      return fundamental * index * Math.sqrt(1 - 0.00005 * index * index);
  }
}

export function getPartialMagnitude(
  index: number,
  total: number,
  distribution: 'flat' | 'exponential' | 'gaussian' | 'random',
): number {
  switch (distribution) {
    case 'flat':
      return 1;
    case 'exponential':
      return Math.pow(0.85, index);
    case 'gaussian':
      return Math.exp(-Math.pow((index - total / 2) / (total / 4), 2));
    case 'random':
      return Math.random();
  }
}
