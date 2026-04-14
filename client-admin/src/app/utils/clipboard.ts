/**
 * Copy text to clipboard with fallback for environments where Clipboard API is blocked
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try modern Clipboard API first (only if available and in secure context)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Silently fall through to fallback method
      // This is expected behavior in iframes and some embedded contexts
    }
  }

  // Fallback method using textarea (works in all browsers and contexts)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make the textarea invisible
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    // Try to copy
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    return successful;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
};