declare module 'quilljs-markdown' {
    import Quill from 'quill';
  
    interface QuillMarkdownOptions {
      // Add any specific options you need here
    }
  
    class QuillMarkdown {
      constructor(quill: Quill, options?: QuillMarkdownOptions);
    }
  
    export default QuillMarkdown;
  }
  