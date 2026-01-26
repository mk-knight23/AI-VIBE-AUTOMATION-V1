import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * Key must be 32 bytes (256 bits) for AES-256
 */
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error("ENCRYPTION_KEY environment variable is not set");
    }

    // If key is hex-encoded (64 chars), decode it
    if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
        return Buffer.from(key, "hex");
    }

    // Otherwise hash it to get 32 bytes
    return crypto.createHash("sha256").update(key).digest();
}

/**
 * Encrypt a string using AES-256-GCM
 * @returns Object with encrypted data (base64) and IV (base64)
 */
export function encrypt(text: string): { encrypted: string; iv: string } {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Append auth tag to encrypted data
    const authTag = cipher.getAuthTag();
    const combined = Buffer.concat([
        Buffer.from(encrypted, "base64"),
        authTag
    ]);

    return {
        encrypted: combined.toString("base64"),
        iv: iv.toString("base64"),
    };
}

/**
 * Decrypt an encrypted string using AES-256-GCM
 * @param encrypted Base64 encoded encrypted data (includes auth tag)
 * @param iv Base64 encoded initialization vector
 * @returns Decrypted string
 */
export function decrypt(encrypted: string, iv: string): string {
    const key = getEncryptionKey();
    const ivBuffer = Buffer.from(iv, "base64");
    const combined = Buffer.from(encrypted, "base64");

    // Extract auth tag from end of encrypted data
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encryptedData = combined.subarray(0, combined.length - AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.toString("base64"), "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

/**
 * Generate a new encryption key (for setup)
 * @returns Hex-encoded 32-byte key
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString("hex");
}
