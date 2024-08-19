import React, { useEffect, useRef, useState } from 'react';
import {
  Editor,
  rootCtx,
  defaultValueCtx,
  editorViewCtx,
  schemaCtx,
  editorStateCtx,
  parserCtx
} from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { Parser } from '@milkdown/transformer';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import {
  // tooltip,
  // tooltipPlugin,
  // createToggleIcon,
  // defaultButtons,
} from "@milkdown/plugin-tooltip";
import { prism } from '@milkdown/plugin-prism';
import { block, BlockProvider } from "@milkdown/plugin-block";
import { history } from '@milkdown/plugin-history';
import { cursor } from "@milkdown/plugin-cursor";
import { clipboard } from "@milkdown/plugin-clipboard";
import '@milkdown/theme-nord/style.css';
import 'prismjs/themes/prism-okaidia.css';
import '../../css/milkdown.css'
import { Ctx } from '@milkdown/ctx';
import { ProsemirrorAdapterProvider, usePluginViewFactory } from '@prosemirror-adapter/react';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { insert, replaceAll } from "@milkdown/utils";
import { updatePageContent as _updatePageContent, updatePageTitle as _updatePageTitle } from '@/app/api/workspace/page/route';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { Page, Workspace } from '@/lib/types/workspace-types';

export const BlockView = () => {
  const ref = useRef<HTMLDivElement>(null)
  const tooltipProvider = useRef<BlockProvider>()

  const [loading, get] = useInstance()

  useEffect(() => {
    const div = ref.current
    if (loading || !div) return;

    const editor = get();
    if (!editor) return;

    tooltipProvider.current = new BlockProvider({
      ctx: editor.ctx,
      content: div,
    })
    tooltipProvider.current?.update()

    return () => {
      tooltipProvider.current?.destroy()
    }
  }, [loading])

  return (
    <div ref={ref} className="absolute w-6 bg-slate-200 rounded hover:bg-slate-300 cursor-grab">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
      </svg>
    </div>
  )
}

function getAllBlocks(doc: ProseMirrorNode): ProseMirrorNode[] {
  const blocks: ProseMirrorNode[] = [];

  function traverse(node: ProseMirrorNode) {
    if (node.isBlock) {
      blocks.push(node);
    }
    node.forEach(child => traverse(child));
  }

  traverse(doc);

  return blocks;
}


// function addBlock(editorState: EditorState, tr: Transaction, schema: any): Transaction {
//   const { from, to } = editorState.selection;
//   const textNode = schema.text('test');
//   console.log("Schema paragraph nodes", schema.nodes.paragraph);
//   console.log("Create paragraph node", schema.nodes.paragraph.create(null, textNode));
//   const paragraph = schema.nodes.paragraph.create(null, textNode);

//   console.log("Schema block nodes", schema.nodes.block);
//   console.log("Create block node", schema.nodes.block.create(null, paragraph));
//   const newBlock = schema.nodes.block.create(null, paragraph);
//   return tr.insert(to + 1, newBlock);
// }
function markdownToNodes(ctx: Ctx, markdown: string): ProseMirrorNode | null {
  const parser = ctx.get(parserCtx) as Parser;
  const doc = parser(markdown);
  return doc;
}

function addBlock(editorState: EditorState, tr: Transaction, schema: any): Transaction {
  const { from, to } = editorState.selection;
  const textNode = schema.text('test');

  console.log("Schema", schema);
  console.log("Schema nodes", schema.nodes);

  console.log("Transaction", tr);
  console.log("Transaction doc", tr.doc.toJSON());

  const paragraph = schema.nodes.paragraph.create(null, textNode);
  console.log("Schema paragraph nodes", schema.nodes.paragraph);
  console.log("Create paragraph node", paragraph);

  return tr.insert(to + 1, paragraph);
}


const MilkdownEditor: React.FC = () => {
  const { workspaces, removeWorkspace,
    pagesLoading,
    selectedWorkspace,
    selectedPageId,
    updateLessonPage,
    updateLessonPageTitle,
  } = useWorkspaceContext();

  const getInitialContent = () => {
    if (selectedWorkspace && selectedWorkspace.pages) {
      const selectedPage = selectedWorkspace.pages.find(page => page.id === selectedPageId);
      return selectedPage ? selectedPage.content : '';
    }
    return '';
  };

  const [content, setContent] = useState(getInitialContent);

  const [lessonPage, setLessonPage] = useState<Page>({ id: '', title: '', content: '' });
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

  const pluginViewFactory = usePluginViewFactory();

  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, content);
        ctx.set(block.key, {
          view: pluginViewFactory({
            component: BlockView,
          })
        });
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
              _updatePageContent(currentPageId, currentWorkspace.id, currentContent);
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
          })
      })
      .config(nord) // Editor Theme
      .use(commonmark)
      .use(prism) // Code Styling
      .use(listener)
      .use(block)
      .use(cursor)
      .use(clipboard)
      .use(history)
  );

  useEffect(() => {
    const editor = get();

    if (selectedWorkspace && selectedWorkspace.pages && selectedPageId && editor) {
      const foundPage = selectedWorkspace.pages.find(page => page.id === selectedPageId);
      if (foundPage) {
        console.log("This is getting called for some reason");
        setLessonPage({ id: foundPage.id, title: foundPage.title, content: foundPage.content });
        editor.action(replaceAll(foundPage.content));
      } else {
        console.warn("Page not found.");
      }
    } else {
      console.info("Workspace has no pages.");
      // setLessonPage({ id: '', title: '', content: '' });
    }
  }, [selectedPageId, pagesLoading]);

  const printBlocks = () => {
    if (get && selectedWorkspace && selectedPageId) {
      const editor = get();

      if (editor) {
        const state = editor.ctx.get(editorStateCtx);
        const doc = state.doc;

        const blocks = getAllBlocks(doc);
        console.log('Blocks:', blocks);
      }
    }
  }

  const addNewBlock = () => {
    if (get) {
      const editor = get();

      if (editor) {
        const view = editor.ctx.get(editorViewCtx);
        const schema = editor.ctx.get(schemaCtx);

        // const tr = addBlock(view.state, view.state.tr, schema);
        // view.dispatch(tr);
        const ctx = editor.ctx;

        const markdown = '# This is a test block\n\nThis is some test content for the new block.';
        const doc = markdownToNodes(ctx, markdown);

        if (doc) {
          const tr = view.state.tr.insert(view.state.selection.to + 1, doc.content);
          view.dispatch(tr);
        }
      }
    }
  }

  useEffect(() => {
    if (content) {
      // Clear any existing timeout to reset the inactivity timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        console.log("Inactivity detected. Updating content...");
        if (selectedWorkspace) {
          _updatePageContent(lessonPage.id, selectedWorkspace.id, content);
          console.log("Update called")
        }
      }, 2000);  // 2 seconds of inactivity
    }

    // Cleanup on component unmount or when dependencies change
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content]);

  return (
    <div>
      {/* <button onClick={printBlocks}>Print blocks</button>
      <button onClick={addNewBlock}>Add block</button> */}
      <input
        type="text"
        value={lessonPage.title}
        onChange={(e) => {
          setLessonPage((prev) => ({ ...prev, title: e.target.value }));
          if (selectedWorkspace && selectedPageId) {
            updateLessonPageTitle(selectedWorkspace.id, selectedPageId, e.target.value);
          }
        }}
        className="w-full font-bold px-4 py-0 text-opacity-75 text-5xl bg-transparent border-black dark:border-zinc-100 
        rounded-md focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent text-black dark:text-zinc-100 dark:placeholder:text-zinc-100 dark:placeholder:text-opacity-75"
        placeholder="Untitled"
        onBlur={() => {
          if (selectedWorkspace) {
            _updatePageTitle(lessonPage.id, selectedWorkspace.id, lessonPage.title);
            console.log("About to update", lessonPage, lessonTitleRef.current);
            // updateLessonPage(selectedWorkspace.id, {
            //   id: lessonPage.id,
            //   title: lessonPage.title,
            //   content: lessonPage.content,
            // });
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
      <ProsemirrorAdapterProvider>
        <MilkdownEditor />
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  );
};