import React, { FC, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Crepe } from '@/components/ui/ui-composite/workspace/milkdown-crepe/core'; // Your custom version of Crepe

import '@/components/ui/ui-composite/workspace/milkdown-crepe/theme/nord/style.css';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/nord.css';
import "../../../css/custom-scrollbar.css";
import "./css/milkdown-override.css";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { replaceModuleNodeContent, selectSelectedWorkspaceModuleContent } from '@/redux/slices/workspaceSlice';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { TbMarkdown, TbMarkdownOff } from 'react-icons/tb';
import { PATCH as _updateModuleNodeContent } from '@/app/api/workspace/module/route'
import RequestBuilder from "@/lib/hooks/builders/request-builder";

interface CrepeEditorProps {
  markdownRef: React.MutableRefObject<string>;
  onUpdate: (newValue: string) => void;
}

// eslint-disable-next-line react/display-name
const CrepeEditor = forwardRef((props: CrepeEditorProps, ref) => {
  const { markdownRef, onUpdate } = props;
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Crepe | null>(null);

  // Expose methods via ref using useImperativeHandle
  useImperativeHandle(ref, () => ({
    setMarkdown: (newValue: string) => {
      if (editorInstanceRef.current) {
        console.log("Set Markdown called");
        editorInstanceRef.current.setMarkdown(newValue);
      }
    },
    getMarkdown: () => {
      if (editorInstanceRef.current) {
        return editorInstanceRef.current.getMarkdown();
      }
      return '';
    },
  }));

  useEffect(() => {
    if (editorRef.current) {
      const crepe = new Crepe({
        root: editorRef.current,
        defaultValue: markdownRef.current,
        features: {
          [Crepe.Feature.CodeMirror]: true,
          [Crepe.Feature.ListItem]: true,
          [Crepe.Feature.LinkTooltip]: true,
          [Crepe.Feature.ImageBlock]: true,
          [Crepe.Feature.BlockEdit]: true,
          [Crepe.Feature.Placeholder]: true,
          [Crepe.Feature.Table]: true,
          [Crepe.Feature.Toolbar]: true,
          [Crepe.Feature.Cursor]: true,
        },
        markdownRef,
        onUpdate,
      });

      if (editorRef.current) {
        editorRef.current.classList.add('nord-theme');
      }

      crepe.create().then((editor) => {
        editorInstanceRef.current = crepe;
      });
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
      }
    };
  }, [markdownRef]);

  return <div ref={editorRef} id="crepe-editor" style={{ height: 'calc(100% - 3rem)', width: '100%' }}></div>;
});

const CrepeEditorWrapper: FC = () => {
  const markdownRef = useRef<string>('');
  const crepeEditorRef = useRef<any>(null); // Reference to the CrepeEditor to access the exposed methods
  const handleMarkdownUpdateRef = useRef<any>(null); // Store the latest handleMarkdownUpdate function
  const [view, setView] = useState<'editor' | 'raw'>('editor');
  const { selectedWorkspace, selectedModuleId, selectedModuleNodeId } = useWorkspaceContext();
  const dispatch = useAppDispatch();

  const [nodeId, moduleContent] = useAppSelector(selectSelectedWorkspaceModuleContent) || ["", ""];
  const [countdown, setCountdown] = useState<number>(5); // Countdown timer state
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timer

  const handleMarkdownUpdate = useCallback(
    // debounce(
    (newValue: string) => {
      console.log("Id values on handle markdown update  ", selectedWorkspace?.id, selectedModuleId, selectedModuleNodeId, newValue);
      markdownRef.current = newValue;
      if (selectedWorkspace?.id && selectedModuleId && selectedModuleNodeId) {
        dispatch(
          replaceModuleNodeContent({
            workspaceId: selectedWorkspace?.id!,
            moduleId: selectedModuleId!,
            moduleNodeId: selectedModuleNodeId!,
            content: newValue,
          })
        );
      }
    },
    //300),
    [dispatch, selectedWorkspace?.id, selectedModuleId, selectedModuleNodeId]
  );

  // Always store the latest handleMarkdownUpdate in the ref
  useEffect(() => {
    handleMarkdownUpdateRef.current = handleMarkdownUpdate;
  }, [handleMarkdownUpdate]);

  
  useEffect(() => {
    console.log("Changing node ID", selectedModuleNodeId, moduleContent);
    if (selectedModuleNodeId) {
      handleMarkdownUpdateRef.current(moduleContent);
    }
  }, [selectedModuleNodeId]);

  useEffect(() => {
    if (moduleContent !== null && crepeEditorRef.current) {
      crepeEditorRef.current.setMarkdown(moduleContent); // Directly update markdown in the Crepe editor
    }
  }, [nodeId, moduleContent]);

  // Effect to handle markdown changes and countdown
  useEffect(() => {
    // Reset countdown to 5 seconds when markdownRef changes
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Clear the existing timer
    }

    setCountdown(5); // Reset countdown
    timerRef.current = setTimeout(() => {
      console.log('Countdown finished, updating module content.');

      if (markdownRef && selectedModuleNodeId) {
        const requestBuilder = new RequestBuilder().
            setBody(JSON.stringify({
              content: markdownRef.current,
              moduleNodeId: selectedModuleNodeId!,
            }))
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/modules/update/node/content`);

        _updateModuleNodeContent(requestBuilder);
      }
    }, 5000); // 5 seconds

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current); // Cleanup on unmount or dependency change
      }
    };
  }, [markdownRef.current]); // Dependency on markdownRef.current

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleMarkdownUpdateRef.current(event.target.value);
  };

  const handleToggleView = () => {
    setView((prevView) => (prevView === 'editor' ? 'raw' : 'editor'));
};

  return (
    <div className="relative h-full w-full max-w-[825px] bg-[#F1F3F8]">
        <>
          <div className="m-2 p-2 z-10">
            <div className="flex justify-end mt-2">
              {view === 'editor' ? (
                <TbMarkdownOff className="w-5 h-5 cursor-pointer text-zinc-900 hover:text-[#5e77d3]" onClick={handleToggleView} />
              ) : (
                <TbMarkdown className="w-5 h-5 cursor-pointer text-[#5e77d3]" onClick={handleToggleView} />
              )}
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar" style={{ height: 'calc(100% - 4rem)' }}>
            {view === 'editor' ? (
              <CrepeEditor
                ref={crepeEditorRef}
                markdownRef={markdownRef}
                onUpdate={(newValue: string) => handleMarkdownUpdateRef.current(newValue)}
              />
            ) : (
              <textarea
                value={moduleContent}
                onChange={handleMarkdownChange}
                style={{ height: '100%', width: '100%' }}
                className="p-2 border rounded-md no-scrollbar bg-[#F1F3F8]"
              />
            )}
          </div>
        </>
    </div>
  );
};

export default CrepeEditorWrapper;
