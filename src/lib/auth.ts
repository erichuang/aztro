// Generate a deterministic color based on username hash
export function generateUserColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate HSL values that work well as background colors
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 85 + (Math.abs(hash) % 10); // 85-95% for light backgrounds
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Generate a slightly darker version for hover states
export function generateUserColorDark(username: string): string {
  const originalColor = generateUserColor(username);
  const match = originalColor.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
  if (match) {
    const [, h, s, l] = match;
    const newLightness = Math.max(70, parseInt(l) - 10);
    return `hsl(${h}, ${s}%, ${newLightness}%)`;
  }
  return originalColor;
}

// Generate initials from username
export function getUserInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
