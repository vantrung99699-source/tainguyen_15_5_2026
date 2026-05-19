export interface StockResource {
  content: string;
  addedAt: string;
}

export function formatResourceAddedAt(date = new Date()) {
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function createStockResource(content: string): StockResource {
  return { content: content.trim(), addedAt: formatResourceAddedAt() };
}

export function createStockResourcesFromLines(lines: string[]): StockResource[] {
  return lines.filter((l) => l.trim()).map((line) => createStockResource(line));
}

export function normalizeStockResources(resources: StockResource[] | string[]): StockResource[] {
  if (resources.length === 0) return [];
  if (typeof resources[0] === 'string') {
    return (resources as string[]).map((content) => ({
      content,
      addedAt: '—',
    }));
  }
  return resources as StockResource[];
}

export function resourcesToTextLines(resources: StockResource[]) {
  return resources.map((r) => r.content).join('\n');
}
