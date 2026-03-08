import { IFileParser } from '../../interfaces/IFileParser';
import { PdfParserStrategy } from './PdfParserStrategy';
import { CsvParserStrategy } from './CsvParserStrategy';

export class ParserContext {
    private pdfStrategy: PdfParserStrategy;
    private csvStrategy: CsvParserStrategy;

    constructor() {
        this.pdfStrategy = new PdfParserStrategy();
        this.csvStrategy = new CsvParserStrategy();
    }

    /**
     * Factory/Context method to select the right strategy based on mimetype/extension
     * and execute it.
     */
    async parseFile(buffer: Buffer, mimetype: string, filename: string = ''): Promise<string> {
        const ext = filename.split('.').pop()?.toLowerCase();
        let strategy: IFileParser | null = null;

        if (mimetype === 'application/pdf' || ext === 'pdf') {
            strategy = this.pdfStrategy;
        } else if (
            mimetype === 'text/csv' ||
            mimetype === 'application/vnd.ms-excel' ||
            mimetype === 'application/csv' ||
            mimetype === 'text/plain' ||
            ext === 'csv'
        ) {
            strategy = this.csvStrategy;
        }

        if (!strategy) {
            console.error(`Unsupported mimetype: ${mimetype}`);
            throw new Error(`Unsupported file type: ${mimetype}`);
        }

        return await strategy.parse(buffer, filename);
    }
}
