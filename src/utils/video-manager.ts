import { GodMood } from "../types";

export class MoodVideoManager {
    private primaryVideo: HTMLVideoElement;
    private secondaryVideo: HTMLVideoElement;
    private currentMood: GodMood = GodMood.Neutral;
    private isPlayingChewing: boolean = false;
    private isPlayingGameOver: boolean = false;
    private isPlayingLobby: boolean = false; // Track if we're showing lobby video
    private userHasInteracted: boolean = false; // Track user interaction for autoplay
    
    private moodVideos: Record<GodMood, string> = {
        [GodMood.Burned]: '/assets/videos/endings/defeat.webm', // Use defeat for burned
        [GodMood.Angry]: '/assets/videos/moods/angry.webm',
        [GodMood.Neutral]: '/assets/videos/moods/neutral.webm',
        [GodMood.Happy]: '/assets/videos/moods/happy.webm'
    };
    
    // Mood-specific chewing videos
    private chewingVideos: Record<GodMood, string> = {
        [GodMood.Neutral]: '/assets/videos/animations/chewing_neutral.webm',
        [GodMood.Happy]: '/assets/videos/animations/chewing_happy.webm',
        [GodMood.Angry]: '/assets/videos/animations/chewing_angry.webm',
        [GodMood.Burned]: '/assets/videos/animations/chewing_angry.webm' // Fallback
    };
    
    // Transition videos (from_to mapping)
    private transitionVideos: Map<string, string> = new Map([
        ['0_1', '/assets/videos/transitions/neutral_happy.webm'],
        ['1_0', '/assets/videos/transitions/happy_neutral.webm'],
        ['0_-1', '/assets/videos/transitions/neutral_evel.webm'],
        ['-1_0', '/assets/videos/transitions/evel_neutral.webm'],
    ]);
    
    private lobbyWaitingVideo = '/assets/videos/lobby/waiting.webm';
    private victoryVideo = '/assets/videos/endings/victory.webm';
    private defeatVideo = '/assets/videos/endings/defeat.webm';
    
    private preloadedVideos: Map<string, HTMLVideoElement> = new Map();
    private preloadedImages: Map<string, HTMLImageElement> = new Map();
    private loadedCount: number = 0;
    private totalAssets: number = 14; // 13 videos + 1 image
    
    constructor(container: HTMLElement) {
        // Get the two video elements from the container
        this.primaryVideo = container.querySelector('#video-primary') as HTMLVideoElement;
        this.secondaryVideo = container.querySelector('#video-secondary') as HTMLVideoElement;
        
        if (!this.primaryVideo || !this.secondaryVideo) {
            throw new Error('Video elements not found in container');
        }
        
        // Set default properties
        [this.primaryVideo, this.secondaryVideo].forEach(video => {
            video.muted = true;
            video.playsInline = true;
        });
        
        this.primaryVideo.style.opacity = '1';
        this.secondaryVideo.style.opacity = '0';
        
        // Track any user interaction for autoplay policy (TV/Projector may receive input)
        const markInteracted = () => {
            this.userHasInteracted = true;
        };
        
        document.addEventListener('click', markInteracted, { once: true });
        document.addEventListener('touchstart', markInteracted, { once: true });
        document.addEventListener('keydown', markInteracted, { once: true });
    }
    
    async preloadAllVideos(): Promise<void> {
        console.log('🎬 Starting asset preload...');
        
        const videoUrls = [
            // Mood loops (only 3: neutral, happy, angry - burned uses defeat)
            this.moodVideos[GodMood.Neutral],
            this.moodVideos[GodMood.Happy],
            this.moodVideos[GodMood.Angry],
            // Chewing animations
            ...Object.values(this.chewingVideos).filter((v, i, arr) => arr.indexOf(v) === i), // Remove duplicates
            // Transitions
            ...Array.from(this.transitionVideos.values()),
            // Lobby waiting
            this.lobbyWaitingVideo,
            // Endings
            this.victoryVideo,
            this.defeatVideo
        ];
        
        const imageUrls = [
            '/assets/images/background-lobby.jpg'
        ];
        
        const videoPromises = videoUrls.map(url => this.preloadVideo(url));
        const imagePromises = imageUrls.map(url => this.preloadImage(url));
        
        await Promise.all([...videoPromises, ...imagePromises]);
        
        console.log('✅ All assets preloaded successfully');
    }
    
    private async preloadVideo(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;
            video.src = url;
            
            const onCanPlay = () => {
                this.loadedCount++;
                this.preloadedVideos.set(url, video);
                console.log(`📹 Loaded: ${url} (${this.loadedCount}/${this.totalAssets})`);
                cleanup();
                resolve();
            };
            
            const onError = () => {
                console.error(`❌ Failed to load: ${url}`);
                cleanup();
                reject(new Error(`Failed to load video: ${url}`));
            };
            
            const cleanup = () => {
                video.removeEventListener('canplaythrough', onCanPlay);
                video.removeEventListener('error', onError);
            };
            
            video.addEventListener('canplaythrough', onCanPlay);
            video.addEventListener('error', onError);
            
            // Start loading
            video.load();
        });
    }
    
    private async preloadImage(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            
            const onLoad = () => {
                this.loadedCount++;
                this.preloadedImages.set(url, img);
                console.log(`🖼️ Loaded: ${url} (${this.loadedCount}/${this.totalAssets})`);
                cleanup();
                resolve();
            };
            
            const onError = () => {
                console.error(`❌ Failed to load image: ${url}`);
                cleanup();
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            const cleanup = () => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
            };
            
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
        });
    }
    
    getLoadingProgress(): number {
        return this.totalAssets > 0 ? (this.loadedCount / this.totalAssets) * 100 : 0;
    }
    
    async setMood(mood: GodMood, force: boolean = false): Promise<void> {
        // Skip if same mood unless forcing (e.g., coming from lobby) or if currently playing non-mood video
        if (!force && !this.isPlayingLobby && mood === this.currentMood) {
            return;
        }
        
        if (this.isPlayingChewing || this.isPlayingGameOver) {
            return;
        }
        
        console.log(`🎭 Changing mood to: ${mood}${force ? ' (forced)' : ''}`);
        this.currentMood = mood;
        this.isPlayingLobby = false; // No longer playing lobby video
        await this.playVideoWithCrossfade(this.moodVideos[mood], true);
    }
    
    async setLobbyWaiting(): Promise<void> {
        if (this.isPlayingGameOver) return;
        console.log('📺 Playing lobby waiting video');
        this.isPlayingLobby = true;
        await this.playVideoWithCrossfade(this.lobbyWaitingVideo, true);
    }
    
    async playChewing(currentMood: GodMood, newMood: GodMood, onComplete?: () => void): Promise<void> {
        if (this.isPlayingChewing || this.isPlayingGameOver) return;
        
        this.isPlayingChewing = true;
        this.isPlayingLobby = false; // Ensure we're not in lobby mode
        
        // 1. Play chewing animation for CURRENT mood (before change)
        const chewingVideo = this.chewingVideos[currentMood] || this.chewingVideos[GodMood.Neutral];
        console.log(`🍽️ Playing chewing animation for mood: ${currentMood}`);
        await this.playVideoOnce(chewingVideo);
        
        // 2. Play transition(s) if mood changed
        if (currentMood !== newMood) {
            console.log(`🔄 Transitioning from ${currentMood} to ${newMood}`);
            await this.playTransition(currentMood, newMood);
        }
        
        // 3. Start new mood loop
        this.currentMood = newMood;
        console.log(`🎭 Starting ${newMood} mood loop`);
        await this.playVideoWithCrossfade(this.moodVideos[newMood], true);
        
        this.isPlayingChewing = false;
        
        if (onComplete) {
            onComplete();
        }
    }
    
    private getTransitionVideo(fromMood: GodMood, toMood: GodMood): string | null {
        const key = `${fromMood}_${toMood}`;
        return this.transitionVideos.get(key) || null;
    }
    
    private async playTransition(fromMood: GodMood, toMood: GodMood): Promise<void> {
        const directTransition = this.getTransitionVideo(fromMood, toMood);
        
        if (directTransition) {
            // Direct transition exists
            console.log(`▶️ Playing direct transition: ${fromMood} → ${toMood}`);
            await this.playVideoOnce(directTransition);
        } else if (fromMood !== GodMood.Neutral && toMood !== GodMood.Neutral) {
            // Go via neutral (e.g., happy -> angry)
            const toNeutral = this.getTransitionVideo(fromMood, GodMood.Neutral);
            const fromNeutral = this.getTransitionVideo(GodMood.Neutral, toMood);
            
            if (toNeutral && fromNeutral) {
                console.log(`▶️ Playing two-step transition: ${fromMood} → neutral → ${toMood}`);
                await this.playVideoOnce(toNeutral);
                await this.playVideoOnce(fromNeutral);
            }
        }
        // If no transition available, skip to new mood
    }
    
    private async playVideoOnce(url: string): Promise<void> {
        // Determine which video will become active after crossfade
        const currentActive = this.primaryVideo.style.opacity === '1' ? this.primaryVideo : this.secondaryVideo;
        const nextActive = currentActive === this.primaryVideo ? this.secondaryVideo : this.primaryVideo;
        
        await this.playVideoWithCrossfade(url, false);
        
        // Wait for video to end (with timeout fallback)
        return new Promise<void>((resolve) => {
            let resolved = false;
            
            const onEnded = () => {
                if (resolved) return;
                resolved = true;
                nextActive.removeEventListener('ended', onEnded);
                resolve();
            };
            
            // Add timeout fallback in case video didn't play or has issues
            const timeout = setTimeout(() => {
                if (!resolved) {
                    console.warn(`⚠️ Video playback timeout for ${url}, continuing...`);
                    resolved = true;
                    nextActive.removeEventListener('ended', onEnded);
                    resolve();
                }
            }, 10000); // 10 second timeout
            
            nextActive.addEventListener('ended', () => {
                clearTimeout(timeout);
                onEnded();
            });
        });
    }
    
    playGameOver(isVictory: boolean) {
        console.log(`🏁 Playing game over: ${isVictory ? 'Victory' : 'Defeat'}`);
        this.isPlayingGameOver = true;
        
        const videoUrl = isVictory ? this.victoryVideo : this.defeatVideo;
        this.playVideoWithCrossfade(videoUrl, true);
    }
    
    private async playVideoWithCrossfade(url: string, loop: boolean): Promise<void> {
        // Determine which video is currently active
        const activeVideo = this.primaryVideo.style.opacity === '1' ? this.primaryVideo : this.secondaryVideo;
        const inactiveVideo = activeVideo === this.primaryVideo ? this.secondaryVideo : this.primaryVideo;
        
        // Get preloaded video element
        const preloadedVideo = this.preloadedVideos.get(url);
        if (preloadedVideo) {
            // Copy the preloaded video source to inactive video
            inactiveVideo.src = preloadedVideo.src;
        } else {
            // Fallback to direct URL if not preloaded
            inactiveVideo.src = url;
        }
        
        inactiveVideo.loop = loop;
        inactiveVideo.currentTime = 0;
        
        // Ensure video is muted for autoplay
        inactiveVideo.muted = true;
        inactiveVideo.playsInline = true;
        
        try {
            await inactiveVideo.play();
            
            // Video played successfully - mark user interaction as not needed
            this.userHasInteracted = true;
            
            // Crossfade
            activeVideo.style.transition = 'opacity 0.5s ease-in-out';
            inactiveVideo.style.transition = 'opacity 0.5s ease-in-out';
            
            activeVideo.style.opacity = '0';
            inactiveVideo.style.opacity = '1';
            
            // Pause and reset the now-inactive video after transition
            setTimeout(() => {
                try {
                    activeVideo.pause();
                    activeVideo.currentTime = 0;
                } catch (e) {
                    // Ignore errors when pausing (e.g., if already paused)
                }
            }, 500);
            
        } catch (err) {
            // Autoplay blocked - this is a TV/Projector display, fail silently
            console.warn('Video autoplay blocked (TV/Projector display):', err);
            
            // Try again if user has interacted
            if (this.userHasInteracted) {
                try {
                    await inactiveVideo.play();
                    // Crossfade
                    activeVideo.style.transition = 'opacity 0.5s ease-in-out';
                    inactiveVideo.style.transition = 'opacity 0.5s ease-in-out';
                    activeVideo.style.opacity = '0';
                    inactiveVideo.style.opacity = '1';
                    setTimeout(() => {
                        try {
                            activeVideo.pause();
                            activeVideo.currentTime = 0;
                        } catch (e) { /* Ignore */ }
                    }, 500);
                } catch (retryErr) {
                    console.warn('Retry also failed, continuing without video:', retryErr);
                }
            }
            // Continue silently - don't block the interface
        }
    }
    
    getCurrentMood(): GodMood {
        return this.currentMood;
    }
}
