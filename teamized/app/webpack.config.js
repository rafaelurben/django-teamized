const path = require('path');

module.exports = [
    {
        name: 'mainapp',
        // mode: "development" || "production",
        entry: './src/app.ts',
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
    },
];
