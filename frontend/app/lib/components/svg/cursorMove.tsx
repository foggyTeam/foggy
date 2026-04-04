import { MoveIcon } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

const svgString = ReactDOMServer.renderToStaticMarkup(
  <MoveIcon stroke="#71717a" />,
);

const cursorMove = `data:image/svg+xml;base64,${btoa(svgString)}`;

export default cursorMove;
