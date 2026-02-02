import { GodMood } from "../types";

export class MoodVideoManager {
    private primaryVideo: HTMLVideoElement;
    private secondaryVideo: HTMLVideoElement;
    private currentMood: GodMood = GodMood.Neutral;
    private isPlayingChewing: boolean = false;
    private isPlayingGameOver: boolean = false;
    private isPlayingLobby: boolean = false; // Track if we're showing lobby video
    private userHasInteracted: boolean = false; // Track user interaction for autoplay
    
    // Mood loop videos - only 3 exist: angry, neutral, happy
    // Burned mood uses angry video during gameplay (burned ending shown at game over)
    private moodVideos: Record<GodMood, string> = {
        [GodMood.Burned]: '/assets/videos/moods/angry.webm',  // Use angry during gameplay
        [GodMood.Angry]: '/assets/videos/moods/angry.webm',
        [GodMood.Neutral]: '/assets/videos/moods/neutral.webm',
        [GodMood.Happy]: '/assets/videos/moods/happy.webm'
    };
    
    // Mood-specific chewing videos - only 3 exist: angry, neutral, happy
    // Burned mood uses angry chewing video
    private chewingVideos: Record<GodMood, string> = {
        [GodMood.Neutral]: '/assets/videos/animations/chewing_neutral.webm',
        [GodMood.Happy]: '/assets/videos/animations/chewing_happy.webm',
        [GodMood.Angry]: '/assets/videos/animations/chewing_angry.webm',
        [GodMood.Burned]: '/assets/videos/animations/chewing_angry.webm'  // Use angry
    };
    
    // Transition videos (from_to mapping)
    // Mood values: Happy=1, Neutral=0, Angry=-1, Burned=-2
    private transitionVideos: Map<string, string> = new Map([
        ['0_1', '/assets/videos/transitions/neutral_happy.webm'],   // Neutral → Happy
        ['1_0', '/assets/videos/transitions/happy_neutral.webm'],   // Happy → Neutral
        ['0_-1', '/assets/videos/transitions/neutral_angry.webm'],  // Neutral → Angry
        ['-1_0', '/assets/videos/transitions/angry_neutral.webm'],  // Angry → Neutral
    ]);
    
    private lobbyWaitingVideo = '/assets/videos/lobby/waiting.webm';
    private happyEndingVideo = '/assets/videos/endings/happy_ending.webm';
    private neutralEndingVideo = '/assets/videos/endings/neutral_ending.webm';
    private angryEndingVideo = '/assets/videos/endings/angry_ending.webm';
    private burnedEndingVideo = '/assets/videos/endings/burned_ending.webm';
    
    private preloadedVideos: Map<string, HTMLVideoElement> = new Map();
    private preloadedImages: Map<string, HTMLImageElement> = new Map();
    private loadedCount: number = 0;
    private totalAssets: number = 18; // 15 videos + 3 images (lobby bg + 2 logos)
    
    constructor(container: HTMLElement) {
        // Get the two video elements from the container
        this.primaryVideo = container.querySelector('#video-primary') as HTMLVideoElement;
        this.secondaryVideo = container.querySelector('#video-secondary') as HTMLVideoElement;
        
        if (!this.primaryVideo || !this.secondaryVideo) {
            throw new Error('Video elements not found in container');
        }
        
        // Set default properties - ensure attributes are set for Safari autoplay
        [this.primaryVideo, this.secondaryVideo].forEach(video => {
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('autoplay', '');
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
            // Mood loops (only 3: neutral, happy, angry - burned uses angry during gameplay)
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
            this.happyEndingVideo,
            this.neutralEndingVideo,
            this.angryEndingVideo,
            this.burnedEndingVideo
        ];
        
        const imageUrls = [
            '/assets/images/background-lobby.jpg',
            '/assets/images/logo-small.png',
            '/assets/images/logo-large.png'
        ];
        
        const videoPromises = videoUrls.map(url => this.preloadVideo(url));
        const imagePromises = imageUrls.map(url => this.preloadImage(url));
        
        await Promise.all([...videoPromises, ...imagePromises]);
        
        console.log('✅ All assets preloaded successfully');
        
        // Try to unlock video playback by playing a preloaded video
        await this.tryUnlockVideoPlayback();
    }
    
    private async tryUnlockVideoPlayback(): Promise<void> {
        console.log('🔓 Attempting to unlock video playback...');
        
        // Use a preloaded video source
        const testVideoUrl = this.lobbyWaitingVideo;
        const preloaded = this.preloadedVideos.get(testVideoUrl);
        
        if (preloaded) {
            this.primaryVideo.src = preloaded.src;
        } else {
            this.primaryVideo.src = testVideoUrl;
        }
        
        this.primaryVideo.currentTime = 0;
        this.primaryVideo.loop = true;
        
        try {
            // Try to play - this might work on some browsers
            await this.primaryVideo.play();
            console.log('✅ Video playback unlocked successfully');
            this.userHasInteracted = true; // Mark as unlocked
            this.isPlayingLobby = true; // Lobby video is now playing
        } catch (err) {
            console.log('🔒 Video playback still locked (will work after user interaction)');
            // Don't pause - leave it ready to play
        }
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
        
        // Check if lobby video is already playing (from unlock attempt)
        const activeVideo = this.primaryVideo.style.opacity === '1' ? this.primaryVideo : this.secondaryVideo;
        if (this.isPlayingLobby && activeVideo.src.includes('waiting') && !activeVideo.paused) {
            console.log('📺 Lobby waiting video already playing');
            return;
        }
        
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
    
    // Play chewing animation only (on each hit) - non-blocking
    playChewingOnly(): void {
        if (this.isPlayingChewing || this.isPlayingGameOver) return;
        
        this.isPlayingChewing = true;
        this.isPlayingLobby = false;
        
        // Use the current mood from class state
        const activeMood = this.currentMood;
        const chewingVideo = this.chewingVideos[activeMood] || this.chewingVideos[GodMood.Neutral];
        console.log(`🍽️ Playing chewing animation for hit (using mood: ${activeMood})`);
        
        this.playVideoOnce(chewingVideo).then(() => {
            // Return to mood loop after chewing
            this.playVideoWithCrossfade(this.moodVideos[this.currentMood], true);
            this.isPlayingChewing = false;
        });
    }
    
    // Transition to new mood without chewing (on order resolve)
    async transitionToMood(fromMood: GodMood, toMood: GodMood, onComplete?: () => void): Promise<void> {
        if (this.isPlayingGameOver) return;
        
        this.isPlayingLobby = false;
        // Reset chewing flag - transition takes priority and will overwrite any chewing animation
        this.isPlayingChewing = false;
        
        console.log(`🔄 Transitioning from ${fromMood} to ${toMood}`);
        await this.playTransition(fromMood, toMood);
        
        // Start new mood loop
        this.currentMood = toMood;
        console.log(`🎭 Starting ${toMood} mood loop`);
        await this.playVideoWithCrossfade(this.moodVideos[toMood], true);
        
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
    
    async playEndingVideo(finalMood: GodMood): Promise<void> {
        console.log(`🏁 Playing ending video for mood: ${finalMood}`);
        this.isPlayingGameOver = true;
        
        // Select ending video based on final mood
        let videoUrl: string;
        switch (finalMood) {
            case GodMood.Happy:
                videoUrl = this.happyEndingVideo;
                break;
            case GodMood.Neutral:
                videoUrl = this.neutralEndingVideo;
                break;
            case GodMood.Angry:
                videoUrl = this.angryEndingVideo;
                break;
            case GodMood.Burned:
            default:
                videoUrl = this.burnedEndingVideo;
                break;
        }
        
        // Play ending video ONCE (non-looping)
        await this.playVideoOnce(videoUrl);
    }
    
    playGameOver(isVictory: boolean) {
        console.log(`🏁 Playing game over: ${isVictory ? 'Victory' : 'Defeat'}`);
        this.isPlayingGameOver = true;
        
        const videoUrl = isVictory ? this.happyEndingVideo : this.burnedEndingVideo;
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
            // Only pause if the video is still inactive (opacity = 0)
            // This prevents race conditions when multiple crossfades happen in quick succession
            setTimeout(() => {
                try {
                    if (activeVideo.style.opacity === '0') {
                        activeVideo.pause();
                        activeVideo.currentTime = 0;
                    }
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
                            if (activeVideo.style.opacity === '0') {
                                activeVideo.pause();
                                activeVideo.currentTime = 0;
                            }
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
    
    updateCurrentMood(mood: GodMood): void {
        this.currentMood = mood;
        console.log(`🎭 Video manager mood updated to: ${mood}`);
    }
    
    reset(): void {
        console.log('🔄 Resetting video manager state');
        this.isPlayingChewing = false;
        this.isPlayingGameOver = false;
        this.isPlayingLobby = false;
        this.currentMood = GodMood.Neutral;
    }
}
