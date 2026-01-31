import { generateQRCodeUrl } from "../utils/qr-generator";

export class WelcomeScreen {
    render(joinCode: string, _roomId: string): string {
        const qrCodeUrl = generateQRCodeUrl(joinCode);
        
        return `
            <div class="screen welcome-screen">
                <h1 class="game-title">Oh My Hungry God!</h1>
                <div class="qr-container">
                    <img src="${qrCodeUrl}" alt="Join QR Code" class="qr-code" />
                </div>
                <div class="join-code-container">
                    <span class="join-label">Join Code:</span>
                    <span class="join-code">${joinCode}</span>
                </div>
                <p class="instruction">Scan QR code or enter code on your phone to join the game!</p>
            </div>
        `;
    }
}
