export function getCategories() {
  // Use the build-time categories injected by Vite
  const categories = (import.meta.env.DYNAMIC_CATEGORIES as unknown as string[]) || [];
  return [...categories].sort();
}

export function getCategoryMetadata() {
  const categories = getCategories();
  return categories.map(category => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    href: `/${category}`,
    id: category
  }));
}
