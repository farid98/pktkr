type MarkdownNode = {
  type: string;
  value?: string;
  children?: MarkdownNode[];
};

const highlightPattern = /==(?:(red|green|blue|yellow)::)?(.+?)==/g;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function transformText(value: string): MarkdownNode[] | null {
  highlightPattern.lastIndex = 0;
  const nodes: MarkdownNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = highlightPattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }

    const color = match[1] ?? "yellow";
    const text = match[2];
    nodes.push({
      type: "html",
      value: `<mark class="md-highlight md-highlight-${color}">${escapeHtml(text)}</mark>`,
    });
    lastIndex = match.index + match[0].length;
  }

  if (nodes.length === 0) return null;
  if (lastIndex < value.length) {
    nodes.push({ type: "text", value: value.slice(lastIndex) });
  }
  return nodes;
}

function transformTree(node: MarkdownNode) {
  if (!node.children) return;

  const children: MarkdownNode[] = [];
  for (const child of node.children) {
    if (child.type === "text" && child.value) {
      children.push(...(transformText(child.value) ?? [child]));
    } else {
      transformTree(child);
      children.push(child);
    }
  }
  node.children = children;
}

export function remarkHighlights() {
  return (tree: MarkdownNode) => transformTree(tree);
}
