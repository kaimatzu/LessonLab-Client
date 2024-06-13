import React, { useEffect, useRef, FC } from 'react';
import Quill from 'quill';
import hljs from 'highlight.js';
import 'react-quill/dist/quill.core.css'
import 'react-quill/dist/quill.snow.css'
import './css/quill-custom.css'
import CustomQuillMarkdown from '../../app/md-renderer'

interface MaterialContentProps {
  initialContent: string;
}

hljs.configure({
  languages: ['javascript', 'ruby', 'python', 'rust'],
})

export const MaterialContent: FC<MaterialContentProps> = ({ initialContent }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: false, // Disable the toolbar
        syntax: {
          highlight: (text: string) => hljs.highlightAuto(text).value,
        },
        // syntax: { hljs }
      },
      formats: 
      [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'video',
        'code-block',
        // 'code-block-container',
      ],
    });

    const markdownOptions = {
      // Additional options can be added here
    };

    new CustomQuillMarkdown(editor, markdownOptions);

    // Set initial content
    editor.clipboard.dangerouslyPasteHTML(initialContent);

    // Handle changes
    editor.on('text-change', () => {
      // console.log(editor.root.innerHTML); // Handle the editor content change as needed
    });

    // Remove new lines before and after code block
    editor.on('editor-change', (eventName: string, ...args: [any, any, any]) => {
      console.log(eventName);
      if (eventName === 'text-change') {
        const [delta, oldDelta, source] = args;
        // if (source === 'user') {
          let ops = delta.ops;
          for (let i = 0; i < ops.length; i++) {
            let op = ops[i];
            console.log(op);
            if (op.attributes && op.attributes['code-block']) {
              console.log("Code Block Created");
              console.log(editor.getContents());
            }
          }
        // }
      }
    });

  }, [initialContent]);

  return (
    <div className="material-content h-full w-full flex">
        <div id="editor" ref={editorRef} className="h-full w-full"></div>
    </div>
  );
};
