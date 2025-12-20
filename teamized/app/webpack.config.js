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
            extensions: ['.ts', '.tsx', '.js', '.css'],
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
