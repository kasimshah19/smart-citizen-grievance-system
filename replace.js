const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./client/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    if (content.includes('min-h-screen')) {
        content = content.replace(/min-h-screen/g, 'min-h-dvh');
        changed = true;
    }
    if (content.includes('h-screen')) {
        content = content.replace(/h-screen/g, 'h-dvh');
        changed = true;
    }
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Modified:', file);
    }
});
