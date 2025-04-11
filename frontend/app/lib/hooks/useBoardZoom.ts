import { useEffect } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

export default function UseBoardZoom(stageRef, scale, setScale) {
  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      const handleWheel = (e) => {
        e.evt.preventDefault();

        if (Math.floor(e.evt.deltaY as number) !== (e.evt.deltaY as number)) {
          const scaleBy = 1.04;
          const oldScale = stage.scaleX();
          const pointer = stage.getPointerPosition();
          const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
          };

          const newScale =
            e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
          if (!(MIN_SCALE >= newScale || MAX_SCALE <= newScale)) {
            setScale(newScale);

            stage.scale({ x: newScale, y: newScale });
            const newPos = {
              x: pointer.x - mousePointTo.x * newScale,
              y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
            stage.batchDraw();
          }
        }
      };

      stage.on('wheel', handleWheel);

      return () => {
        stage.off('wheel', handleWheel);
      };
    }
  }, [scale, setScale]);
}
