// src/utils/client-utility.ts

/**
 * Validates if a string is a proper UUID v4 format
 * @param uuid String to validate as UUID
 * @returns Boolean indicating if the string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Generates a new UUID v4
 * @returns A new UUID v4 string
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Gets a valid client ID for testing purposes
 * @returns A valid client ID (UUID)
 */
export function getTestClientId(): string {
    // In a real application, you'd fetch this from an API
    // For testing, we use a fixed value that should be valid in your database
    return '00000000-0000-0000-0000-000000000000';
}

/**
 * Function to help diagnose client ID issues
 * Run this in your browser console when testing case creation
 */
export function diagnoseClientId(clientId: string): void {
    console.log('Diagnosing client ID:', clientId);

    if (!clientId) {
        console.error('❌ Client ID is empty!');
        console.log('✅ Fix: Use a valid UUID such as', generateUUID());
        return;
    }

    if (!isValidUUID(clientId)) {
        console.error('❌ Client ID is not a valid UUID format!');
        console.error('   A UUID should look like: 123e4567-e89b-12d3-a456-426614174000');
        console.log('✅ Fix: Use a valid UUID such as', generateUUID());
        return;
    }

    console.log('✅ Client ID has valid UUID format');
    console.log('⚠️ Note: Even with valid format, the ID must exist in your database.');
    console.log('   If the server returns "client not found" errors, you need to use an ID from your database.');
}