'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/** Props para o componente MiniMarkdown. */
interface MiniMarkdownProps {
  text: string;
  bulletColor?: string;
}

/** Renderiza fórmula matemática usando KaTeX de forma segura. */
function LateXMath({ formula, displayMode = false }: { formula: string; displayMode?: boolean }) {
  let html = '';
  let errorMsg = '';
  try {
    html = katex.renderToString(formula, {
      displayMode,
      throwOnError: false,
    });
  } catch (error) {
    errorMsg = String(error);
  }

  if (errorMsg) {
    return <code className="font-mono text-red-500">{formula}</code>;
  }

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Renderiza formatação inline como negrito, itálico e códigos/fórmulas com destaque. */
export function InlineMarkdown({ text }: { text: string }) {
  // Regex splitting:
  // 1. Bold: **text**
  // 2. Italic: *text*
  // 3. Inline code: `text`
  // 4. LaTeX block math: $$formula$$ or \[formula\]
  // 5. LaTeX inline math: $formula$ or \(formula\)
  const tokens = text.split(
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\$\$.+?\$\$|\$.+?\$|\\\[.+?\\\]|\\\(.+?\\\))/g,
  );

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

        // LaTeX Block Math: $$...$$ or \[...\]
        if (
          (tok.startsWith('$$') && tok.endsWith('$$')) ||
          (tok.startsWith('\\[') && tok.endsWith('\\]'))
        ) {
          const content = tok.startsWith('$$') ? tok.slice(2, -2) : tok.slice(2, -2);
          return (
            <div
              key={i}
              className="my-3 p-3 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-800/40 rounded-lg text-center overflow-x-auto shadow-sm"
            >
              <LateXMath formula={content} displayMode={true} />
            </div>
          );
        }

        // LaTeX Inline Math: $...$ or \(...\)
        if (
          (tok.startsWith('$') && tok.endsWith('$') && tok.length > 2) ||
          (tok.startsWith('\\(') && tok.endsWith('\\)'))
        ) {
          const content = tok.startsWith('$') ? tok.slice(1, -1) : tok.slice(2, -2);
          return (
            <span
              key={i}
              className="mx-0.5 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/60 inline-flex items-center shadow-sm"
            >
              <LateXMath formula={content} displayMode={false} />
            </span>
          );
        }

        return <span key={i}>{tok}</span>;
      })}
    </>
  );
}

/** Definição de bloco de conteúdo Markdown. */
interface Block {
  type: 'paragraph' | 'heading' | 'blockquote' | 'ul' | 'ol' | 'hr';
  lines: string[];
  level?: number;
}

/** Estrutura de agrupamento sob cabeçalhos para indentação. */
interface BlockGroup {
  headerBlock: Block | null;
  contentBlocks: Block[];
}

/** Converte a árvore de nós do DOM nativo do navegador para elementos React com InlineMarkdown. */
function domToReact(node: Node, bulletColor: string): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue || '';
    if (text.trim() === '') return text;

    const hasMarkdownBlocks =
      text.includes('---') ||
      text.includes('***') ||
      /(?:^|\n)#+\s/.test(text) ||
      /(?:^|\n)>\s/.test(text) ||
      /(?:^|\n)\s*[-*•]\s/.test(text) ||
      /(?:^|\n)\s*\d+\.\s/.test(text);

    if (hasMarkdownBlocks) {
      return <MiniMarkdown key={Math.random()} text={text} bulletColor={bulletColor} />;
    } else {
      return <InlineMarkdown key={Math.random()} text={text} />;
    }
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const children = Array.from(element.childNodes).map((child) => domToReact(child, bulletColor));

    const className = element.getAttribute('class') || undefined;
    const styleAttr = element.getAttribute('style') || undefined;

    let style: React.CSSProperties | undefined = undefined;
    if (styleAttr) {
      style = {};
      styleAttr.split(';').forEach((pair) => {
        const [k, v] = pair.split(':');
        if (k && v) {
          const camelKey = k.trim().replace(/-./g, (x) => x[1].toUpperCase());
          (style as Record<string, string>)[camelKey] = v.trim();
        }
      });
    }

    const key = Math.random();

    switch (tagName) {
      case 'div': {
        const groupedChildren = groupElements(children, bulletColor);
        return (
          <div key={key} className={className} style={style}>
            {groupedChildren}
          </div>
        );
      }
      case 'span':
        return (
          <span key={key} className={className} style={style}>
            {children}
          </span>
        );
      case 'p':
        return (
          <p key={key} className={className} style={style}>
            {children}
          </p>
        );
      case 'h3':
        return (
          <h3
            key={key}
            className={`${className || ''} text-[16px] font-bold text-violet-850 dark:text-violet-200 mt-7 first:mt-0 mb-3`}
            style={style}
          >
            {children}
          </h3>
        );
      case 'h4':
        return (
          <h4
            key={key}
            className={`${className || ''} text-[15px] font-bold text-violet-900 dark:text-violet-250 mt-5 first:mt-0 mb-2.5`}
            style={style}
          >
            {children}
          </h4>
        );
      case 'ul':
        return (
          <ul key={key} className={className} style={style}>
            {children}
          </ul>
        );
      case 'ol':
        return (
          <ol key={key} className={className} style={style}>
            {children}
          </ol>
        );
      case 'li':
        return (
          <li key={key} className={className} style={style}>
            {children}
          </li>
        );
      case 'blockquote':
        return (
          <blockquote key={key} className={className} style={style}>
            {children}
          </blockquote>
        );
      case 'hr':
        return <hr key={key} className={className} style={style} />;
      case 'code':
        return (
          <code key={key} className={className} style={style}>
            {children}
          </code>
        );
      case 'strong':
        return (
          <strong key={key} className={className} style={style}>
            {children}
          </strong>
        );
      case 'em':
        return (
          <em key={key} className={className} style={style}>
            {children}
          </em>
        );
      default:
        return <span key={key}>{children}</span>;
    }
  }

  return null;
}

/** Agrupa e indenta os elementos filhos que sucedem um cabeçalho no HTML. */
function groupElements(elements: React.ReactNode[], bulletColor: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let currentGroup: { header: React.ReactNode; body: React.ReactNode[] } | null = null;

  for (const el of elements) {
    if (!el) continue;

    const isHeading =
      React.isValidElement(el) &&
      (el.type === 'h1' ||
        el.type === 'h2' ||
        el.type === 'h3' ||
        el.type === 'h4' ||
        el.type === 'h5' ||
        el.type === 'h6' ||
        (el.type === 'div' &&
          ((el as React.ReactElement<{ className?: string }>).props.className?.includes(
            'text-[16px]',
          ) ||
            (el as React.ReactElement<{ className?: string }>).props.className?.includes(
              'text-[17px]',
            ) ||
            (el as React.ReactElement<{ className?: string }>).props.className?.includes(
              'text-[18px]',
            ))));

    if (isHeading) {
      if (currentGroup) {
        result.push(currentGroup.header);
        if (currentGroup.body.length > 0) {
          result.push(
            <div
              key={Math.random()}
              className="pl-4 sm:pl-5 border-l-2 border-purple-100 dark:border-purple-900/30 ml-2 space-y-3.5 animate-fadeIn"
            >
              {currentGroup.body}
            </div>,
          );
        }
      }
      currentGroup = { header: el, body: [] };
    } else {
      if (currentGroup) {
        currentGroup.body.push(el);
      } else {
        result.push(el);
      }
    }
  }

  if (currentGroup) {
    result.push(currentGroup.header);
    if (currentGroup.body.length > 0) {
      result.push(
        <div
          key={Math.random()}
          className="pl-4 sm:pl-5 border-l-2 border-purple-100 dark:border-purple-900/30 ml-2 space-y-3.5 animate-fadeIn"
        >
          {currentGroup.body}
        </div>,
      );
    }
  }

  return result;
}

/** Faz o parsing seguro do HTML usando DOMParser no cliente e retorna elementos React com indentação hierárquica. */
function parseHTMLToReact(html: string, bulletColor: string): React.ReactNode {
  if (typeof window === 'undefined') {
    return null;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const children = Array.from(doc.body.childNodes).map((child) => domToReact(child, bulletColor));
  return groupElements(children, bulletColor);
}

/** Renderiza formatação markdown em blocos com design premium e suporte a blockquotes. */
export function MiniMarkdown({ text, bulletColor = '#7E22CE' }: MiniMarkdownProps) {
  const trimmed = text.trim();

  // Se for uma estrutura HTML, realiza o parsing via DOMParser para renderizar InlineMarkdown nos nós de texto
  if (trimmed.startsWith('<div')) {
    return <>{parseHTMLToReact(trimmed, bulletColor)}</>;
  }

  const normalizedText = text.replace(/\r\n/g, '\n');
  const rawLines = normalizedText.split('\n');

  const blocks: Block[] = [];
  let currentBlock: Block | null = null;

  for (const line of rawLines) {
    const trimmedLine = line.trim();

    // 1. Horizontal Rule
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      blocks.push({ type: 'hr', lines: [] });
      continue;
    }

    // 2. Heading
    const isSpecialHeading =
      /^\s*\d+\.\s*(Teoria Direcionada|A Questão Base|Resolução Passo a Passo|Desafio de Fixação)/i.test(
        line,
      );
    if (trimmedLine.startsWith('#') || isSpecialHeading) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      const cleanContent = trimmedLine.replace(/^#+\s*/, '');
      const level = trimmedLine.startsWith('#') ? trimmedLine.match(/^(#+)/)?.[1].length || 3 : 3;
      blocks.push({
        type: 'heading',
        level,
        lines: [cleanContent],
      });
      continue;
    }

    // 3. Blockquote
    if (line.startsWith('>') || trimmedLine.startsWith('>')) {
      const content = line.replace(/^\s*>\s?/, '');
      if (currentBlock && currentBlock.type === 'blockquote') {
        currentBlock.lines.push(content);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'blockquote', lines: [content] };
      }
      continue;
    }

    // 4. Unordered List Item
    if (/^\s*[-*•]\s/.test(line)) {
      const content = line.replace(/^\s*[-*•]\s/, '');
      if (currentBlock && currentBlock.type === 'ul') {
        currentBlock.lines.push(content);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'ul', lines: [content] };
      }
      continue;
    }

    // 5. Ordered List Item
    if (/^\s*\d+\.\s/.test(line)) {
      const content = line.replace(/^\s*\d+\.\s/, '');
      if (currentBlock && currentBlock.type === 'ol') {
        currentBlock.lines.push(content);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'ol', lines: [content] };
      }
      continue;
    }

    // 6. Empty Line
    if (trimmedLine === '') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // 7. Regular Paragraph Text
    if (currentBlock && currentBlock.type === 'paragraph') {
      currentBlock.lines.push(line);
    } else {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = { type: 'paragraph', lines: [line] };
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  // Agrupa os blocos sob seus cabeçalhos para aplicar o visual hierárquico
  const groups: BlockGroup[] = [];
  let currentGroup: BlockGroup = { headerBlock: null, contentBlocks: [] };

  for (const block of blocks) {
    if (block.type === 'heading') {
      if (currentGroup.headerBlock || currentGroup.contentBlocks.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = { headerBlock: block, contentBlocks: [] };
    } else {
      currentGroup.contentBlocks.push(block);
    }
  }
  if (currentGroup.headerBlock || currentGroup.contentBlocks.length > 0) {
    groups.push(currentGroup);
  }

  /** Renderiza o conteúdo do bloco individualmente. */
  const renderBlockContent = (block: Block, key: string | number) => {
    switch (block.type) {
      case 'hr':
        return <hr key={key} className="my-5 border-t border-gray-200 dark:border-gray-800" />;

      case 'heading': {
        const content = block.lines[0];
        const level = block.level || 3;
        const sizeClass =
          level === 1
            ? 'text-[17px] font-bold'
            : level === 2
              ? 'text-[16px] font-bold'
              : 'text-[15px] font-bold';
        return (
          <div
            key={key}
            className={`${sizeClass} text-violet-800 dark:text-violet-200 border-b border-violet-100 dark:border-violet-800/60 pb-1.5 mt-7 mb-3`}
          >
            <InlineMarkdown text={content} />
          </div>
        );
      }

      case 'blockquote': {
        const paragraphs: string[] = [];
        let currentParagraph = '';
        for (const line of block.lines) {
          if (line.trim() === '') {
            if (currentParagraph) {
              paragraphs.push(currentParagraph.trim());
              currentParagraph = '';
            }
          } else {
            currentParagraph += (currentParagraph ? ' ' : '') + line.trim();
          }
        }
        if (currentParagraph) {
          paragraphs.push(currentParagraph.trim());
        }

        return (
          <blockquote
            key={key}
            className="border-l-4 border-violet-500 bg-violet-50/40 dark:bg-violet-950/15 p-4 rounded-r-lg my-3.5 space-y-2.5 text-gray-855 dark:text-gray-250 shadow-sm"
          >
            {paragraphs.map((pText, pi) => (
              <p key={pi} className="text-[12px] leading-relaxed break-words whitespace-pre-wrap">
                <InlineMarkdown text={pText} />
              </p>
            ))}
          </blockquote>
        );
      }

      case 'ul':
        return (
          <ul key={key} className="list-none space-y-2 pl-1.5 my-2">
            {block.lines.map((line, li) => (
              <li
                key={li}
                className="flex gap-2.5 items-start text-[12px] leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span
                  className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: bulletColor }}
                />
                <span className="flex-1">
                  <InlineMarkdown text={line} />
                </span>
              </li>
            ))}
          </ul>
        );

      case 'ol':
        return (
          <ol key={key} className="space-y-2 pl-1.5 my-2">
            {block.lines.map((line, li) => (
              <li
                key={li}
                className="flex gap-2.5 items-start text-[12px] leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span className="font-bold text-violet-750 dark:text-violet-400 text-[11px] mt-[1.5px] w-4 text-right">
                  {li + 1}.
                </span>
                <span className="flex-1">
                  <InlineMarkdown text={line} />
                </span>
              </li>
            ))}
          </ol>
        );

      case 'paragraph':
        return (
          <p key={key} className="text-[12px] leading-relaxed text-gray-750 dark:text-gray-350">
            <InlineMarkdown text={block.lines.join(' ')} />
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 text-gray-700 dark:text-gray-300">
      {groups.map((group, gi) => (
        <div key={gi} className="space-y-3">
          {/* Cabeçalho do tópico (Roxo / Alinhado totalmente à esquerda) */}
          {group.headerBlock && renderBlockContent(group.headerBlock, gi)}

          {/* Sub-tópicos/Conteúdo (Laranja / Com recuo e linha de guia vertical) */}
          {group.contentBlocks.length > 0 && (
            <div
              className={
                group.headerBlock
                  ? 'pl-4 sm:pl-5 border-l-2 border-purple-150 dark:border-purple-900/30 ml-2 space-y-3.5'
                  : 'space-y-3.5'
              }
            >
              {group.contentBlocks.map((block, bi) => renderBlockContent(block, `${gi}-${bi}`))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
export default MiniMarkdown;
