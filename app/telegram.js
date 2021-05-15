const { request } = require('https');

/**
 * @arg {string} botToken
 * @arg {string} method
 * @arg {{[x: string]: string | number}} params
 */
module.exports = (botToken, method, params) => {
    return new Promise((resolve, reject) => {
        const req = request({
            hostname: 'api.telegram.org',
            port: 443,
            path: '/bot' + botToken + '/' + method,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }, res => {
            let data = '';
            res.on('error', reject);
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try{
                    resolve(JSON.parse(data));
                } catch(e){
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(params));
        req.end();
    });
}
