export class CountdownScreen {
    render(secondsRemaining: number): string {
        return `
            <div class="screen countdown-screen">
                <div class="countdown-overlay">
                    <h2 class="countdown-title">Get Ready!</h2>
                    <div class="countdown-number">${secondsRemaining}</div>
                    <p class="countdown-message">Game starting...</p>
                </div>
            </div>
        `;
    }
}
