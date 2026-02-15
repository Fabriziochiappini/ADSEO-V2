const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyD4UWMLliZKcB4QsBl6cXGlWCp1NaeFn5o');

async function listModels() {
    const modelsToTry = [
        'gemini-pro',
        'gemini-1.0-pro',
        'models/gemini-1.5-flash',
        'models/gemini-pro'
    ];

    for (const m of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent('test');
            console.log(`Model ${m} OK`);
            return;
        } catch (e) {
            console.error(`Model ${m} Failed:`, e.message);
        }
    }
}

listModels();
