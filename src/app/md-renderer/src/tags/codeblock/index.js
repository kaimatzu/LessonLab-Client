import AbstractTag from '../AbstractTag.js';
import meta from './meta.js';

class Codeblock extends AbstractTag {
  constructor(quillJS, options = {}) {
    super();
    this.quillJS = quillJS;
    this.name = 'pre';
    this.pattern = this._getCustomPatternOrDefault(options, this.name, /^(```).*/g);
    this.getAction.bind(this);
    this._meta = meta();
    this.activeTags = this._getActiveTagsWithoutIgnore(this._meta.applyHtmlTags, options.ignoreTags);
  }

  getAction() {
    return {
      name: this.name,
      pattern: this.pattern,
      action: (text, selection, pattern) => new Promise((resolve) => {
        const match = pattern.exec(text);
        if (!match || !this.activeTags.length) {
          resolve(false);
          return;
        }

        const originalText = match[0] || '';
        setTimeout(() => {
          const startIndex = selection.index - originalText.length;
          this.quillJS.deleteText(startIndex, originalText.length);
          setTimeout(() => {
            console.log("aaaaaaaaaa")
            const codeBlockContainer = document.createElement('div');
            codeBlockContainer.className = 'code-block-container';

            const initialLine = document.createElement('div');
            initialLine.className = 'code-block';
            initialLine.appendChild(document.createTextNode(''));

            codeBlockContainer.appendChild(initialLine);

            // this.quillJS.clipboard.dangerouslyPasteHTML(startIndex, codeBlockContainer.outerHTML);
            this.quillJS.clipboard.dangerouslyPasteHTML(startIndex, '<div class="ql-syntax">Fuck</div>');
            resolve(true);
          }, 0);
        }, 0);
      }),
      release: () => {
        setTimeout(() => {
          const contentIndex = this.quillJS.getSelection().index;

          const [, length] = this.quillJS.getLine(contentIndex);
          if (length === 0) {
            const [block] = this.quillJS.getLine(contentIndex - 1);
            if (block && block.domNode.className === 'code-block') {
              this.quillJS.format('code-block', false);
            }
          }
        }, 0);
      }
    }
  }
}

export default Codeblock;
