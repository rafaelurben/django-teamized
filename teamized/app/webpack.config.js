const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const version = fs
    .readFileSync(path.resolve(__dirname, '../../_version.txt'), 'utf-8')
    .trim();

module.exports = [
    {
        name: 'mainapp',
        // mode: "development" || "production",
        entry: './src/app.tsx',
        output: {
            path: path.resolve(__dirname, '../static/teamized/app/'),
            filename: 'mainapp.js',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                __TEAMIZED_VERSION__: JSON.stringify(version),
            }),
        ],
    },
];
