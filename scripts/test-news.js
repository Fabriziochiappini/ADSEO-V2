import { NewsService } from '../src/lib/api/news';

async function testNews() {
    try {
        const service = new NewsService();
        const keyword = 'sgomberi milano';
        console.log(`Testing news for: ${keyword}`);

        const news = await service.getNewsForKeyword(keyword);
        console.log('--- Raw News ---');
        console.log(news);

        const context = service.formatNewsForAi(news);
        console.log('--- Formatted for AI ---');
        console.log(context);
    } catch (e) {
        console.error(e);
    }
}

testNews();
