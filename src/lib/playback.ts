export interface Player {
  stop(): void;
}

/** Makes sure only one block plays at a time on a page. */
export function createPlaybackCoordinator() {
  const players = new Map<string, Player>();
  let active: string | null = null;
  return {
    register(id: string, player: Player): void {
      players.set(id, player);
    },
    claim(id: string): void {
      for (const [otherId, player] of players) {
        if (otherId === id) continue;
        try {
          player.stop();
        } catch (err) {
          console.warn(`[playback] could not stop ${otherId}`, err);
        }
      }
      active = id;
    },
    release(id: string): void {
      if (active === id) active = null;
    },
    get active(): string | null {
      return active;
    },
  };
}
