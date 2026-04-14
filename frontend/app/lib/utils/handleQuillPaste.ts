'use client';

import QuillType from 'quill';
import Quill from 'quill';
import { uploadImage } from '@/app/lib/server/actions/handleImage';
import { RefObject } from 'react';

async function uploadFile(imageFile: File) {
  if (imageFile) {
    try {
      const response = await uploadImage(
        'board_images',
        imageFile,
        'board_doc_',
      );

      if ('url' in response && response.url) return response.url;
      else throw new Error(response?.error);
    } catch (e: any) {
      return null;
    }
  }
}

export default async function handleQuillPaste(
  e: ClipboardEvent,
  quill: RefObject<QuillType>,
) {
  const clipboardData = e.clipboardData;
  if (!clipboardData) return;

  // FILES (IMAGES)
  if (clipboardData.items) {
    let hasImageFile = false;
    for (let i = 0; i < clipboardData.items.length; i++) {
      if (clipboardData.items[i].type.indexOf('image') !== -1) {
        hasImageFile = true;
        e.preventDefault();

        const file = clipboardData.items[i].getAsFile();
        if (file) {
          const imageUrl = await uploadFile(file);

          if (imageUrl) {
            const range = quill.current.getSelection();
            const index = range ? range.index : quill.getLength();

            quill.current.insertEmbed(
              index,
              'image',
              imageUrl,
              Quill.sources.USER,
            );
            quill.current.setSelection(index + 1, 0, Quill.sources.SILENT);
          }
        }
      }
    }
    if (hasImageFile) return; // TODO: нет, картинки могут быть В тексте
  }

  // MARKDOWN CHECK
  const html = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');

  if (html) return;

  if (text) {
    const { parse } = await import('marked');
    const parsedHtml = await parse(text);

    const isMarkdown =
      parsedHtml !== `<p>${text}</p>\n` && parsedHtml !== `${text}\n`;

    if (isMarkdown) {
      e.preventDefault();

      const range = quill.current.getSelection();
      const index = range ? range.index : quill.current.getLength();

      quill.current.clipboard.dangerouslyPasteHTML(index, parsedHtml, 'user');
    }
  }
}
