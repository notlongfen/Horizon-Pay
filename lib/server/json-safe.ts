import "server-only";

function replacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

export function jsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, replacer)) as T;
}
