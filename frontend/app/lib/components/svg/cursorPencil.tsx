import { PencilIcon } from 'lucide-react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const svgString = ReactDOMServer.renderToStaticMarkup(
  <PencilIcon stroke="#71717a" />,
);

const cursorPencil = `data:image/svg+xml;base64,${btoa(svgString)}`;

export default cursorPencil;
