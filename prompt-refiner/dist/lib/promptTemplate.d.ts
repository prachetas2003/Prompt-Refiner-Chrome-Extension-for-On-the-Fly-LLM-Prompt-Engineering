/** Gemini models expect a "contents" array with role/parts. */
export declare function buildGeminiPayload(original: string): {
    system_instruction: {
        role: string;
        parts: {
            text: string;
        }[];
    };
    contents: {
        role: string;
        parts: {
            text: string;
        }[];
    }[];
};
