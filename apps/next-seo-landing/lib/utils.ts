type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassValue[]
  | { [key: string]: any };

const toClassName = (value: ClassValue): string => {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(toClassName).filter(Boolean).join(' ');
  if (typeof value === 'object') return Object.keys(value).filter((k) => (value as any)[k]).join(' ');
  return '';
};

export function cn(...inputs: ClassValue[]): string {
  return inputs.map(toClassName).filter(Boolean).join(' ');
}
