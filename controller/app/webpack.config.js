const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const WWW = path.resolve(__dirname, "www");
const BUILD = path.resolve(__dirname, "build");

const static_files = [
    path.resolve(WWW, 'containers/assets/noise.jpg')
];

const common = {
    resolve: {
        extensions: [ ".js", ".jsx" ],
        modules: [ "node_modules", WWW ]
    },
    entry: {
        app: [
            '@babel/polyfill',
            path.resolve(WWW, "index.js"),
            path.resolve(WWW, "styles.css"),
            ...static_files
        ], vendors: [
            "@feathersjs/client",
            "feathers-reactive",
            "socket.io-client",
            "react",
            "react-dom",
            "react-router-dom",
            "react-svg"
        ]
    },
    output: {
        path: BUILD,
        filename: "[name].js",
        chunkFilename: "[name].js"
    },
    module: {
        rules: [
            { test: /\.css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" }
                ]
            },
            { test: static_files, loader: "file-loader", options: { name: "[name].[ext]" } },
            { test: /\.(js|jsx)$/, loader: "babel-loader", exclude: /(node_modules)/, options: {
                presets: [
                    [ "@babel/preset-env", { "targets":{ "browsers": "defaults" }, "modules": false }],
                    "@babel/preset-react"
                ],
                plugins: [
                    "@babel/proposal-class-properties",
                    "@babel/syntax-export-namespace-from",
                    "@babel/syntax-export-default-from",
                    ["@babel/proposal-decorators", { legacy: true }],
                    "@babel/proposal-object-rest-spread",
                    "@babel/proposal-export-default-from",
                    "@babel/proposal-optional-chaining"
                ] },}
        ]
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    plugins: [
        new CleanPlugin([BUILD]),
        new webpack.LoaderOptionsPlugin({ minimize: true }),
        new webpack.ProvidePlugin({
            feathers: "@feathersjs/client"
        })
    ]

};

const debug = {
    mode: "development",
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    { loader: "html-loader" }
                ],
                exclude: path.resolve(WWW, "index.html")
            },
            { test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|woff2|wav|mp3)$/, loader: "file-loader", options: { name: "[name].[ext]" }, exclude: static_files }
        ]
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({ template: path.resolve(WWW, "index.html") }),
        new MiniCssExtractPlugin({ filename: "[name].css" })
    ]
};

const release = {
    mode: "production",
    output: {
        filename: "[name].[chunkhash:8].js",
        chunkFilename: "[name].[chunkhash:8].js"
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    { loader: "html-loader" },
                    { loader: "html-minify-loader" }
                ],
                exclude: path.resolve(WWW, "index.html")
            },
            { test: /\.(svg|wav|mp3)$/, loader: "file-loader", options: { name: "[name].[hash:8].[ext]" }, exclude: static_files },
            { test: /\.(jpe?g|png|gif|eot|woff|ttf|woff2)$/, loader: "url-loader", options: { limit: 10000, name: "[name].[hash:8].[ext]" }, exclude: static_files }
        ]
    },
    plugins: [
        new webpack.HashedModuleIdsPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(WWW, "index.html"),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            }
        }),
        new MiniCssExtractPlugin({ filename: "[name].[chunkhash:8].css" })
    ]

};

const TARGET = process.env.npm_lifecycle_event;

if (!TARGET || TARGET==="start" || TARGET==="debug") {
    module.exports = merge(common, debug);
}

if (TARGET==="build:webpack" || TARGET==="build" || TARGET==="prepare") {
    module.exports = merge(common, release);
}
