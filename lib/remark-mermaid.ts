type MarkdownNode = {
  type?: string;
  lang?: string | null;
  value?: string;
  children?: MarkdownNode[];
};

/** Converts standard ```mermaid fences into the Blog's diagram component. */
export function remarkMermaid() {
  return (tree: MarkdownNode) => {
    const transform = (node: MarkdownNode): MarkdownNode => {
      if (node.type === "code" && node.lang === "mermaid" && node.value) {
        return {
          type: "mdxJsxFlowElement",
          name: "MermaidDiagram",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "chart",
              value: node.value,
            },
          ],
          children: [],
        } as MarkdownNode;
      }

      if (node.children) {
        return { ...node, children: node.children.map(transform) };
      }
      return node;
    };

    Object.assign(tree, transform(tree));
  };
}
