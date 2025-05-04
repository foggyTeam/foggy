import { TypeIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { ReactNode, useEffect, useState } from 'react';
import { handlePlaceText } from '@/app/lib/components/board/tools/drawingHandlers';
import cursorAdd from '@/app/lib/components/svg/cursorAdd';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { createPortal } from 'react-dom';
import 'react-quill-new/dist/quill.snow.css';
import TextEditor from '@/app/lib/components/board/tools/textEditor/textEditor';
import { ToolProps } from '@/app/lib/components/board/menu/toolBar';

export default function TextTool({
  isDisabled,
  activeTool,
  setActiveTool,
  stageRef,
  addElement,
  resetStage,
}: ToolProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [clickPosition, setClickPosition] = useState({
    stagePosition: { x: undefined, y: undefined },
    editorPosition: { x: undefined, y: undefined },
  });
  const [content, setContent] = useState('');
  const [textHeight, setTextHeight] = useState(0);

  useEffect(() => {
    const placeTextHandler = handlePlaceText({
      stageRef,
      resetStage,
      activeTool,
      setActiveTool,
      addElement,
      clickPosition,
      setClickPosition,
      isEditing,
      setIsEditing,
      content,
      setContent,
      textHeight,
      setTextHeight,
    } as any);

    if ((activeTool === 'text' && stageRef.current) || isEditing) {
      const stage = stageRef.current.getStage();
      if (!isEditing)
        stage.container().style.cursor = `url(${cursorAdd}) 12 12, auto`;
      stage.on('mousedown', placeTextHandler);
    }

    return () => {
      if (stageRef.current) {
        const stage = stageRef.current.getStage();
        stage.container().style.cursor = 'default';
        stage.off('mousedown', placeTextHandler);
      }
    };
  }, [
    activeTool,
    setActiveTool,
    stageRef,
    clickPosition,
    isEditing,
    content,
    textHeight,
  ]);

  return (
    <>
      <FTooltip content={settingsStore.t.toolTips.tools.textTool}>
        <Button
          isDisabled={isDisabled}
          onPress={() => {
            if (activeTool === 'text') setActiveTool('');
            else setActiveTool('text');
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
            <TextEditor
              top={clickPosition.editorPosition.y}
              left={clickPosition.editorPosition.x}
              content={content}
              setContent={setContent}
              setHeight={setTextHeight}
            />
          ) as ReactNode,
          document.body,
        )}
    </>
  );
}
