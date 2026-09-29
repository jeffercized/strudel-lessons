import { createPlaybackCoordinator } from '../lib/playback';

/** One per page: lesson blocks and drills all go through it, so only one thing plays at a time. */
export const playback = createPlaybackCoordinator();
