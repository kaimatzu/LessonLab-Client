import React, { useEffect, useRef, useState } from 'react';
import {   Editor,
  rootCtx,
  defaultValueCtx,
  editorViewCtx,
  schemaCtx
} from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import {
  // tooltip,
  // tooltipPlugin,
  // createToggleIcon,
  // defaultButtons,
} from "@milkdown/plugin-tooltip";
import { prism } from '@milkdown/plugin-prism';
import { block } from "@milkdown/plugin-block";
import { cursor } from "@milkdown/plugin-cursor";
import { clipboard } from "@milkdown/plugin-clipboard";
import '@milkdown/theme-nord/style.css';
import 'prismjs/themes/prism-okaidia.css';
import '../css/milkdown.css'
import { Ctx } from '@milkdown/ctx';
import { Page, useWorkspaceMaterialContext, Workspace } from '@/lib/hooks/context-providers/workspace-material-context';
import { insert, replaceAll } from "@milkdown/utils";
import { updatePageContent, updatePageTitle } from '@/app/api/material/page/route';

const MilkdownEditor: React.FC = () => {
  const { workspaces, removeWorkspace,
    selectedWorkspace,
    selectedPageId,
    updateLessonPage
  } = useWorkspaceMaterialContext();

  const [content, setContent] = useState("");
  
  const [lessonPage, setLessonPage] = useState<Page>({id: '', title: '', content: ''});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const selectedWorkspaceRef = useRef<Workspace | null>(selectedWorkspace);
  const selectedPageIdRef = useRef<string | null>(selectedPageId);
  const contentRef = useRef<string | null>(content);
  const lessonTitleRef = useRef<string | null>(lessonPage.title);

  useEffect(() => {
    selectedWorkspaceRef.current = selectedWorkspace;
  }, [selectedWorkspace]);

  useEffect(() => {
    selectedPageIdRef.current = selectedPageId;
  }, [selectedPageId]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  
  useEffect(() => {
    lessonTitleRef.current = lessonPage.title
  }, [lessonPage]);
  
  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        // ctx.set(defaultValueCtx, initialContent);
        ctx.set(defaultValueCtx, content);
        // ctx.set(headingIdGeneratorCtx, true);
        ctx
        .get(listenerCtx)
        .beforeMount((ctx) => {
          console.log("beforeMount");
        })
        .mounted((ctx) => {
          console.log("mounted");
          // insert("# Default Title");
        })
        .updated((ctx, doc, prevDoc) => {
          console.log("updated", doc, prevDoc);
          console.log("updated JSON", doc.toJSON());
        })
        .markdownUpdated((ctx, markdown, prevMarkdown) => {
          // console.log(
          //   "markdownUpdated to=",
          //   markdown,
          //   "\nprev=",
          //   prevMarkdown
          // );
          setContent(markdown);
        })
        .blur((ctx) => {
          console.log("Editor has lost focus. Updating content immediately...");

          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null; // Clear the reference to the timeout
          }

          const currentWorkspace = selectedWorkspaceRef.current;
          const currentPageId = selectedPageIdRef.current;
          const currentContent = contentRef.current;
          const currentLessonTitle = lessonTitleRef.current; 

          if (currentWorkspace && currentPageId && currentContent && currentLessonTitle) {
            updatePageContent(currentPageId, currentWorkspace.id, currentContent);
            updateLessonPage(
              currentWorkspace.id,
              {
                id: currentPageId,
                content: currentContent,
                title: currentLessonTitle,
              }
            );
            console.log("Blur",
              {
                id: currentPageId,
                content: currentContent,
                title: currentLessonTitle,
              }
            )
          } else {
            console.log("Did not update", currentWorkspace, currentPageId);
          }
        })
        .focus((ctx) => {
          const view = ctx.get(editorViewCtx);
          console.log("focus", view);
        })
        .destroy((ctx) => {
          console.log("destroy");
        });
      })
      .config(nord) // Editor Theme
      .use(commonmark)
      .use(prism) // Code Styling
      .use(listener)
      .use(block)
      .use(cursor)
      .use(clipboard)
      // .config((ctx) => {
      //   ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
      //     console.log(markdown); // Handle the editor content change as needed
      //     setLessonPage(lessonPage => ({
      //       ...lessonPage,
      //       content: markdown
      //     }));
      //   });
      // }),
    );
  
  useEffect(() => {
    if (selectedWorkspace && selectedWorkspace.pages && selectedPageId) {
      console.log(selectedWorkspace, selectedPageId)
      const foundPage = selectedWorkspace.pages.find(page => page.id === selectedPageId);
      if (foundPage) {
        setLessonPage({ id: foundPage.id, title: foundPage.title, content: foundPage.content });
        get()?.action(replaceAll(foundPage.content));
      } else {
        console.warn("Page not found.");
      }
    } else {
      console.log("Workspace has no pages.");
      setLessonPage({ id: '', title: '', content: '' });
    }
  }, [selectedPageId, selectedWorkspace]);

  useEffect(() => {
    if (content) {
      // Clear any existing timeout to reset the inactivity timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        console.log("Inactivity detected. Updating content...");
        if (selectedWorkspace) {
          updatePageContent(lessonPage.id, selectedWorkspace.id, content);
          console.log("Update called")
        }
      }, 2000);  // 2 seconds of inactivity
    }

    // Cleanup on component unmount or when dependencies change
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content]);

  useEffect(() => {
    // console.log(selectedWorkspace, selectedPageId);
    // console.log("Title", lessonPage.title);
    // console.log("Content", content);
  }, [content, lessonPage.title]);

  return (
    <div>
      <input
        type="text"
        value={lessonPage.title}
        onChange={(e) => setLessonPage((prev) => ({ ...prev, title: e.target.value }))}
        className="w-full font-bold px-4 py-0 text-opacity-75 text-5xl bg-transparent border-black dark:border-zinc-100 
        rounded-md focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent text-black dark:text-zinc-100 dark:placeholder:text-zinc-100 dark:placeholder:text-opacity-75"
        placeholder="Untitled"
        onBlur={() => {
          if (selectedWorkspace) {
            updatePageTitle(lessonPage.id, selectedWorkspace.id, lessonPage.title);
            console.log("About to update", lessonPage, lessonTitleRef.current);
            updateLessonPage(selectedWorkspace.id, {
              id: lessonPage.id,
              title: lessonPage.title,
              content: lessonPage.content,
            });
          }
        }}
      />
      <div className="editor-container" spellCheck="false">
        <Milkdown />
      </div>
    </div>
  );
};

export const MilkdownEditorWrapper: React.FC = () => {
  return (
    <MilkdownProvider>
        <MilkdownEditor />
    </MilkdownProvider>
  );
};