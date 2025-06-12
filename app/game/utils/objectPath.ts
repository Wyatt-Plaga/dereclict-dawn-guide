export function incrementAtPath(obj: any, path: string, amount: number = 1) {
  const parts = path.split('.');
  let ref: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    ref = ref[parts[i]];
  }
  const last = parts[parts.length - 1];
  ref[last] = (ref[last] || 0) + amount;
} 