import { TypeIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { ReactNode, useEffect, useState } from 'react';
import { primary } from '@/tailwind.config';
import { handlePlaceText } from '@/app/lib/components/board/tools/drawingHandlers';
import cursorAdd from '@/app/lib/components/svg/cursorAdd';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { createPortal } from 'react-dom';
import ReactQuill from 'react-quill';

export default function TextTool({
  activeTool,
  setActiveTool,
  stageRef,
  addElement,
  updateElement,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [clickPosition, setClickPosition] = useState({
    x: undefined,
    y: undefined,
  });
  const [content, setContent] = useState('');

  const [newElement, setNewElement] = useState(null);

  useEffect(() => {
    const placeTextHandler = handlePlaceText({
      stageRef,
      activeTool,
      setActiveTool,
      setIsEditing,
      setClickPosition,
    } as any);

    if (activeTool === 'text' && stageRef.current) {
      const stage = stageRef.current.getStage();
      stage.container().style.cursor = `url(${cursorAdd}) 12 12, auto`;
      stage.on('mousedown', placeTextHandler);
    }

    return () => {
      if (stageRef.current) {
        const stage = stageRef.current.getStage();
        stage.container().style.cursor = 'default';
        stage.on('mousedown', placeTextHandler);
      }
    };
  }, [activeTool, setActiveTool, stageRef, isEditing, clickPosition]);

  const handleEditEnd = (e) => {
    setIsEditing(false);
  };

  return (
    <>
      <FTooltip content={settingsStore.t.toolTips.tools.textTool}>
        <Button
          onPress={() => {
            activeTool === 'text' ? setActiveTool('') : setActiveTool('text');
          }}
          variant={activeTool === 'text' ? 'flat' : 'light'}
          color={activeTool === 'text' ? 'primary' : 'default'}
          isIconOnly
          size="md"
        >
          <TypeIcon
            className={
              activeTool === 'text'
                ? 'stroke-primary-500'
                : 'stroke-default-500'
            }
          />
        </Button>
      </FTooltip>
      {isEditing &&
        createPortal(
          (
            <div
              style={{
                position: 'fixed',
                top: clickPosition.y,
                left: clickPosition.x,
              }}
            >
              <ReactQuill
                value={content}
                onValueChange={setContent}
                placeholder={settingsStore.t.toolBar.textToolPlaceholder}
                onBlur={handleEditEnd}
                theme="snow"
              />
            </div>
          ) as ReactNode,
          document.body,
        )}
    </>
  );
}
