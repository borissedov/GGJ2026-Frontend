import { GodMood } from "../types";

export class MoodVideoManager {
    private primaryVideo: HTMLVideoElement;
    private secondaryVideo: HTMLVideoElement;
    private currentMood: GodMood = GodMood.Neutral;
    private isPlayingChewing: boolean = false;
    private isPlayingGameOver: boolean = false;
    
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
    private loadedCount: number = 0;
    private totalVideos: number = 13; // 3 moods + 3 chewing + 4 transitions + 1 lobby + 2 endings
    
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
    }
    
    async preloadAllVideos(): Promise<void> {
        console.log('🎬 Starting video preload...');
        
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
        
        const promises = videoUrls.map(url => this.preloadVideo(url));
        
        await Promise.all(promises);
        
        console.log('✅ All videos preloaded successfully');
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
                console.log(`📹 Loaded: ${url} (${this.loadedCount}/${this.totalVideos})`);
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
    
    getLoadingProgress(): number {
        return this.totalVideos > 0 ? (this.loadedCount / this.totalVideos) * 100 : 0;
    }
    
    setMood(mood: GodMood) {
        if (mood === this.currentMood || this.isPlayingChewing || this.isPlayingGameOver) {
            return;
        }
        
        console.log(`🎭 Changing mood to: ${mood}`);
        this.currentMood = mood;
        this.playVideoWithCrossfade(this.moodVideos[mood], true);
    }
    
    setLobbyWaiting(): void {
        if (this.isPlayingGameOver) return;
        console.log('📺 Playing lobby waiting video');
        this.playVideoWithCrossfade(this.lobbyWaitingVideo, true);
    }
    
    async playChewing(currentMood: GodMood, newMood: GodMood, onComplete?: () => void): Promise<void> {
        if (this.isPlayingChewing || this.isPlayingGameOver) return;
        
        this.isPlayingChewing = true;
        
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
        await this.playVideoWithCrossfade(url, false);
        
        // Wait for video to end
        return new Promise<void>((resolve) => {
            const activeVideo = this.primaryVideo.style.opacity === '1' ? this.primaryVideo : this.secondaryVideo;
            
            const onEnded = () => {
                activeVideo.removeEventListener('ended', onEnded);
                resolve();
            };
            
            activeVideo.addEventListener('ended', onEnded);
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
        
        try {
            await inactiveVideo.play();
            
            // Crossfade
            activeVideo.style.transition = 'opacity 0.5s ease-in-out';
            inactiveVideo.style.transition = 'opacity 0.5s ease-in-out';
            
            activeVideo.style.opacity = '0';
            inactiveVideo.style.opacity = '1';
            
            // Pause and reset the now-inactive video after transition
            setTimeout(() => {
                activeVideo.pause();
                activeVideo.currentTime = 0;
            }, 500);
            
        } catch (err) {
            console.error('Error playing video:', err);
        }
    }
    
    getCurrentMood(): GodMood {
        return this.currentMood;
    }
}
