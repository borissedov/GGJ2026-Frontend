export class LoadingScreen {
    render(progress: number): string {
        const progressPercent = Math.round(progress);
        
        return `
            <div class="screen loading-screen">
                <h1 class="loading-title">Oh My Hungry God</h1>
                
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p class="loading-message">Loading assets...</p>
                    
                    <div class="loading-progress-container">
                        <div class="loading-progress-bar">
                            <div class="loading-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="loading-progress-text">${progressPercent}%</div>
                    </div>
                </div>
            </div>
        `;
    }
}
