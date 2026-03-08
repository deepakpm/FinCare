export interface IAIService {
    /**
     * Process entire bank statement in a single pass to extract transactions and generate insights simultaneously.
     */
    processStatement(rawText: string): Promise<{ transactions: any[], insights: any }>;

    /**
     * Generate generic insights from a list of transactions (Fallback method).
     */
    generateInsights(transactions: any[], rawText?: string): Promise<any>;

    /**
     * Answer natural language query based on transaction data context.
     */
    answerQuery(query: string, dataContext: any[]): Promise<string>;
}
