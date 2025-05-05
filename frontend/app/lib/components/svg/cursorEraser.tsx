import { EraserIcon } from 'lucide-react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const svgString = ReactDOMServer.renderToStaticMarkup(
  <EraserIcon stroke="#71717a" />,
);

const cursorEraser = `data:image/svg+xml;base64,${btoa(svgString)}`;

export default cursorEraser;
