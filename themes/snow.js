import merge from 'lodash.merge';
import Emitter from '../core/emitter';
import BaseTheme, { BaseTooltip } from './base';
import LinkBlot from '../formats/link';
import Formula from '../formats/formula';
import { Range } from '../core/selection';
import icons from '../ui/icons';

const TOOLBAR_CONFIG = [
  [{ header: ['1', '2', '3', false] }],
  ['bold', 'italic', 'underline', 'link'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

class SnowTooltip extends BaseTooltip {
  constructor(quill, bounds) {
    super(quill, bounds);
    this.linkPreview = this.root.querySelector('a.ql-link-preview');
    this.formulaPreview = this.root.querySelector('span.ql-formula-preview');
  }

  listen() {
    super.listen();
    this.root
      .querySelector('a.ql-action')
      .addEventListener('click', (event) => {
        if (this.root.classList.contains('ql-editing')) {
          this.save();
        } else {
          const mode = this.root.getAttribute('data-mode');
          if (mode === 'formula-preview') {
            this.edit('formula', this.formulaPreview.textContent, 'from-edit');
          } else {
            this.edit('link', this.linkPreview.textContent);
          }
        }
        event.preventDefault();
      });
    this.root
      .querySelector('a.ql-remove')
      .addEventListener('click', (event) => {
        const mode = this.root.getAttribute('data-mode');
        if (mode === 'link-preview') {
          if (this.linkRange != null) {
            const range = this.linkRange;
            this.restoreFocus();
            this.quill.formatText(range, 'link', false, Emitter.sources.USER);
            delete this.linkRange;
          }
        } else if (mode === 'formula-preview') {
          const index = this.quill.getIndex(this.currentBlot);
          this.quill.deleteText(index, 1, Emitter.sources.USER);
        }
        event.preventDefault();
        this.hide();
      });
    this.quill.on(
      Emitter.events.SELECTION_CHANGE,
      (range, oldRange, source) => {
        if (range == null) return;
        if (range.length === 0 && source === Emitter.sources.USER) {
          const [link, offset] = this.quill.scroll.descendant(
            LinkBlot,
            range.index,
          );
          if (link != null) {
            this.linkRange = new Range(range.index - offset, link.length());
            const preview = LinkBlot.formats(link.domNode);
            this.linkPreview.textContent = preview;
            this.linkPreview.setAttribute('href', preview);
            this.root.setAttribute('data-mode', 'link-preview');
            this.show();
            this.position(this.quill.getBounds(this.linkRange));
            return;
          }
        } else {
          delete this.linkRange;
        }
        this.hide();
      },
    );
    this.quill.on(Emitter.events.EMBED_CLICK, (event, blot) => {
      this.currentBlot = blot;
      if (blot instanceof Formula) {
        this.formulaPreview.textContent = blot.value().formula;
        this.root.setAttribute('data-mode', 'formula-preview');
        this.show();
        this.position(this.quill.getBounds(this.quill.getIndex(blot)));
      }
    });
  }

  show() {
    super.show();
  }
}
SnowTooltip.TEMPLATE = [
  '<span class="ql-formula-preview"></span>',
  '<a class="ql-link-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>',
  '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">',
  '<a class="ql-action"></a>',
  '<a class="ql-remove"></a>',
].join('');

class SnowTheme extends BaseTheme {
  constructor(quill, options) {
    if (
      options.modules.toolbar != null &&
      options.modules.toolbar.container == null
    ) {
      options.modules.toolbar.container = TOOLBAR_CONFIG;
    }
    super(quill, options);
    this.quill.container.classList.add('ql-snow');
  }

  extendToolbar(toolbar) {
    toolbar.container.classList.add('ql-snow');
    this.buildButtons(toolbar.container.querySelectorAll('button'), icons);
    this.buildPickers(toolbar.container.querySelectorAll('select'), icons);
    this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
    if (toolbar.container.querySelector('.ql-link')) {
      this.quill.keyboard.addBinding(
        { key: 'k', shortKey: true },
        (range, context) => {
          toolbar.handlers.link.call(toolbar, !context.format.link);
        },
      );
    }
  }
}
SnowTheme.DEFAULTS = merge({}, BaseTheme.DEFAULTS, {
  modules: {
    toolbar: {
      handlers: {
        link(value) {
          if (value) {
            const range = this.quill.getSelection();
            if (range == null || range.length === 0) return;
            let preview = this.quill.getText(range);
            if (
              /^\S+@\S+\.\S+$/.test(preview) &&
              preview.indexOf('mailto:') !== 0
            ) {
              preview = `mailto:${preview}`;
            }
            const { tooltip } = this.quill.theme;
            tooltip.edit('link', preview);
          } else {
            this.quill.format('link', false);
          }
        },
      },
    },
  },
});

export default SnowTheme;
