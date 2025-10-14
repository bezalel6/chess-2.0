// Sound effects service for chess events
// Uses HTML5 Audio API for simple, efficient sound playback

import { browser } from '$app/environment';
import { base } from '$app/paths';

type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'promote' | 'game-end';

interface Sound {
	audio: HTMLAudioElement;
	volume: number;
}

class SoundService {
	private sounds = new Map<SoundType, Sound>();
	private enabled = $state(true);
	private initialized = false;

	constructor() {
		// Only initialize in browser environment
		if (browser) {
			this.init();
		}
	}

	private init(): void {
		if (this.initialized) return;
		this.initialized = true;

		// Initialize sound files (.wav format)
		this.loadSound('move', `${base}/sounds/move.wav`, 0.5);
		this.loadSound('capture', `${base}/sounds/capture.wav`, 0.6);
		this.loadSound('check', `${base}/sounds/check.wav`, 0.7);
		this.loadSound('castle', `${base}/sounds/castle.wav`, 0.5);
		this.loadSound('promote', `${base}/sounds/promote.wav`, 0.6);
		this.loadSound('game-end', `${base}/sounds/game-end.wav`, 0.7);
	}

	private loadSound(type: SoundType, src: string, volume: number): void {
		if (!browser) return;

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
		if (!browser || !this.enabled) return;

		// Lazy init if needed
		if (!this.initialized) {
			this.init();
		}

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
		if (!browser) return;

		const sound = this.sounds.get(type);
		if (sound) {
			sound.volume = Math.max(0, Math.min(1, volume));
		}
	}
}

// Export singleton instance
export const soundService = new SoundService();
