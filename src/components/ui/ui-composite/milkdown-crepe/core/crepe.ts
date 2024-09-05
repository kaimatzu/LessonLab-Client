import type { DefaultValue } from '@milkdown/kit/core';
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/kit/core';

import { commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm';
import { history } from '@milkdown/kit/plugin/history';
import { indent, indentConfig } from '@milkdown/kit/plugin/indent';
import { getMarkdown, replaceAll } from '@milkdown/kit/utils';
import { clipboard } from '@milkdown/kit/plugin/clipboard';
import { trailing } from '@milkdown/kit/plugin/trailing';

import type { CrepeFeatureConfig } from '../feature';
import { CrepeFeature, defaultFeatures, loadFeature } from '../feature';
import { configureFeatures } from './slice';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
// import { placeholderCtx } from '@milkdown/plugin-placeholder';

export interface CrepeConfig {
  features?: Partial<Record<CrepeFeature, boolean>>;
  featureConfigs?: CrepeFeatureConfig;
  root?: Node | string | null;
  defaultValue?: DefaultValue;
  markdownRef?: React.MutableRefObject<string>;
  onUpdate: (newValue: string) => void; 
}

// TODO: Fix block dragging later. 
export class Crepe {
  static Feature = CrepeFeature;

  private editorInstance: Editor;
  private initPromise: Promise<unknown>;
  private rootElement: Node;
  private editable = true;
  private lastMarkdown: string = ''; // Track the last markdown value to prevent unnecessary updates

  constructor({
    root,
    features = {},
    featureConfigs = {},
    defaultValue = '',
    markdownRef,
    onUpdate,
  }: CrepeConfig & { onUpdate?: (markdown: string) => void }) {
    const enabledFeatures = Object.entries({
      ...defaultFeatures,
      ...features,
    })
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature as CrepeFeature);

    this.rootElement =
      (typeof root === 'string' ? document.querySelector(root) : root) ?? document.body;

    this.editorInstance = Editor.make()
      .config(configureFeatures(enabledFeatures))
      .config((ctx) => {
        ctx.set(rootCtx, this.rootElement);
        ctx.set(defaultValueCtx, defaultValue);
        ctx.set(editorViewOptionsCtx, {
          editable: () => this.editable,
        });
        ctx.update(indentConfig.key, (value) => ({
          ...value,
          size: 4,
        }));

        ctx.get(listenerCtx)
          .markdownUpdated((ctx, markdown, prevMarkdown) => {
            if (markdownRef) {
              markdownRef.current = markdown;
            }

            // Check if the new markdown is different from the previous one
            if (onUpdate && markdown !== this.lastMarkdown) {
              console.log("Updating markdown", markdown);
              this.lastMarkdown = markdown; // Update the tracked last markdown value
              onUpdate(markdown); // Trigger the onUpdate function if there's a change
            }
          });
      })
      .use(commonmark)
      .use(listener)
      .use(history)
      .use(indent)
      .use(trailing)
      .use(clipboard)
      .use(gfm);

    const promiseList: Promise<unknown>[] = [];

    enabledFeatures.forEach((feature) => {
      const config = (featureConfigs as Partial<Record<CrepeFeature, never>>)[feature];
      promiseList.push(loadFeature(feature, this.editorInstance, config));
    });

    this.initPromise = Promise.all(promiseList);
  }

  async create() {
    await this.initPromise;
    return this.editorInstance.create();
  }

  async destroy() {
    await this.initPromise;
    return this.editorInstance.destroy();
  }

  get editor(): Editor {
    return this.editorInstance;
  }

  setReadonly(value: boolean) {
    this.editable = !value;
    return this;
  }

  getMarkdown() {
    return this.editorInstance.action(getMarkdown());
  }

  setMarkdown(markdown: string) {
    // Avoid setting markdown if it hasn't changed to prevent infinite updates
    if (markdown !== this.lastMarkdown) {
      this.lastMarkdown = markdown; // Update the tracked markdown
      this.editorInstance.action(replaceAll(markdown));
    }
  }
}
