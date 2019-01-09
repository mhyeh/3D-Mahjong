"use strict";
const webpack = require('webpack');

module.exports = {
    entry: {
        app: ["./src/App.ts"],
        ["library.bundle"]: ["babel-polyfill"],
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            assets: __dirname + "/assets",
            mahjongh5: __dirname + "/src/mahjongh5",
        },
    },
    devServer: {
        contentBase: "./dist",
        host: "localhost",
        port: 9000,
    },
    module: {
        rules: [
            {
                type: 'javascript/auto',
                test: /\.json/,
                exclude: /(node_modules|bower_components)/,
                use: [{
                    loader: 'file-loader',
                    options: { name: '[name].[ext]' },
                }]
            },
            { test: /\.ts$/, enforce: "pre", loader: "tslint-loader" },
            { test: /\.ts$/, exclude: /node_modules/, loader: "babel-loader!ts-loader" },
            { test: /\.js$/, include: /src/, loader: "babel-loader" },
            { test: /assets(?=\/|\\)/, exclude: /\.json/, loader: "file-loader?name=[hash].[ext]" },
            { test: /\.html?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.svg$/, loader: 'svg-inline-loader' },
        ],
    },
    devtool: "source-map",
    plugins: [
        new webpack.DefinePlugin({
            BUILD_DATE: JSON.stringify((new Date()).toLocaleString()),
            DEBUG: true
        }),
    ],
};
