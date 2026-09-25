/**
 * Utility to convert modern CSS color syntax (oklch, lch, lab, color-mix) to safe rgb/hex for html2canvas & jsPDF
 */
export const convertColorToRgb = (colorStr: string): string => {
  if (!colorStr) return colorStr;
  const lower = colorStr.toLowerCase().trim();
  if (
    lower === 'transparent' ||
    lower === 'inherit' ||
    lower === 'initial' ||
    lower === 'currentcolor' ||
    lower === 'none'
  ) {
    return colorStr;
  }
  if (
    !lower.includes('oklch') &&
    !lower.includes('lch') &&
    !lower.includes('lab') &&
    !lower.includes('color(') &&
    !lower.includes('color-mix')
  ) {
    return colorStr;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = colorStr;
      return ctx.fillStyle;
    }
  } catch (e) {
    console.warn('[Resume] Color conversion fallback for:', colorStr, e);
  }

  // Direct fallback mapping if canvas 2d parsing fails
  if (lower.includes('blue')) return '#0071e3';
  if (lower.includes('white')) return '#ffffff';
  if (lower.includes('gray') || lower.includes('grey') || lower.includes('neutral')) return '#737373';
  return '#000000';
};

export const sanitizeOklchString = (str: string): string => {
  if (!str) return str;
  if (
    !str.includes('oklch') &&
    !str.includes('lch') &&
    !str.includes('lab') &&
    !str.includes('color(') &&
    !str.includes('color-mix')
  ) {
    return str;
  }
  // Replace modern color syntax tokens with standard rgb/hex
  return str.replace(/(?:oklch|lch|lab|color|color-mix)\([^)]+\)/gi, (match) => {
    return convertColorToRgb(match);
  });
};

/**
 * Recursively copies all resolved computed styles from live preview DOM nodes to cloned nodes
 * without hardcoding fixed heights or compressing heading line-heights.
 */
export const inlineComputedStyles = (sourceEl: Element, targetEl: HTMLElement) => {
  const isHeading =
    sourceEl.classList?.contains('resume-section-heading') ||
    targetEl.classList?.contains('resume-section-heading');
  const computed = window.getComputedStyle(sourceEl);

  const propertiesToCopy = [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'letter-spacing',
    'word-spacing',
    'text-align',
    'text-decoration-line',
    'text-decoration-color',
    'text-decoration-style',
    'text-transform',
    'color',
    'background-color',
    'display',
    'flex-direction',
    'flex-wrap',
    'flex-grow',
    'flex-shrink',
    'align-items',
    'align-content',
    'justify-content',
    'gap',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-top-width',
    'border-top-style',
    'border-top-color',
    'border-bottom-width',
    'border-bottom-style',
    'border-bottom-color',
    'border-left-width',
    'border-left-style',
    'border-left-color',
    'border-right-width',
    'border-right-style',
    'border-right-color',
    'box-sizing',
    'white-space',
    'word-break',
    'overflow-wrap',
  ];

  if (!isHeading) {
    propertiesToCopy.push('line-height');
  }

  for (const prop of propertiesToCopy) {
    const val = computed.getPropertyValue(prop);
    if (val && val !== 'initial') {
      const cleanVal = sanitizeOklchString(val);
      targetEl.style.setProperty(prop, cleanVal, 'important');
    }
  }

  if (isHeading) {
    targetEl.style.setProperty('line-height', '1.45', 'important');
    targetEl.style.setProperty('padding-bottom', '4px', 'important');
    targetEl.style.setProperty('margin-bottom', '6px', 'important');
    targetEl.style.setProperty('border-bottom-width', '1px', 'important');
    targetEl.style.setProperty('border-bottom-style', 'solid', 'important');
    targetEl.style.setProperty('border-bottom-color', '#000000', 'important');
    targetEl.style.setProperty('display', 'block', 'important');
    targetEl.style.setProperty('width', '100%', 'important');
  }

  const sourceChildren = Array.from(sourceEl.children);
  const targetChildren = Array.from(targetEl.children) as HTMLElement[];

  for (let i = 0; i < sourceChildren.length && i < targetChildren.length; i++) {
    inlineComputedStyles(sourceChildren[i], targetChildren[i]);
  }
};
