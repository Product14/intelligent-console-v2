export class UserUtils {
  static getInitials(name: string) {
    // Ensure name is a string and not empty
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 1);
  }

  static getRandomColor(name: string) {
    const colors = [
      '#26b579', // green
      '#026aa2', // blue
      '#bf2e84', // pink
      '#ab6400', // amber
      '#007763', // teal
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
