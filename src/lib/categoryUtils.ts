import { supabase } from "./supabase";

export interface CategoryNode {
  name: string;
  fullName: string;
  children: CategoryNode[];
}

/**
 * Fetches all unique product categories from Supabase.
 */
export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("status", "active")
    .not("category", "is", null);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Extract unique categories and filter out empty strings
  const categories = Array.from(
    new Set(data.map((item: { category: string }) => item.category))
  ).filter(Boolean);

  return categories;
}

/**
 * Builds a hierarchical category tree from a list of category strings.
 * Assumes categories are separated by " \&gt; ".
 */
export function buildCategoryTree(categories: string[]): CategoryNode[] {
  const rootNodes: CategoryNode[] = [];

  categories.forEach((categoryPath) => {
    const parts = categoryPath.split(/\s*>\s*/);
    let currentLevel = rootNodes;
    let currentPath = "";

    parts.forEach((part) => {
      currentPath = currentPath ? `${currentPath} > ${part}` : part;

      let node = currentLevel.find((n) => n.name === part);

      if (!node) {
        node = {
          name: part,
          fullName: currentPath,
          children: [],
        };
        currentLevel.push(node);
      }

      currentLevel = node.children;
    });
  });

  // Sort nodes alphabetically at each level
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((node) => sortNodes(node.children));
  };
  sortNodes(rootNodes);

  return rootNodes;
}
