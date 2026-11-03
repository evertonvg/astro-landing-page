import { marked } from 'marked';

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

export interface RenderedFaqItem {
  question: string;
  answerHtml: string;
  answerText: string;
}

/** Renders Markdown answers to HTML at build time and derives plain text for JSON-LD. */
export function renderFaqItems(items: { question: string; answer: string }[]): RenderedFaqItem[] {
  return items.map(({ question, answer }) => {
    const answerHtml = marked.parse(answer, { async: false });
    const answerText = answerHtml
      .replace(/<[^>]*>/g, '')
      .replace(/&(?:amp|lt|gt|quot|#39);/g, (e) => ENTITIES[e] ?? e)
      .trim();
    return { question, answerHtml, answerText };
  });
}
