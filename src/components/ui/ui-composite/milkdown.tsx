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
import { Page, useWorkspaceMaterialContext } from '@/lib/hooks/context-providers/workspace-material-context';
import { insert, replaceAll } from "@milkdown/utils";
import { updatePageContent, updatePageTitle } from '@/app/api/material/page/route';
import { Console } from 'console';


const MilkdownEditor: React.FC<{}> = () => {
  const { workspaces, removeWorkspace,
    selectedWorkspace,
    selectedPageId,
    updateLessonPage
  } = useWorkspaceMaterialContext();

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  
  const [lessonPage, setLessonPage] = useState<Page>({id: '', title: '', content: ''});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        // ctx.set(defaultValueCtx, initialContent);
        ctx.set(defaultValueCtx, content);
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
          console.log(
            "markdownUpdated to=",
            markdown,
            "\nprev=",
            prevMarkdown
          );
          setContent(markdown);
        })
        .blur((ctx) => {
          console.log("Editor has lost focus. Updating content immediately...");

          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null; // Clear the reference to the timeout
          }

          if (selectedWorkspace) {
            updatePageContent(lessonPage.id, selectedWorkspace.id, content);
            console.log(selectedWorkspace.id, {
                id: lessonPage.id,
                content: content,
                title: lessonPage.title
              });
            updateLessonPage(selectedWorkspace.id, {
              id: lessonPage.id,
              content: content,
              title: lessonPage.title
            })
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

  // useEffect(() => {
  //   if (selectedWorkspace && selectedPageId) {
  //     // TODO: Implement better null check later
  //     const foundPage = selectedWorkspace.pages?.find(page => page.id === selectedPageId); 
  //     if (foundPage) {
  //       console.log("found page", foundPage)
  //       setLessonPage({ id: foundPage.id, title: foundPage.title, content: foundPage.content }); 
  //       get()?.action(replaceAll(foundPage.content));
  //     } else {
  //       console.log("did not find page");
  //     }
  //   } else {
  //     setLessonPage({ id: '', title: '', content: '' }); 
  //   }
  // }, [selectedPageId, selectedWorkspace]);
  
  // useEffect(() => {
  //   // get()?.action(replaceAll(lessonPage.content));
  //   if (selectedWorkspace) {
  //     updatePageContent(lessonPage.id, selectedWorkspace.id, lessonPage.content);
  //   }
  // }, [lessonPage, selectedWorkspace])
  
  useEffect(() => {
    console.log("timeout func")
    if (content) {
      // Clear any existing timeout to reset the inactivity timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        console.log("Inactivity detected. Updating content...");
        if (selectedWorkspace) {
          updatePageContent(lessonPage.id, selectedWorkspace.id, content);
          updateLessonPage(selectedWorkspace.id, {
            id: lessonPage.id,
            content: content,
            title: lessonPage.title
          })
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
    // const editorInstance = get();
    // if (editorInstance) {
    //   editorInstance.action(replaceAll(lessonPage.content));
    // }
    console.log("Content", content);
  }, [content]);

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
          }
        }}
      />
      <div className="editor-container" spellCheck="false">
        <Milkdown />
      </div>
    </div>
  );
};

export const MilkdownEditorWrapper: React.FC<{}> = () => {
  return (
    <MilkdownProvider>
        <MilkdownEditor />
    </MilkdownProvider>
  );
};

// https://www.youtube.com/watch?v=moj-hTXBgz4
// https://www.youtube.com/watch?v=mX4MqIdw1KM
// See: `useOnClickOutside` hook
function mouseClickHandler(ctx: Ctx, event: Event) {
  // If event is right click then:
  event.preventDefault() // prevents opening default context menu from browser
  // open a context menu

}

// TODO list:
/*
  Add right click event handler
  Add context menu opener on right click in markdown
  https://milkdown.dev/blog/build-your-own-milkdown-copilot#overview
*/