export function isRequired(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

export function isInRange(value: number, min: number, max: number): boolean {
  return isNumber(value) && value >= min && value <= max;
}

export function isPositiveInteger(value: any): boolean {
  return Number.isInteger(value) && value > 0;
}