const http = require('http');
http.get('http://177.136.245.174:80/', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const m = d.match(/<script>([\s\S]*?)<\/script>/g);
        if (m) {
            const allJS = m.map(s => s.replace(/<\/?script>/g, '')).join('\n');
            try {
                new Function(allJS);
                console.log('JS PARSES OK');
            } catch (e) {
                console.log('SCRIPT ERROR: ' + e.message);
            }
        } else {
            console.log('No script blocks found');
        }
    });
}).on('error', e => console.log('Error: ' + e.message));
