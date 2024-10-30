const path = require('path');

module.exports = [
    {
        name: 'mainapp',
        // mode: "development" || "production",
        entry: './src/app.js',
        output: {
            path: path.resolve(__dirname, '../static/teamized/app/'),
            filename: 'mainapp.js',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.tsx'],
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts)x?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-react',
                                '@babel/preset-typescript',
                                '@babel/preset-env',
                            ],
                            plugins: ['@babel/plugin-transform-runtime'],
                        },
                    },
                },
            ],
        },
    },
];
