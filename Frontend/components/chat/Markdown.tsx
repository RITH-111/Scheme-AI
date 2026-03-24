'use client'

interface MarkdownProps {
  content: string
}

export function Markdown({ content }: MarkdownProps) {
  // Simple markdown parser for basic formatting
  let rendered = content

  // Bold text
  rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Italic text
  rendered = rendered.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Links
  rendered = rendered.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" class="text-accent hover:underline">$1</a>'
  )

  // Convert line breaks to <br> tags
  rendered = rendered.replace(/\n/g, '<br />')

  return (
    <div
      dangerouslySetInnerHTML={{ __html: rendered }}
      className="text-sm leading-relaxed"
    />
  )
}
