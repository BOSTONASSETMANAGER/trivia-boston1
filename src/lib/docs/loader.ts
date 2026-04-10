import { promises as fs } from 'fs';
import path from 'path';

const DOCS_ROOT = path.join(process.cwd(), 'docs');

export interface DocEntry {
  slug: string[];
  relativePath: string;
  title: string;
  group: string;
}

function prettifyTitle(filename: string): string {
  const base = filename.replace(/\.md$/i, '');
  const withoutPrefix = base.replace(/^\d+[-_]/, '');
  return withoutPrefix
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function walk(dir: string, rel: string[] = []): Promise<DocEntry[]> {
  const out: DocEntry[] = [];
  let entries: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walk(full, [...rel, entry.name]);
      out.push(...nested);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      const slugParts = [...rel, entry.name.replace(/\.md$/i, '')];
      out.push({
        slug: slugParts,
        relativePath: path.posix.join(...rel, entry.name),
        title: prettifyTitle(entry.name),
        group: rel.length === 0 ? 'Raíz' : rel.join(' / '),
      });
    }
  }
  return out;
}

export async function listDocs(): Promise<DocEntry[]> {
  const all = await walk(DOCS_ROOT);
  return all.sort((a, b) => {
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    return a.relativePath.localeCompare(b.relativePath);
  });
}

export async function readDoc(slug: string[]): Promise<string | null> {
  const safeSlug = slug.map((s) =>
    s.replace(/[^a-zA-Z0-9-_]/g, '')
  );
  if (safeSlug.some((s) => s.length === 0)) return null;

  const filePath = path.join(DOCS_ROOT, ...safeSlug) + '.md';
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(DOCS_ROOT))) return null;

  try {
    return await fs.readFile(resolved, 'utf8');
  } catch {
    return null;
  }
}

export function groupDocs(docs: DocEntry[]): Map<string, DocEntry[]> {
  const grouped = new Map<string, DocEntry[]>();
  for (const doc of docs) {
    const arr = grouped.get(doc.group) ?? [];
    arr.push(doc);
    grouped.set(doc.group, arr);
  }
  return grouped;
}
