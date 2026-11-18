/** Downloads text content as a file, entirely client-side (Blob + object URL). */
export function downloadText(filename: string, content: string, mime = 'text/plain'): void {
  // AutoHotkey reads UTF-8 with BOM reliably on every Windows version.
  const bom = filename.endsWith('.ahk') ? '﻿' : '';
  const blob = new Blob([bom + content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
