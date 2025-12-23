/* eslint-disable @typescript-eslint/no-require-imports, no-undef */

const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config');

const host = process.env.TEAMIZED_DEV_SERVER_HOST;
console.log('Using development server host:', host);

if (!host) {
    throw new Error('Host must be specified for development server');
}
if (typeof host !== 'string') {
    throw new TypeError('Host must be a string');
}
if (!host.startsWith('http://') && !host.startsWith('https://')) {
    throw new Error(
        'Host must start with "http://" or "https://" for development server'
    );
}

console.log(`
    ==================================================
    The local dev server runs on port 8081.
    Make sure the above host proxies to localhost:8081.
    ==================================================
`);

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'eval-source-map',

    output: {
        publicPath: host + '/',
        filename: 'mainapp.js',
    },

    devServer: {
        port: 8081,
        hot: true,
        allowedHosts: 'all',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods':
                'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers':
                'X-Requested-With, content-type, Authorization',
        },
        static: false,

        client: {
            webSocketURL: {
                protocol: host.startsWith('https://') ? 'wss' : 'ws',
                hostname: host.split('://')[1].split(':')[0],
                port: host.split(':')[2] || '',
            },
        },
    },
});
