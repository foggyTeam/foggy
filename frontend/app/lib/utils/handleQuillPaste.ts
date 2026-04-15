'use client';

import DOMPurify from 'dompurify';
import QuillType from 'quill';
import Quill from 'quill';
import { uploadImage } from '@/app/lib/server/actions/handleImage';

const allowedIframeDomains = [
  // VIDEO
  'youtube.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  // MUSIC
  'open.spotify.com',
  'w.soundcloud.com',
  'embed.music.apple.com',
  'music.yandex.ru',
  // DESIGN
  'figma.com',
  'embed.figma.com',
  'codepen.io',
  'codesandbox.io',
  'pinterest.com',
  'assets.pinterest.com',
  // GOOGLE
  'maps.google.com',
  'google.com',
  'docs.google.com',
  'calendar.google.com',
  // YANDEX
  'yandex.ru',
  'music.yandex.ru',
  // TRELLO
  'trello.com',
];

async function uploadFile(imageFile: File | Blob) {
  try {
    const response = await uploadImage('board_images', imageFile, 'board_doc_');
    if (response && 'url' in response && response.url) return response.url;
    return null;
  } catch (e: any) {
    return null;
  }
}

function cleanHtml(html: string) {
  const cleanHtmlString = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    // Разрешаем атрибуты размеров и стилей, чтобы iframe не схлопнулся
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'width',
      'height',
      'style',
      'class',
    ],
  });

  const finalDoc = new DOMParser().parseFromString(
    cleanHtmlString,
    'text/html',
  );
  const iframes = finalDoc.querySelectorAll('iframe');

  iframes.forEach((iframe) => {
    iframe.removeAttribute('srcdoc');
    iframe.innerHTML = '';

    const src = iframe.getAttribute('src');

    if (src) {
      try {
        const url = new URL(src, window.location.origin);

        if (url.protocol !== 'https:') {
          iframe.remove();
          return;
        }

        const hostname = url.hostname.replace(/^www\./, '');
        const pathname = url.pathname;

        let isAllowedDomain = allowedIframeDomains.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
        );

        // GOOGLE CHECK
        if (hostname === 'google.com' || hostname.endsWith('.google.com')) {
          const isSafeGoogleSubdomain = [
            'docs.google.com',
            'calendar.google.com',
            'maps.google.com',
          ].includes(hostname);

          if (pathname.startsWith('/maps/') || isSafeGoogleSubdomain) {
            isAllowedDomain = true;
          } else {
            isAllowedDomain = false;
          }
        }

        // YANDEX CHECK
        if (hostname === 'yandex.ru' || hostname.endsWith('.yandex.ru')) {
          if (
            pathname.startsWith('/map-widget/') ||
            hostname === 'music.yandex.ru'
          ) {
            isAllowedDomain = true;
          } else {
            isAllowedDomain = false;
          }
        }

        if (!isAllowedDomain) {
          iframe.remove();
        } else {
          iframe.setAttribute('sandbox', 'allow-scripts allow-presentation');
          // iframe.classList.add('ql-video');
        }
      } catch (e) {
        iframe.remove();
      }
    } else {
      iframe.remove();
    }
  });

  return finalDoc.body.innerHTML;
}

export default async function handleQuillPaste(
  quill: QuillType,
  files: File[],
  html: string,
  text: string,
) {
  const range = quill.getSelection() || { index: quill.getLength() };
  let currentIndex = range.index;

  // FILES
  if (files.length > 0 && !text) {
    for (const file of files) {
      const imageUrl = await uploadFile(file);
      if (imageUrl) {
        quill.insertEmbed(currentIndex, 'image', imageUrl, Quill.sources.USER);
        currentIndex += 1;
      }
    }
    quill.setSelection(currentIndex, 0, Quill.sources.SILENT);
    return;
  }

  // MARKDOWN
  let isMarkdown = false;
  let finalHtml = html;

  if (!html && text) {
    const { parse } = await import('marked');
    const parsedHtml = await parse(text);
    isMarkdown =
      parsedHtml !== `<p>${text}</p>\n` && parsedHtml !== `${text}\n`;

    if (isMarkdown) {
      finalHtml = parsedHtml;
    } else {
      quill.insertText(currentIndex, text, Quill.sources.USER);
      quill.setSelection(currentIndex + text.length, 0, Quill.sources.SILENT);
      return;
    }
  }

  // INSERTING IMAGES AND IFRAMES
  if (finalHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(finalHtml, 'text/html');
    const images = doc.querySelectorAll('img');

    if (images.length > 0) {
      await Promise.all(
        Array.from(images).map(async (img) => {
          const src = img.getAttribute('src');
          if (
            src &&
            (src.startsWith('data:image') || src.startsWith('blob:'))
          ) {
            try {
              const res = await fetch(src);
              const blob = await res.blob();

              const uploadedUrl = await uploadFile(blob);

              if (uploadedUrl) img.setAttribute('src', uploadedUrl);
              else img.remove();
            } catch (err) {
              img.remove();
            }
          }
        }),
      );
      finalHtml = doc.body.innerHTML;
    }

    quill.clipboard.dangerouslyPasteHTML(
      currentIndex,
      cleanHtml(finalHtml),
      'user',
    );
  }
}
