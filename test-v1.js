async function testV1() {
    const apiKey = 'AIzaSyD4UWMLliZKcB4QsBl6cXGlWCp1NaeFn5o';
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: 'test' }]
                }]
            })
        });

        const data = await response.json();
        console.log('V1 Response Status:', response.status);
        console.log('V1 Response:', JSON.stringify(data).substring(0, 200));
    } catch (e) {
        console.error('V1 Fetch Error:', e.message);
    }
}

testV1();
