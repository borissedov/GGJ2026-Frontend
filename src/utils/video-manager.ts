import { GodMood } from "../types";

export class MoodVideoManager {
    private videoElement: HTMLVideoElement;
    private currentMood: GodMood = GodMood.Neutral;
    
    private moodVideos: Record<GodMood, string> = {
        [GodMood.Burned]: '/assets/videos/burned.mp4',
        [GodMood.Angry]: '/assets/videos/angry.mp4',
        [GodMood.Neutral]: '/assets/videos/neutral.mp4',
        [GodMood.Happy]: '/assets/videos/happy.mp4'
    };
    
    constructor(container: HTMLElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.loop = true;
        this.videoElement.autoplay = true;
        this.videoElement.muted = true;  // Required for autoplay policy
        this.videoElement.playsInline = true;
        this.videoElement.className = 'mood-video';
        container.appendChild(this.videoElement);
        
        // Start with neutral mood
        this.setMood(GodMood.Neutral);
    }
    
    setMood(mood: GodMood) {
        if (mood === this.currentMood) return;
        
        this.currentMood = mood;
        this.videoElement.src = this.moodVideos[mood];
        this.videoElement.play().catch(err => {
            console.error('Error playing mood video:', err);
        });
    }
    
    getCurrentMood(): GodMood {
        return this.currentMood;
    }
}
