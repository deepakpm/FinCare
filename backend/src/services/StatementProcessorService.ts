import { ParserContext } from './parsers/ParserContext';
import { IAIService } from '../interfaces/IAIService';

export class StatementProcessorService {
    private parserContext: ParserContext;
    private aiService: IAIService;

    constructor(aiService: IAIService) {
        this.parserContext = new ParserContext(); // Internal context manager
        this.aiService = aiService; // Dependency Injection for specific AI implementation
    }

    /**
     * Orchestrates the entire flow of processing a banking statement file.
     * 1. Parses the buffer to raw text based on mimetype
     * 2. Feeds raw text securely into the AI Service
     * 3. Returns a standardized JSON object containing transactions and insights.
     */
    async processFile(buffer: Buffer, mimetype: string, originalname: string) {
        // 1. Parse raw text/data from the file using the dynamic Strategy Pattern
        const rawData = await this.parserContext.parseFile(buffer, mimetype, originalname);

        // 2 & 3. Extract structured transactions AND insights simultaneously via single AI pass
        const { transactions, insights } = await this.aiService.processStatement(rawData);

        return {
            filename: originalname,
            transactions,
            insights
        };
    }
}
