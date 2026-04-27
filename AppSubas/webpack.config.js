const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, 'index.web.js'), // Ahora creamos este archivo
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules\/(?!react-native-web|react-native-linear-gradient|react-native-animated)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['module:metro-react-native-babel-preset'],
                    },
                },
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [{ loader: 'file-loader' }],
            },
        ],
    },
    resolve: {
        alias: {
            'react-native$': 'react-native-web',
            'react-native-linear-gradient': 'react-native-web-linear-gradient', // Hack para el gradiente
        },
        extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public/index.html'),
        }),
    ],
};