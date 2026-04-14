'use client';

import QuillType from 'quill';
import Quill from 'quill';
import { uploadImage } from '@/app/lib/server/actions/handleImage';

async function uploadFile(imageFile: File | Blob) {
  try {
    const response = await uploadImage('board_images', imageFile, 'board_doc_');
    if (response && 'url' in response && response.url) return response.url;
    return null;
  } catch (e: any) {
    return null;
  }
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

  // INSERTING IMAGES
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

    quill.clipboard.dangerouslyPasteHTML(currentIndex, finalHtml, 'user');
  }
}
