import { TypeIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { ReactNode, useState } from 'react';
import { handlePlaceText } from '@/app/lib/components/board/simple/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { createPortal } from 'react-dom';
import 'react-quill-new/dist/quill.snow.css';
import TextEditor from '@/app/lib/components/board/simple/tools/textEditor/textEditor';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import useTool from '@/app/lib/hooks/simpleBoard/useTool';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function TextTool() {
  const { commonSize } = useAdaptiveParams();
  const {
    stageRef,
    activeTool,
    setActiveTool,
    toolsDisabled,
    addElement,
    resetStage,
    allToolsDisabled,
  } = useBoardContext();

  const [isEditing, setIsEditing] = useState(false);
  const [clickPosition, setClickPosition] = useState({
    stagePosition: { x: undefined, y: undefined },
    editorPosition: { x: undefined, y: undefined },
  });
  const [content, setContent] = useState('');
  const [textHeight, setTextHeight] = useState(0);

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

  useTool({
    toolName: 'text',
    handlers: {
      mouseDownHandler: placeTextHandler,
    },
    isTextEditing: isEditing,
  });

  return (
    <>
      <FTooltip content={settingsStore.t.toolTips.tools.textTool}>
        <Button
          data-testid="text-tool-btn"
          isDisabled={toolsDisabled || allToolsDisabled}
          onPress={() => {
            if (activeTool === 'text') setActiveTool('');
            else setActiveTool('text');
          }}
          variant={activeTool === 'text' ? 'flat' : 'light'}
          color={activeTool === 'text' ? 'primary' : 'default'}
          isIconOnly
          size={commonSize}
        >
          <TypeIcon
            className={
              activeTool === 'text'
                ? 'stroke-primary-500'
                : 'stroke-default-600'
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
