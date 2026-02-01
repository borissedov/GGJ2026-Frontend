import { GodMood, type PlayerStats } from "../types";

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
    
    private getStarCount(finalMood: GodMood): number {
        // Happy=3, Neutral=2, Angry=1, Burned=0
        switch (finalMood) {
            case GodMood.Happy: return 3;
            case GodMood.Neutral: return 2;
            case GodMood.Angry: return 1;
            case GodMood.Burned: return 0;
            default: return 0;
        }
    }
    
    private renderStars(count: number): string {
        const stars = [];
        for (let i = 0; i < 3; i++) {
            stars.push(i < count ? '⭐' : '☆');
        }
        return stars.join(' ');
    }
    
    render(
        successCount: number,
        failCount: number,
        finalMood: GodMood,
        playerStats: PlayerStats[]
    ): string {
        const ordersCompleted = successCount + failCount;
        const successRate = ordersCompleted > 0 ? Math.round((successCount / ordersCompleted) * 100) : 0;
        const starCount = this.getStarCount(finalMood);
        
        // Player stats table
        const playerStatsRows = playerStats.map(ps => `
            <tr>
                <td class="player-name">${ps.name}</td>
                <td class="player-hits">${ps.hitCount}</td>
                <td class="player-contribution">${ps.contributionPercentage.toFixed(1)}%</td>
            </tr>
        `).join('');
        
        return `
            <div class="screen results-screen-fullscreen">
                <div class="results-content">
                    <h1 class="results-title">Game Complete!</h1>
                    
                    <div class="team-stars">
                        <div class="stars-display">${this.renderStars(starCount)}</div>
                        <div class="stars-label">Team Performance</div>
                    </div>
                    
                    <div class="results-stats">
                        <div class="stat-item">
                            <div class="stat-label">Orders Completed</div>
                            <div class="stat-value">${ordersCompleted}/10</div>
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
                    
                    ${playerStats.length > 0 ? `
                        <div class="player-stats-section">
                            <h2 class="player-stats-title">Player Contributions</h2>
                            <table class="player-stats-table">
                                <thead>
                                    <tr>
                                        <th>Player</th>
                                        <th>Hits</th>
                                        <th>Contribution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${playerStatsRows}
                                </tbody>
                            </table>
                        </div>
                    ` : ''}
                    
                    <button class="restart-button" id="restart-button">
                        🔄 Play Again
                    </button>
                </div>
            </div>
        `;
    }
}
