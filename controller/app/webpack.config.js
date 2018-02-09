const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const WWW = path.resolve(__dirname, "www");
const BUILD = path.resolve(__dirname, "build");

const static_files = [
];

const common = {
    resolve: {
        extensions: [ ".js", ".jsx" ],
        modules: [ "node_modules", WWW ]
    },
    entry: {
        app: [
            path.resolve(WWW, "index.js"),
            ...static_files
        ], vendors: [
            "@feathersjs/client",
            "react",
            "react-dom",
            "react-tap-event-plugin"
        ]
    },
    output: {
        path: BUILD,
        filename: "[name].js",
        chunkFilename: "[name].js"
    },
    module: {
        rules: [
            { test: /\.css$/, use: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" }) },
            { test: static_files, loader: "file-loader", options: { name: "[name].[ext]" } },
            { test: /\.(js|jsx)$/, loader: "babel-loader", exclude: /(node_modules)/, options: {
                presets: [
                    [ "env", { "targets":{ "browsers": "defaults" }, "modules": false }],
                    "react"
                ],
                plugins: [
                    "transform-class-properties",
                    "transform-export-extensions",
                    "transform-decorators-legacy",
                    "transform-object-rest-spread"
                ] },}
        ]
    },
    plugins: [
        new CleanPlugin([BUILD]),
        new webpack.LoaderOptionsPlugin({ minimize: true }),
        new webpack.optimize.CommonsChunkPlugin({ names: ["vendors", "manifest"] }),
        new webpack.ProvidePlugin({
            feathers: "@feathersjs/client"
        })
    ]

};

const debug = {
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
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({ template: path.resolve(WWW, "index.html") }),
        new  ExtractTextPlugin({ filename: "[name].css" })
    ]
};

const release = {
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
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true
            }, output: {
                comments: false
            }
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
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
        new ExtractTextPlugin({ filename: "[name].[contenthash:8].css", allChunks: true })
    ]

};

const TARGET = process.env.npm_lifecycle_event;

if (!TARGET || TARGET==="start" || TARGET==="debug") {
    module.exports = merge(common, debug);
}

if (TARGET==="build:webpack" || TARGET==="build" || TARGET==="prepare") {
    module.exports = merge(common, release);
}
