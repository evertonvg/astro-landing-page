import { describe, it, expect } from 'vitest';
import { renderFaqItems } from '../../src/lib/faq';

describe('renderFaqItems', () => {
  it('renders markdown to html and plain text', () => {
    const [item] = renderFaqItems([{ question: 'P?', answer: 'Veja o [link](/x) & **negrito**.' }]);
    expect(item.answerHtml).toContain('<a href="/x">link</a>');
    expect(item.answerHtml).toContain('<strong>negrito</strong>');
    expect(item.answerText).toBe('Veja o link & negrito.');
  });
});
