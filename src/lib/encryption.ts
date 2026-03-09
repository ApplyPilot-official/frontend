import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'applypilot-default-key';

export function encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(cipherText: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Fields in S9 that must be encrypted
export const CREDENTIAL_FIELDS = [
    'linkedInEmail',
    'linkedInPassword',
    'linkedInPhone',
    'gmailAddress',
    'gmailPassword',
    'gmailRecoveryPhone',
];

export function encryptCredentials(data: Record<string, unknown>): Record<string, unknown> {
    const encrypted = { ...data };
    for (const field of CREDENTIAL_FIELDS) {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
            encrypted[field] = encrypt(encrypted[field] as string);
        }
    }
    return encrypted;
}

export function decryptCredentials(data: Record<string, unknown>): Record<string, unknown> {
    const decrypted = { ...data };
    for (const field of CREDENTIAL_FIELDS) {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
            try {
                decrypted[field] = decrypt(decrypted[field] as string);
            } catch {
                // If decryption fails, leave as-is
            }
        }
    }
    return decrypted;
}
