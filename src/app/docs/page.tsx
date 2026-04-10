import Link from 'next/link';
import { FileText, FolderOpen, ArrowRight } from 'lucide-react';
import { listDocs, groupDocs } from '@/lib/docs/loader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Documentación · Trivia Boston',
};

export default async function DocsIndexPage() {
  const docs = await listDocs();
  const grouped = groupDocs(docs);

  return (
    <main className="relative z-10 min-h-[100dvh] bg-surface px-6 py-12 text-on-surface">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/60">
            Boston Asset Manager
          </p>
          <h1 className="font-headline text-4xl font-bold tracking-tight">
            Documentación
          </h1>
          <div className="divider-glow mt-4 w-24" />
          <p className="mt-4 text-sm text-outline">
            Planes de implementación, features y referencias técnicas del
            proyecto Trivia Boston.
          </p>
        </div>

        {grouped.size === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-sm text-outline">
            No hay documentos todavía. Agregá archivos <code>.md</code> en la
            carpeta <code>docs/</code>.
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([group, items]) => (
              <section key={group}>
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary/70">
                  <FolderOpen className="h-3.5 w-3.5" />
                  {group}
                </div>
                <ul className="space-y-2">
                  {items.map((doc) => (
                    <li key={doc.relativePath}>
                      <Link
                        href={`/docs/${doc.slug.join('/')}`}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-outline-variant/20 bg-surface-variant/20 px-4 py-3 transition-all hover:border-primary/40 hover:bg-surface-variant/30"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText className="h-4 w-4 shrink-0 text-primary/70" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">
                              {doc.title}
                            </p>
                            <p className="truncate font-mono text-[11px] text-outline/60">
                              {doc.relativePath}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-outline/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="mt-12 flex items-center justify-between text-[11px] text-outline/50">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Volver al juego
          </Link>
          <span className="tracking-wider">BOSTON ASSET MANAGER SA</span>
        </div>
      </div>
    </main>
  );
}
