import katex from 'katex';
import Embed from '../blots/embed';
import Emitter from '../core/emitter';

const FORMULA_MAGIC = 'H16YohxG=';

class Formula extends Embed {
  constructor(scroll, node) {
    super(scroll, node);
    node.addEventListener('click', (event) => {
      this.scroll.emitter.emit(Emitter.events.EMBED_CLICK, event, this);
    });
  }

  static create(value) {
    if (value.startsWith(FORMULA_MAGIC)) {
      try {
        value = value
          .substr(FORMULA_MAGIC.length)
          .replaceAll('&quot;', '"')
          .replaceAll('&amp;', '&');
      } catch (e) {
        value = null;
      }
    }
    const node = super.create(value);
    if (typeof value === 'string') {
      katex.render(value, node, {
        throwOnError: false,
        errorColor: '#f00',
      });
      node.setAttribute('data-value', value);
    }
    return node;
  }

  static value(domNode) {
    return domNode.getAttribute('data-value');
  }

  html() {
    let { formula } = this.value();
    formula =
      FORMULA_MAGIC +
      formula.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    return `<formula data-value="${formula}"></formula>`;
  }
}
Formula.blotName = 'formula';
Formula.className = 'ql-formula';
Formula.tagName = 'FORMULA';

export default Formula;
