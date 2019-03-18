const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const base = require('./dev/base');

module.exports = merge({
    plugins: [
        new HtmlWebpackPlugin({
            filename: '../pages/index.html',
            template: 'src/renderer/templates/index.html',
            chunks: ['index']
        })
    ],
    mode: 'production',
    target: 'electron-renderer',
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                sourceMap: true,
                cache: true
            })
        ]
    }
}, base);
