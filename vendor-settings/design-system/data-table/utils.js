export const getMaxDepth = (headers) => {
  let maxDepth = 0;
  let queue = headers.map((header) => ({ node: header, depth: 1 }));

  while (queue.length) {
    const { node, depth } = queue.shift();
    maxDepth = Math.max(maxDepth, depth);

    if (node.children && node.children.length) {
      queue.push(
        ...node.children.map((child) => ({ node: child, depth: depth + 1 })),
      );
    }
  }

  return maxDepth;
};

export const getGroupedHeaders = (columnsHeader) => {
  const edges = {}; // Store parent-child relationships

  columnsHeader.forEach((columnHeader) => {
    if (columnHeader.parentHeader) {
      if (!edges[columnHeader.parentHeader]) {
        edges[columnHeader.parentHeader] = [];
      }
      edges[columnHeader.parentHeader].push(columnHeader); // Add child to parent
    } else {
      if (!edges[columnHeader.key]) {
        edges[columnHeader.key] = [];
      }
    }
  });

  const buildHierarchy = (parentKey) => ({
    key: parentKey,
    children:
      edges[parentKey]?.map((child) => ({
        ...child,
        children: edges[child.key] ? buildHierarchy(child.key).children : [],
      })) || [],
  });

  const hierarchy = {};
  Object.keys(edges).forEach((key) => {
    if (
      !columnsHeader.find((header) => header.key === key && header.parentHeader)
    ) {
      hierarchy[key] = {
        ...buildHierarchy(key),
        ...columnsHeader.find((header) => header.key === key),
      };
    }
  });

  return hierarchy;
};
