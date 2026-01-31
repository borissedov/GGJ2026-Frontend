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
                <div class="fruit-item ${this.getStatusClass(required[fruit], submitted[fruit])}">
                    <div class="fruit-emoji">${this.getFruitEmoji(fruit)}</div>
                    <div class="fruit-count">${submitted[fruit]} / ${required[fruit]}</div>
                </div>
            `).join('');
        
        const progressPercent = (orderNumber / 10) * 100;
        
        return `
            <div class="screen game-screen">
                <div class="game-header">
                    <div class="mood-indicator">${this.getMoodEmoji(mood)}</div>
                    <div class="timer ${timeRemaining <= 3 ? 'urgent' : ''}">${timeRemaining}s</div>
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
            </div>
        `;
    }
}
