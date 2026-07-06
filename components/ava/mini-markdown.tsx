'use client';

/** Renderiza formatação markdown em linha (negrito, itálico, código). */
export function InlineMarkdown({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith('**') && tok.endsWith('**'))
          return <strong key={i}>{tok.slice(2, -2)}</strong>;
        if (tok.startsWith('*') && tok.endsWith('*'))
          return <em key={i}>{tok.slice(1, -1)}</em>;
        if (tok.startsWith('`') && tok.endsWith('`'))
          return (
            <code
              key={i}
              className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[11px] font-mono"
            >
              {tok.slice(1, -1)}
            </code>
          );
        return <span key={i}>{tok}</span>;
      })}
    </>
  );
}

/** Renderiza um bloco de markdown com parágrafos, cabeçalhos, listas e numeração. */
export function MiniMarkdown({ text, accentColor }: { text: string; accentColor?: string }) {
  const color = accentColor ?? '#1D9E75';
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length === 0) return null;
        const firstLine = lines[0];

        if (/^#{2,3}\s/.test(firstLine)) {
          return (
            <p key={bi} className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 mt-1">
              <InlineMarkdown text={firstLine.replace(/^#{2,3}\s/, '')} />
            </p>
          );
        }

        if (lines.every((l) => /^[-*•]\s/.test(l.trim()))) {
          return (
            <ul key={bi} className="list-none space-y-0.5 pl-1">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-1.5 items-start text-[12px] leading-relaxed">
                  <span
                    className="mt-[3px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <InlineMarkdown text={l.replace(/^[-*•]\s/, '').trim()} />
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={bi} className="list-decimal list-inside space-y-0.5 pl-0.5">
              {lines.map((l, li) => (
                <li key={li} className="text-[12px] leading-relaxed">
                  <InlineMarkdown text={l.replace(/^\d+\.\s/, '').trim()} />
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={bi} className="text-[12px] leading-relaxed">
            <InlineMarkdown text={lines.join(' ')} />
          </p>
        );
      })}
    </div>
  );
}
