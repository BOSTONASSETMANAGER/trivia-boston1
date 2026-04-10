import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { marked } from 'marked';
import { readDoc } from '@/lib/docs/loader';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const last = slug[slug.length - 1] ?? 'Documento';
  const pretty = last.replace(/^\d+[-_]/, '').replace(/[-_]/g, ' ');
  return {
    title: `${pretty} · Docs Trivia Boston`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const raw = await readDoc(slug);
  if (raw === null) notFound();

  marked.setOptions({ gfm: true, breaks: false });
  const html = await marked.parse(raw);

  const breadcrumb = slug.join(' / ');

  return (
    <main className="relative z-10 min-h-[100dvh] bg-surface px-6 py-10 text-on-surface">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-xs text-outline hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Todos los documentos
          </Link>
          <span className="font-mono text-[11px] text-outline/50">
            {breadcrumb}
          </span>
        </div>

        <div className="divider-glow mb-8 w-full" />

        <article
          className="prose prose-invert prose-neutral max-w-none
            prose-headings:font-headline prose-headings:tracking-tight
            prose-h1:text-4xl prose-h1:font-bold prose-h1:text-on-surface
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-primary prose-h2:mt-10 prose-h2:border-b prose-h2:border-outline-variant/20 prose-h2:pb-2
            prose-h3:text-xl prose-h3:text-on-surface prose-h3:mt-8
            prose-p:text-on-surface/85 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-on-surface prose-strong:font-semibold
            prose-code:text-secondary prose-code:before:content-none prose-code:after:content-none prose-code:bg-surface-variant/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono
            prose-pre:bg-surface-container prose-pre:border prose-pre:border-outline-variant/20 prose-pre:rounded-xl prose-pre:text-sm
            prose-blockquote:border-l-primary prose-blockquote:bg-surface-variant/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-outline
            prose-hr:border-outline-variant/20
            prose-li:text-on-surface/85 prose-li:marker:text-primary/50
            prose-table:text-sm
            prose-th:text-primary prose-th:border-outline-variant/30
            prose-td:border-outline-variant/20"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16 flex items-center justify-between text-[11px] text-outline/50">
          <Link href="/docs" className="hover:text-primary transition-colors">
            ← Volver al índice
          </Link>
          <span className="tracking-wider">BOSTON ASSET MANAGER SA</span>
        </div>
      </div>
    </main>
  );
}
