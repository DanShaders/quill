import { ClassAttributor, Scope, StyleAttributor } from 'parchment';

const SizeClass = new ClassAttributor('size', 'ql-size', {
  scope: Scope.INLINE,
  whitelist: ['xsmall', 'small', 'large', 'xlarge', 'xxlarge'],
});
const SizeStyle = new StyleAttributor('size', 'font-size', {
  scope: Scope.INLINE,
  whitelist: ['10px', '13px', '18px', '24px', '32px'],
});

export { SizeClass, SizeStyle };
