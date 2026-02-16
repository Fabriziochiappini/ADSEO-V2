
const fs = require('fs');
const path = require('path');

const lockPath = path.resolve('templates/next-magazine/.git/index.lock');

if (fs.existsSync(lockPath)) {
    try {
        fs.unlinkSync(lockPath);
        console.log('Successfully deleted index.lock');
    } catch (e) {
        console.error('Failed to delete index.lock:', e.message);
        process.exit(1);
    }
} else {
    console.log('No index.lock found');
}
