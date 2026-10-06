export type MemoryItem = { role: "user" | "assistant"; content: string };
const KEY = "study-memory-v1";

export function loadMemory(): MemoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function remember(question: string, answer: string) {
  const items = [...loadMemory(), { role: "user" as const, content: question }, { role: "assistant" as const, content: answer }];
  localStorage.setItem(KEY, JSON.stringify(items.slice(-20)));
}

export function clearMemory() {
  localStorage.removeItem(KEY);
}
