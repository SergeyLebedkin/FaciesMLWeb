const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        index: './src/js/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'static/js/[name].js'
    },
    node: {
        fs: 'empty' // need for tiff.js
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    devtool: 'source-map',
    devServer: {
        watchContentBase: true,
        overlay: true
    },
    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            use: 'ts-loader'
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            { from: "src/css", to: "static/css" },
            //{ from: "src/js/deps", to: "js/deps" }
        ]),
        new HtmlWebpackPlugin({
            inject: false,
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['index']
        })
    ]
}