async function listAvailableModels() {
    const apiKey = 'AIzaSyD4UWMLliZKcB4QsBl6cXGlWCp1NaeFn5o';
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Status:', response.status);
        if (data.models) {
            console.log('Available Models:', data.models.map(m => m.name).join(', '));
        } else {
            console.log('No models found or error:', JSON.stringify(data));
        }
    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}

listAvailableModels();
