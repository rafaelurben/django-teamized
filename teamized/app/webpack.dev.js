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

// Parse the host URL using regex to extract protocol, hostname, port, and path
const hostRegex = /^(https?):\/\/([^:/]+)(?::(\d+))?(\/.*)?$/;
const match = host.match(hostRegex);

if (!match) {
    throw new Error(
        'Invalid host format. Expected format: http(s)://hostname[:port][/path/]'
    );
}

const [, protocol, hostname, port, pathPrefix] = match;
const pathPrefixNormalized = pathPrefix
    ? pathPrefix.replace(/\/+$/, '') + '/'
    : '/';
const publicPath = pathPrefixNormalized;

console.log(`
    ===================================================
    Parsed URL:
      Protocol: ${protocol}
      Hostname: ${hostname}
      Port: ${port || '(default)'}
      Path Prefix: ${pathPrefixNormalized}

    The Webpack dev server runs on port 8081.
    Make sure the above host proxies to localhost:8081.
    ===================================================
`);

const WS_POSTFIX = 'devserver-ws';

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'eval-source-map',

    output: {
        publicPath: publicPath,
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
                protocol: protocol === 'https' ? 'wss' : 'ws',
                hostname: hostname,
                port: port || (protocol === 'https' ? 443 : 80),
                pathname: pathPrefixNormalized + WS_POSTFIX,
            },
        },

        webSocketServer: {
            type: 'ws',
            options: {
                path: pathPrefixNormalized + WS_POSTFIX,
            },
        },
    },
});
