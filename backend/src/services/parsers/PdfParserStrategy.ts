import { IFileParser } from '../../interfaces/IFileParser';
const pdfParse = require('pdf-parse');

export class PdfParserStrategy implements IFileParser {
    /**
     * Parses a PDF buffer into a single raw text string.
     */
    async parse(buffer: Buffer): Promise<string> {
        try {
            const data = await pdfParse(buffer);
            return data.text;
        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw new Error('Failed to parse PDF document');
        }
    }
}
