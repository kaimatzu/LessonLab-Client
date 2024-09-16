import React, { FC, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Crepe } from '../milkdown-crepe/core'; // Your custom version of Crepe
import { Editor } from '@milkdown/core'; // Import the Editor type

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/nord.css';
import "../../css/custom-scrollbar.css";
import "./css/milkdown-override.css";
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CodeIcon from '@mui/icons-material/Code';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { replaceModuleNodeContent, selectSelectedWorkspaceModuleContent } from '@/redux/slices/workspaceSlice';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { debounce } from 'lodash';

interface CrepeEditorProps {
  markdownRef: React.MutableRefObject<string>;
  onUpdate: (newValue: string) => void;
}

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

  const [nodeId, moduleContent] = useAppSelector(selectSelectedWorkspaceModuleContent) || ["", ""];;

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
  }, [selectedModuleNodeId, moduleContent]);

  useEffect(() => {
    console.log("Module content", moduleContent);
    if (moduleContent !== null && crepeEditorRef.current) {
      crepeEditorRef.current.setMarkdown(moduleContent); // Directly update markdown in the Crepe editor
    }
  }, [nodeId, moduleContent]);

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleMarkdownUpdateRef.current(event.target.value);
  };

  const handleToggleView = (_event: React.MouseEvent<HTMLElement>, nextView: 'editor' | 'raw') => {
    if (nextView !== null) {
      setView(nextView);
    }
  };

  return (
    <div className="relative h-full w-full bg-[#F1F3F8]">
      {/* {moduleContent === null || selectedModuleNodeId === null ? (
        <p className="text-center mt-4">No content available. Please select a module node.</p>
      ) : ( */}
        <>
          {/* <div className="absolute top-0 left-0 right-0 bg-white z-10">
            <div className="flex justify-end mb-2">
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleToggleView}
                aria-label="text editor view"
              >
                <ToggleButton value="editor" aria-label="crepe view">
                  <FormatListBulletedIcon />
                </ToggleButton>
                <ToggleButton value="raw" aria-label="raw markdown">
                  <CodeIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
            <hr className="border-t border-zinc-300" />
          </div> */}

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
      {/* )} */}
    </div>
  );
};

export default CrepeEditorWrapper;
