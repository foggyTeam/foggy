import { PointerIcon } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

const svgString = ReactDOMServer.renderToStaticMarkup(
  <PointerIcon stroke="#71717a" />,
);

const cursorPointer = `data:image/svg+xml;base64,${btoa(svgString)}`;

export default cursorPointer;
