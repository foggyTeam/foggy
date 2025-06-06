import { PlusIcon } from 'lucide-react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const svgString = ReactDOMServer.renderToStaticMarkup(
  <PlusIcon stroke="#71717a" />,
);

const cursorAdd = `data:image/svg+xml;base64,${btoa(svgString)}`;

export default cursorAdd;
