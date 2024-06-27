import React from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { prism } from '@milkdown/plugin-prism';
import '@milkdown/theme-nord/style.css';
import 'prismjs/themes/prism-okaidia.css';
import '../css/milkdown.css'
import { Ctx } from '@milkdown/ctx';


interface MilkdownEditorProps {
  initialContent: string;
}

const MilkdownEditor: React.FC<MilkdownEditorProps> = ({ initialContent }) => {

  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, initialContent);
      })
      .config(nord) // Editor Theme
      .use(commonmark)
      .use(prism) // Code Styling
      .use(listener)
      .config((ctx) => {
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
          console.log(markdown); // Handle the editor content change as needed
        });
      }),
  );

  return <Milkdown />;
};

export const MilkdownEditorWrapper: React.FC<{ initialContent: string }> = ({ initialContent }) => {
  return (
    <MilkdownProvider>
      <div className="editor-container" spellCheck="false">
        <MilkdownEditor initialContent={initialContent} />
      </div>
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