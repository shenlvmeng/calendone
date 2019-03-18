/* eslint-disable */
const webpack = require('webpack');
const path = require('path');

module.exports = {
    target: 'electron-renderer',
    entry: {
        index: './src/renderer/entry/index',
    },
    // 产出路径
    output: {
        path: path.join(__dirname, '../../dist/assets/'),
        globalObject: 'this'
    },
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'less-loader'
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true
                    }
                }]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(jpg|jpeg|gif|png)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000 // receiver 收到的图片有问题，开发过程全部inline
                    }
                }],
            },
            {
                test: /\.svg/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        minetype: 'image/svg+xml'
                    }
                }]
            }, {
                test: /\.mp3/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 50000,
                        minetype: 'image/svg+xml'
                    }
                }]
            }, {
                test: /\.woff|woff2|eot|ttf|otf$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000
                    }
                }]
            }
        ]
    },
    resolve: {
        modules: ["node_modules"],
        alias: {
            '@': path.join(__dirname, '../../src/renderer')
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /moment[\/\\]locale$/,
            /en|cn/
        )
    ]
};
