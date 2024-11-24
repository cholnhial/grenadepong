export function generatePeerId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
  return `GP-${randomNum}`;
}
