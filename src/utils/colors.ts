export const getColorForBatch = (id: string) => {
  const colors = [
    '#1A1A24', // Deep Navy
    '#1E1A1D', // Dark Plum
    '#1A241E', // Forest Dark
    '#241A1A', // Deep Red
    '#1A2024', // Dark Slate
    '#22201A', // Dark Gold
    '#1C1C1E', // Almost Black
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
