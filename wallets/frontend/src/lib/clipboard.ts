export async function copyTextToClipboard(text: string): Promise<boolean> {
  let fallbackInput: HTMLTextAreaElement | null = null;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    fallbackInput = document.createElement('textarea');
    fallbackInput.value = text;
    fallbackInput.style.position = 'fixed';
    fallbackInput.style.opacity = '0';
    document.body.appendChild(fallbackInput);
    fallbackInput.focus();
    fallbackInput.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    if (fallbackInput?.parentNode) {
      fallbackInput.parentNode.removeChild(fallbackInput);
    }
  }
}
