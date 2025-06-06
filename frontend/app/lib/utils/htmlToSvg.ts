import { foggy_accent } from '@/tailwind.config';
import debounce from 'lodash/debounce';

const preprocessContent = (content: string): string => {
  return content.replace(/<br>/g, '<span class="line-break"></span>');
};

const HtmlToSvg = (
  content: string,
  width?: number,
  height?: number,
): string => {
  content = preprocessContent(content);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', width ? `${width}px` : '432px');
  svg.setAttribute('height', height ? `${height}px` : '88px');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');

  style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        .montserrat {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          word-wrap: break-word;
          white-space: pre-wrap;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: start;
          overflow: visible;
          padding: 16px;
        }
        .line-break {
          display: block;
          height: 13px;
          width: 100%;
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: 400;
        }
        a {
          color: ${foggy_accent.DEFAULT};
        }
        p {
          margin: 0;
        }
        ul, ol {
          list-style-position: inside;
        }
        .ql-align-center {
          text-align: center;
        }
        .ql-align-justify {
          text-align: justify;
        }
        .ql-align-right {
          text-align: right;
        }
        .ql-align-left {
          text-align: left;
        }
        blockquote {
          border-left: 4px solid #ccc;
          padding-left: 16px;
          margin-bottom: 5px;
          margin-top: 5px;
          margin-left: 0;
        }
    `;

  defs.appendChild(style);
  svg.appendChild(defs);

  const foreignObject = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'foreignObject',
  );
  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');

  const div = document.createElement('div');
  div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  div.classList.add('montserrat');
  div.innerHTML = content;

  const listItems = div.querySelectorAll('li[data-list="bullet"]');

  listItems.forEach((li) => {
    const ol = li.parentElement;
    if (ol && ol.tagName.toLowerCase() === 'ol') {
      const ul = document.createElement('ul');
      Array.from(ol.children).forEach((child) => {
        const newLi = document.createElement('li');
        newLi.innerHTML = (child as HTMLElement).innerHTML;
        ul.appendChild(newLi);
      });
      ol.parentElement?.replaceChild(ul, ol);
    }
  });

  foreignObject.appendChild(div);

  svg.appendChild(foreignObject);

  const svgString = new XMLSerializer().serializeToString(svg);

  return (
    'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)))
  );
};

const DebouncedHtmlToSvg = debounce(
  (content: string, width?: number, height?: number) => {
    return HtmlToSvg(content, width, height);
  },
  300,
);

export { HtmlToSvg, DebouncedHtmlToSvg };
