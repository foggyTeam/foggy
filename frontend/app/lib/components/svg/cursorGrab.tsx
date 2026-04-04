import { HandIcon } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

const svgString = ReactDOMServer.renderToStaticMarkup(
  <HandIcon stroke="#71717a" />,
);

const cursorGrab = `data:image/svg+xml;base64,${btoa(svgString)}`;

export default cursorGrab;
