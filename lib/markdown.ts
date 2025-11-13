// A simple markdown to HTML converter that prioritizes security and correct block handling.
export function markdownToHtml(text: string): string {
  if (!text) return '';

  const escapeHtml = (unsafe: string): string => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  };

  // Process code blocks first to isolate them from other markdown processing.
  // We use a placeholder to swap them out and back in later.
  const codeBlocks: string[] = [];
  let processedText = text.replace(/```([\s\S]*?)```/g, (match, code) => {
    const escapedCode = escapeHtml(code.trim());
    const codeBlockHtml = `<pre class="bg-gray-800 text-white p-4 rounded-md overflow-x-auto my-2"><code class="font-mono text-sm">${escapedCode}</code></pre>`;
    codeBlocks.push(codeBlockHtml);
    return `%%CODE_BLOCK_${codeBlocks.length - 1}%%`;
  });

  // Now process the rest of the markdown.
  // First, escape any remaining HTML to prevent XSS.
  processedText = escapeHtml(processedText);
  
  // Inline formatting
  processedText = processedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>');       // Italic

  // Block-level formatting
  const blocks = processedText.split(/\n{2,}/);
  const htmlBlocks = blocks.map(block => {
    if (!block.trim()) return '';
    // Unordered lists
    if (block.match(/^- .*/)) {
      const items = block.split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    // For anything else, treat as a paragraph. Replace single newlines with <br>.
    return `<p>${block.replace(/\n/g, '<br />')}</p>`;
  });
  
  processedText = htmlBlocks.join('');

  // Restore code blocks by replacing placeholders
  processedText = processedText.replace(/<p>%%CODE_BLOCK_(\d+)%%<\/p>/g, (match, index) => {
    return codeBlocks[parseInt(index, 10)];
  });

  // Cleanup: remove <p> tags that might have wrapped around lists
  processedText = processedText.replace(/<p>(<(?:ul)[^>]*>[\s\S]*?<\/(?:ul)>)<\/p>/g, '$1');

  return processedText;
}
