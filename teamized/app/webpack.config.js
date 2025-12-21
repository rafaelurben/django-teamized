/* eslint-disable @typescript-eslint/no-require-imports, no-undef */

const fs = require('node:fs');
const path = require('node:path');
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
            extensions: ['.ts', '.tsx', '.js', '.css'],
            alias: {
                '@/shadcn/*': [path.resolve(__dirname, 'shadcn/*')],
                '@/teamized/*': [path.resolve(__dirname, 'src/*')],
            },
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    include: path.resolve(__dirname, 'src'),
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [['@tailwindcss/postcss']],
                                },
                            },
                        },
                    ],
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
