import React, { useEffect, useRef, FC } from 'react';
import Quill from 'quill';
import QuillMarkdown from 'quilljs-markdown';
import 'quill/dist/quill.snow.css';
import 'quilljs-markdown/dist/quilljs-markdown-common-style.css';
import './css/quill-custom.css'

// Register custom blots for headers and other formats
const Block = Quill.import('blots/block');
const Inline = Quill.import('blots/inline');
const BlockEmbed = Quill.import('blots/embed');
// const Text = Quill.import('blots/text');

Block.tagName = 'div';
Block.className = 'ql-block';

Quill.register(Block, true);


class CustomHeader extends Block {
    static blotName = 'header';
    static tagName = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    static className = 'ql-block';
}

class CustomBlockquote extends Block {
    static blotName = 'blockquote';
    static tagName = 'blockquote';
    static className = 'ql-block';
}

class CustomBold extends Inline {
    static blotName = 'bold';
    static tagName = 'strong';
    static className = 'ql-inline';
}

class CustomCodeBlock extends BlockEmbed {
    static blotName = 'code-block';
    static tagName = 'pre';
    static className = 'ql-syntax';
}

// Quill.register(CustomParagraph);
Quill.register(CustomHeader);
Quill.register(CustomBlockquote);
Quill.register(CustomBold);
Quill.register(CustomCodeBlock);

interface MaterialContentProps {
  initialContent: string;
}

export const MaterialContent: FC<MaterialContentProps> = ({ initialContent }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: false, // Disable the toolbar
      },
      formats: ['paragraph', 'header', 'blockquote', 'bold', 'code-block'],
    });

    const markdownOptions = {
      // Additional options can be added here
    };

    new QuillMarkdown(editor, markdownOptions);

    // Set initial content
    editor.clipboard.dangerouslyPasteHTML(initialContent);

    // Handle changes
    editor.on('text-change', () => {
      console.log(editor.root.innerHTML); // Handle the editor content change as needed
    });
  }, [initialContent]);

  return (
    <div className="material-content h-full w-full flex">
        <div id="editor" ref={editorRef} className="h-full w-full"></div>
    </div>
  );
};
