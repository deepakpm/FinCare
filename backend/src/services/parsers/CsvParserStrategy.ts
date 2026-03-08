import { IFileParser } from '../../interfaces/IFileParser';
import { parse as csvParse } from 'csv-parse/sync';

export class CsvParserStrategy implements IFileParser {
    /**
     * Parses a CSV buffer into a JSON string representation.
     */
    parse(buffer: Buffer): string {
        try {
            const records = csvParse(buffer, {
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true,
            });
            // AI expects raw text to process; we stringify the object array.
            return JSON.stringify(records, null, 2);
        } catch (error) {
            console.error('Error parsing CSV:', error);
            throw new Error('Failed to parse CSV document');
        }
    }
}
