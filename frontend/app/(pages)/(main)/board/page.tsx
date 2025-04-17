import RecentBar from '@/app/lib/components/menu/projectBar/recentBar';
import BoardStage from '@/app/lib/components/board/boardStage';
import Cursors from '@/app/lib/components/board/cursors';
import BoardLoader from '@/app/lib/components/dataLoaders/boardLoader';
import {
  BoardElement,
  BoardType,
  BoardTypes,
} from '@/app/lib/types/definitions';
import { info, primary, secondary } from '@/tailwind.config';

const testBoardLayers = [
  [
    {
      id: 'rect1',
      type: 'rect',
      draggable: true,
      x: 100,
      y: 100,
      rotation: 0,
      fill: secondary['400'],
      width: 200,
      height: 100,
    },
    {
      id: 'line1',
      type: 'line',
      draggable: true,
      x: 50,
      y: 50,
      rotation: 0,
      stroke: primary.DEFAULT,
      points: [0, 0, 100, 100],
      strokeWidth: 2,
    },
    {
      id: 'marker1',
      type: 'marker',
      draggable: true,
      x: 150,
      y: 150,
      rotation: 0,
      stroke: primary['600'],
      points: [0, 0, 50, 50, 100, 0],
      strokeWidth: 8,
      opacity: 0.5,
    },
  ] as BoardElement[],
  [
    {
      id: 'ellipse1',
      type: 'ellipse',
      draggable: true,
      x: 400,
      y: 150,
      rotation: 0,
      fill: info.DEFAULT,
      width: 100,
      height: 150,
    } as BoardElement,
  ] as BoardElement[],
  [] as BoardElement[],
];
const testBoard: BoardType = {
  projectId: 'kjgvkhb11',
  section: 'test section',
  id: 'ljkhgblkjb11',
  name: 'test board',
  type: BoardTypes.SIMPLE,
  layers: testBoardLayers as BoardElement[][],
  lastChange: new Date().toISOString(),
};

export default function Board() {
  // по-хорошему тут запросить данные доски с бэка
  return (
    <>
      <Cursors />
      <BoardLoader boardData={testBoard} />
      <RecentBar />
      <BoardStage />
    </>
  );
}
