
const fs = require('fs');
const path = require('path');

const target = path.resolve('temp_reference');
if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log('Cleaned up temp_reference');
}
