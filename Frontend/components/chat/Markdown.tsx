'use client'

interface MarkdownProps {
  content: string
}

export function Markdown({ content }: MarkdownProps) {
  const escapeHtml = (value: string): string =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  // Escape raw HTML first so tags like <script> are rendered as text.
  let rendered = escapeHtml(content)

  // Bold text
  rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Italic text
  rendered = rendered.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Links
  rendered = rendered.replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, href) => {
    const safeHref = String(href).trim()
    if (!/^https?:\/\//i.test(safeHref)) {
      return label
    }
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">${label}</a>`
  })

  // Convert line breaks to <br> tags
  rendered = rendered.replace(/\n/g, '<br />')

  return (
    <div
      dangerouslySetInnerHTML={{ __html: rendered }}
      className="text-sm leading-relaxed"
    />
  )
}
