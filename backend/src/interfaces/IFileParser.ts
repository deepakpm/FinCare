export interface IFileParser {
    /**
     * Parse a buffer into raw text representation.
     * @param buffer The file buffer (e.g., from multer)
     * @param filename Optional filename for additional context
     * @returns A string representation of the parsed document
     */
    parse(buffer: Buffer, filename?: string): Promise<string> | string;
}
