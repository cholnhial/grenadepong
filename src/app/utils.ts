export function generatePeerId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
  return `GP-${randomNum}`;
}


export function isPlayerJoining() {
  return localStorage.getItem('mode') && localStorage.getItem('mode') === 'joining';
}

export function isPlayerHost() {
  return localStorage.getItem('mode') && localStorage.getItem('mode') === 'host';
}
