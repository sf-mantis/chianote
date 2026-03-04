const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// 1x1 transparent blue PNG base64
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const buffer = Buffer.from(base64Png, 'base64');

['72', '96', '128', '144', '152', '192', '384', '512'].forEach(size => {
    fs.writeFileSync(path.join(dir, `icon-${size}x${size}.png`), buffer);
});

console.log('Dummy icons generated');
