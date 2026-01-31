export function generateQRCodeUrl(joinCode: string): string {
    // Using a public QR code API service
    const deepLink = `hungrygod://join/${joinCode}`;
    const encodedData = encodeURIComponent(deepLink);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;
}
