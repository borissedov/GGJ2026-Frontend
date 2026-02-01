import { FruitType, GodMood } from "../types";

export class GameScreen {
    private getFruitEmoji(fruit: FruitType): string {
        const emojis: Record<FruitType, string> = {
            [FruitType.Banana]: '🍌',
            [FruitType.Peach]: '🍑',
            [FruitType.Coconut]: '🥥',
            [FruitType.Watermelon]: '🍉'
        };
        return emojis[fruit];
    }
    
    private getMoodEmoji(mood: GodMood): string {
        const emojis: Record<GodMood, string> = {
            [GodMood.Burned]: '💀',
            [GodMood.Angry]: '😠',
            [GodMood.Neutral]: '😐',
            [GodMood.Happy]: '😊'
        };
        return emojis[mood];
    }
    
    private getStatusClass(required: number, submitted: number): string {
        if (submitted > required) return 'over-submitted';
        if (submitted === required && required > 0) return 'complete';
        return 'pending';
    }
    
    render(
        orderNumber: number,
        required: Record<FruitType, number>,
        submitted: Record<FruitType, number>,
        mood: GodMood,
        timeRemaining: number
    ): string {
        const fruitItems = Object.values(FruitType)
            .filter(fruit => required[fruit] > 0)
            .map(fruit => `
                <div class="fruit-item ${this.getStatusClass(required[fruit], submitted[fruit])}" data-fruit="${fruit}">
                    <div class="fruit-emoji">${this.getFruitEmoji(fruit)}</div>
                    <div class="fruit-count">${submitted[fruit]} / ${required[fruit]}</div>
                </div>
            `).join('');
        
        const progressPercent = (orderNumber / 10) * 100;
        
        // Calculate arc for circular countdown (percentage of circle remaining)
        const arcPercent = (timeRemaining / 10) * 100;
        const dashArray = 2 * Math.PI * 45; // Circumference for radius=45
        const dashOffset = dashArray * (1 - arcPercent / 100);
        
        return `
            <div class="screen game-screen">
                <div class="game-header">
                    <div class="mood-indicator">${this.getMoodEmoji(mood)}</div>
                    <div class="timer-container">
                        <svg class="timer-ring" width="120" height="120" viewBox="0 0 120 120">
                            <circle class="timer-ring-bg" cx="60" cy="60" r="45" />
                            <circle class="timer-ring-progress ${timeRemaining <= 3 ? 'urgent' : ''}" 
                                    cx="60" cy="60" r="45"
                                    stroke-dasharray="${dashArray}"
                                    stroke-dashoffset="${dashOffset}" />
                        </svg>
                        <div class="timer-text ${timeRemaining <= 3 ? 'urgent' : ''}">${timeRemaining}s</div>
                    </div>
                </div>
                
                <div class="order-display">
                    <h2 class="order-title">Order ${orderNumber}/10</h2>
                    <div class="fruits-required">
                        ${fruitItems}
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">Order ${orderNumber} of 10</div>
                </div>
                
                <div class="particle-container" id="particle-container"></div>
            </div>
        `;
    }
    
    // Trigger particle splash effect for a fruit
    triggerSplash(fruit: FruitType): void {
        const container = document.getElementById('particle-container');
        if (!container) return;
        
        const emoji = this.getFruitEmoji(fruit);
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Create 8-12 particles
        const particleCount = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emoji;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 100 + Math.random() * 100;
            const finalX = centerX + Math.cos(angle) * distance;
            const finalY = centerY + Math.sin(angle) * distance;
            
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.setProperty('--final-x', `${finalX}px`);
            particle.style.setProperty('--final-y', `${finalY}px`);
            
            container.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    // Trigger emoji highlight animation when count increases
    triggerEmojiHighlight(fruit: FruitType): void {
        const fruitItem = document.querySelector(`[data-fruit="${fruit}"] .fruit-emoji`) as HTMLElement;
        if (!fruitItem) return;
        
        fruitItem.classList.add('highlight');
        setTimeout(() => fruitItem.classList.remove('highlight'), 500);
    }
}
