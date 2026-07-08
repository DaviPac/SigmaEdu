'use client';

import React from 'react';

/** Props para o componente MiniMarkdown. */
interface MiniMarkdownProps {
  text: string;
  bulletColor?: string;
}

/** Renderiza formatação inline como negrito, itálico e códigos/fórmulas com destaque. */
export function InlineMarkdown({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith('**') && tok.endsWith('**')) {
          const content = tok.slice(2, -2);
          return (
            <strong
              key={i}
              className="font-semibold px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 font-sans"
            >
              {content}
            </strong>
          );
        }
        if (tok.startsWith('*') && tok.endsWith('*')) {
          return (
            <em key={i} className="not-pre-wrap">
              {tok.slice(1, -1)}
            </em>
          );
        }
        if (tok.startsWith('`') && tok.endsWith('`')) {
          const content = tok.slice(1, -1);
          return (
            <code
              key={i}
              className="mx-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/60 break-all"
            >
              {content}
            </code>
          );
        }
        return <span key={i}>{tok}</span>;
      })}
    </>
  );
}

/** Renderiza formatação markdown em blocos com design premium e suporte a blockquotes. */
export default function MiniMarkdown({ text, bulletColor = '#7E22CE' }: MiniMarkdownProps) {
  const normalizedText = text.replace(/\r\n/g, '\n');
  const rawBlocks = normalizedText.split(/\n{2,}/);

  return (
    <div className="space-y-3.5 text-gray-700 dark:text-gray-300">
      {rawBlocks.map((block, bi) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        // 1. Headers: ###
        if (trimmedBlock.startsWith('#')) {
          const match = trimmedBlock.match(/^(#{1,6})\s+(.*)$/);
          if (match) {
            const level = match[1].length;
            const content = match[2];
            const sizeClass =
              level === 1
                ? 'text-[15px] font-bold'
                : level === 2
                  ? 'text-[14px] font-bold'
                  : 'text-[13px] font-semibold';
            return (
              <div
                key={bi}
                className={`${sizeClass} text-violet-900 dark:text-violet-300 border-b border-violet-100 dark:border-violet-850 pb-1 mt-4`}
              >
                <InlineMarkdown text={content} />
              </div>
            );
          }
        }

        // 2. Blockquotes (Questões do ENEM e explicações importantes)
        if (trimmedBlock.startsWith('>')) {
          const lines = trimmedBlock.split('\n');
          const paragraphTexts: string[] = [];
          let currentParagraph = '';

          for (const line of lines) {
            const cleanLine = line.replace(/^>\s?/, '');
            if (cleanLine.trim() === '') {
              if (currentParagraph) {
                paragraphTexts.push(currentParagraph.trim());
                currentParagraph = '';
              }
            } else {
              currentParagraph += (currentParagraph ? ' ' : '') + cleanLine.trim();
            }
          }
          if (currentParagraph) {
            paragraphTexts.push(currentParagraph.trim());
          }

          return (
            <blockquote
              key={bi}
              className="border-l-4 border-violet-500 bg-violet-50/40 dark:bg-violet-950/15 p-4 rounded-r-lg my-3.5 space-y-2.5 text-gray-855 dark:text-gray-250 shadow-sm"
            >
              {paragraphTexts.map((pText, pi) => (
                <p key={pi} className="text-[12px] leading-relaxed break-words whitespace-pre-wrap">
                  <InlineMarkdown text={pText} />
                </p>
              ))}
            </blockquote>
          );
        }

        // 3. Unordered Lists
        const lines = trimmedBlock.split('\n');
        if (lines.every((l) => /^[-*•]\s/.test(l.trim()))) {
          return (
            <ul key={bi} className="list-none space-y-2 pl-1.5 my-2">
              {lines.map((l, li) => (
                <li
                  key={li}
                  className="flex gap-2.5 items-start text-[12px] leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  <span
                    className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: bulletColor }}
                  />
                  <span className="flex-1">
                    <InlineMarkdown text={l.replace(/^[-*•]\s/, '').trim()} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // 4. Ordered Lists
        if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={bi} className="space-y-2 pl-1.5 my-2">
              {lines.map((l, li) => {
                const cleanText = l.replace(/^\d+\.\s/, '').trim();
                const number = l.match(/^(\d+)\./)?.[1] || (li + 1).toString();
                return (
                  <li
                    key={li}
                    className="flex gap-2.5 items-start text-[12px] leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    <span className="font-bold text-violet-750 dark:text-violet-400 text-[11px] mt-[1.5px] w-4 text-right">
                      {number}.
                    </span>
                    <span className="flex-1">
                      <InlineMarkdown text={cleanText} />
                    </span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // 5. Default Paragraph
        return (
          <p key={bi} className="text-[12px] leading-relaxed text-gray-750 dark:text-gray-350">
            <InlineMarkdown text={lines.join(' ')} />
          </p>
        );
      })}
    </div>
  );
}
