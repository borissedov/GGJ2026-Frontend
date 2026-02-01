import type { Player } from "../types";
import { generateQRCode } from "../utils/qr-generator";

export class LobbyScreen {
    render(players: Player[], connectedCount: number, readyCount: number, joinCode?: string): string {
        const playersList = players
            .filter(p => p.isConnected)
            .map(p => `
                <div class="player-item ${p.isReady ? 'ready' : 'not-ready'}">
                    <div class="player-status">${p.isReady ? '✓' : '⏳'}</div>
                    <div class="player-name">Player ${p.playerId.substring(0, 8)}</div>
                </div>
            `).join('');
        
        const allReady = connectedCount > 0 && readyCount === connectedCount;
        
        // Generate QR code if join code is provided
        const qrCodeSection = joinCode ? `
            <div class="lobby-qr-section">
                <div class="lobby-qr-title">Scan to Join</div>
                <div class="lobby-qr-container">
                    <img src="${generateQRCode(joinCode)}" alt="QR Code" class="lobby-qr-code" />
                </div>
                <div class="lobby-join-code">${joinCode}</div>
            </div>
        ` : '';
        
        return `
            <div class="screen lobby-screen">
                <h2 class="lobby-title">Waiting for Players</h2>
                <div class="lobby-content">
                    <div class="lobby-players">
                        <div class="players-container">
                            ${playersList || '<p class="no-players">Waiting for players to join...</p>'}
                        </div>
                        <div class="lobby-status">
                            <div class="status-count">${connectedCount} player(s) connected</div>
                            <div class="status-ready">${readyCount} ready</div>
                        </div>
                        ${allReady ? '<div class="countdown-notice">Starting soon...</div>' : ''}
                    </div>
                    ${qrCodeSection}
                </div>
            </div>
        `;
    }
}
