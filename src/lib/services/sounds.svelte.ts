// Sound effects service for chess events
// Uses HTML5 Audio API for simple, efficient sound playback

type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'promote' | 'game-end';

interface Sound {
	audio: HTMLAudioElement;
	volume: number;
}

class SoundService {
	private sounds = new Map<SoundType, Sound>();
	private enabled = $state(true);

	constructor() {
		// Initialize sound files
		// Using free chess sounds from lichess.org-style sources
		this.loadSound('move', '/sounds/move.mp3', 0.5);
		this.loadSound('capture', '/sounds/capture.mp3', 0.6);
		this.loadSound('check', '/sounds/check.mp3', 0.7);
		this.loadSound('castle', '/sounds/castle.mp3', 0.5);
		this.loadSound('promote', '/sounds/promote.mp3', 0.6);
		this.loadSound('game-end', '/sounds/game-end.mp3', 0.7);
	}

	private loadSound(type: SoundType, src: string, volume: number): void {
		const audio = new Audio();
		audio.src = src;
		audio.volume = volume;
		audio.preload = 'auto';

		// Handle load errors gracefully
		audio.addEventListener('error', () => {
			console.warn(`Failed to load sound: ${type}`);
		});

		this.sounds.set(type, { audio, volume });
	}

	play(type: SoundType): void {
		if (!this.enabled) return;

		const sound = this.sounds.get(type);
		if (!sound) return;

		// Clone and play to allow overlapping sounds
		const { audio, volume } = sound;
		const clone = audio.cloneNode(true) as HTMLAudioElement;
		clone.volume = volume;

		// Play and clean up
		clone.play().catch((err) => {
			console.warn(`Failed to play sound: ${type}`, err);
		});

		// Clean up after playing
		clone.addEventListener('ended', () => {
			clone.remove();
		});
	}

	toggle(): void {
		this.enabled = !this.enabled;
	}

	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	setVolume(type: SoundType, volume: number): void {
		const sound = this.sounds.get(type);
		if (sound) {
			sound.volume = Math.max(0, Math.min(1, volume));
		}
	}
}

// Export singleton instance
export const soundService = new SoundService();
