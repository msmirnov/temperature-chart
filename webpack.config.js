const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const DIST_DIR = path.resolve(__dirname, 'dist');

module.exports = {
    mode: 'none',
    entry: './src/index.ts',
    plugins: [new MiniCssExtractPlugin({ filename: "[name].css" })],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: "styles",
                    type: "css/mini-extract",
                    chunks: "all",
                    enforce: true,
                },
            },
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: DIST_DIR,
    },
    devServer: {
        static: {
            directory: DIST_DIR,
        },
        compress: true,
        port: 9000
    },
};