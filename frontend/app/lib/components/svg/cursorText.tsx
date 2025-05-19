import { TextCursorIcon } from 'lucide-react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const svgString = ReactDOMServer.renderToStaticMarkup(
  <TextCursorIcon stroke="#71717a" />,
);

const cursorText = `data:image/svg+xml;base64,${btoa(svgString)}`;

export default cursorText;
