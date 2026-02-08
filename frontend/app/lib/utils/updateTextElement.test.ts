import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TextElement } from '@/app/lib/types/definitions';

// ВАЖНО: фабрика hoist'ится, поэтому всё создаём внутри
vi.mock('@/app/lib/utils/htmlToSvg', () => {
  return {
    HtmlToSvg: vi.fn(
      (content: string, width?: number, height?: number) =>
        `svg(${content},${width ?? 'u'},${height ?? 'u'})`,
    ),
    DebouncedHtmlToSvg: vi.fn(),
  };
});

// Импорт после vi.mock — чтобы UpdateTextElement увидел мок
import { HtmlToSvg } from '@/app/lib/utils/htmlToSvg';
import UpdateTextElement from '@/app/lib/utils/updateTextElement';

describe('UpdateTextElement', () => {
  const htmlToSvgMock = vi.mocked(HtmlToSvg);

  beforeEach(() => {
    htmlToSvgMock.mockClear();
  });

  const base = (): TextElement => ({
    id: 't1',
    type: 'text',
    draggable: true,
    dragDistance: 4,
    x: 10,
    y: 20,
    width: 100,
    height: 40,
    rotation: 0,
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 2,
    svg: 'old-svg',
    content: '<p>Hello</p>',
    cornerRadius: 6,
  });

  it('recomputes svg when content changes', () => {
    const element = base();

    const updated = UpdateTextElement(element, { content: '<p>New</p>' });

    expect(htmlToSvgMock).toHaveBeenCalledTimes(1);
    expect(htmlToSvgMock).toHaveBeenCalledWith('<p>New</p>', 100, 40);
    expect(updated.svg).toBe('svg(<p>New</p>,100,40)');
  });

  it('does not recompute svg when unrelated attrs change', () => {
    const element = base();

    const updated = UpdateTextElement(element, { x: 999 });

    expect(htmlToSvgMock).toHaveBeenCalledTimes(0);
    expect(updated.svg).toBe('old-svg');
    expect(updated.x).toBe(999);
  });

  it('does not mutate the original element', () => {
    const element = base();

    const updated = UpdateTextElement(element, { width: 222 });

    expect(updated).not.toBe(element);
    expect(element.width).toBe(100);
    expect(element.svg).toBe('old-svg');
  });
});