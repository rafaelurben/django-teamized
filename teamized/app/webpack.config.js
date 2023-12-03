const path = require('path');

module.exports = [
    {
		name: "mainapp",
		// mode: "development" || "production",
        entry: "./src/app.js",
        output: {
            path: path.resolve(__dirname, '../static/teamized/app/'),
            filename: "mainapp.js"
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                          presets: ["@babel/preset-react"]
                        }
                    },
                }
            ]
        }
	}
]