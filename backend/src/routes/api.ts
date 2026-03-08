import { Router } from 'express';
import multer from 'multer';
import { GeminiAIService } from '../services/ai/GeminiAIService';
import { StatementProcessorService } from '../services/StatementProcessorService';

const upload = multer({ storage: multer.memoryStorage() });
export const apiRouter = Router();

// Instantiate our services (Dependency Injection)
const aiService = new GeminiAIService();
const statementProcessor = new StatementProcessorService(aiService);

// Endpoint for uploading and parsing statement files
apiRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { buffer, mimetype, originalname } = req.file;
        console.log(`Processing file: ${originalname} (${mimetype})`);

        // Orchestrate parsing and AI extraction cleanly through the facade
        const result = await statementProcessor.processFile(buffer, mimetype, originalname);

        res.json({
            success: true,
            ...result
        });
    } catch (error: any) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message || 'Failed to process file' });
    }
});

// Endpoint to manually request insights
apiRouter.post('/insights', async (req, res) => {
    try {
        const { transactions } = req.body;
        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({ error: 'Valid transactions array required' });
        }
        const insights = await aiService.generateInsights(transactions);
        res.json({ success: true, insights });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Natural Language Query endpoint
apiRouter.post('/query', async (req, res) => {
    try {
        const { query, transactions } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query string is required' });
        }
        const answer = await aiService.answerQuery(query, transactions || []);
        res.json({ success: true, answer });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
