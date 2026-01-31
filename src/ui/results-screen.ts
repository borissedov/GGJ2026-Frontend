import { GodMood } from "../types";

export class ResultsScreen {
    private getMoodText(mood: GodMood): string {
        const moodText: Record<GodMood, string> = {
            [GodMood.Burned]: 'Burned Out 💀',
            [GodMood.Angry]: 'Angry 😠',
            [GodMood.Neutral]: 'Neutral 😐',
            [GodMood.Happy]: 'Happy 😊'
        };
        return moodText[mood];
    }
    
    render(
        totalOrders: number,
        successCount: number,
        failCount: number,
        finalMood: GodMood,
        burnout: boolean = false
    ): string {
        const successRate = totalOrders > 0 ? Math.round((successCount / totalOrders) * 100) : 0;
        
        return `
            <div class="screen results-screen">
                <h1 class="results-title">${burnout ? 'Game Over!' : 'Game Complete!'}</h1>
                
                ${burnout ? '<p class="burnout-message">The god burned out from too many failures!</p>' : ''}
                
                <div class="results-stats">
                    <div class="stat-item">
                        <div class="stat-label">Orders Completed</div>
                        <div class="stat-value">${totalOrders}</div>
                    </div>
                    
                    <div class="stat-item success">
                        <div class="stat-label">Successes</div>
                        <div class="stat-value">${successCount}</div>
                    </div>
                    
                    <div class="stat-item fail">
                        <div class="stat-label">Failures</div>
                        <div class="stat-value">${failCount}</div>
                    </div>
                    
                    <div class="stat-item">
                        <div class="stat-label">Success Rate</div>
                        <div class="stat-value">${successRate}%</div>
                    </div>
                    
                    <div class="stat-item mood">
                        <div class="stat-label">Final Mood</div>
                        <div class="stat-value">${this.getMoodText(finalMood)}</div>
                    </div>
                </div>
            </div>
        `;
    }
}
