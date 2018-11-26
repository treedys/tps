const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

const            gitRevisionPlugin = new GitRevisionPlugin();
const cameraFirmwareRevisionPlugin = new GitRevisionPlugin({ commithashCommand: 'ls-tree --full-tree HEAD camera'    });
const      buildrootRevisionPlugin = new GitRevisionPlugin({ commithashCommand: 'ls-tree --full-tree HEAD buildroot' });

const common = {
    resolve: {
        extensions: [ ".js" ],
        modules: [ "node_modules" ]
    },
    // https://codeburst.io/use-webpack-with-dirname-correctly-4cad3b265a92
    node: { __dirname: false },
    // Exclude built-in modules like path, fs, etc.
    target: 'node',
    // Exclude node_modules from webpack bundle
    externals: [ nodeExternals({
        modulesFromFile: {
            exclude: [ "devDependencies" ]
        }
    }) ],
    entry: { "treedys-controller": path.resolve(__dirname, "src/index.js") },
    output: { path: __dirname, filename: "[name].js", },
    module: {
        rules: [
            { test: /\.(js)$/, loader: "babel-loader", exclude: /(node_modules)/, options: {
                presets: [
                    [ "@babel/preset-env", { "targets":{ "node": "8.11.3" }, "modules": false }]
                ],
                plugins: [
                    "@babel/proposal-class-properties",
                    "@babel/syntax-export-extensions",
                    ["@babel/proposal-decorators", { legacy: true }],
                    "@babel/proposal-object-rest-spread",
                    "@babel/proposal-export-default-from",
                    "@babel/proposal-optional-chaining"
                ] },}
        ]
    },
    plugins: [
        new webpack.DefinePlugin({            'GITSHA1': JSON.stringify(           gitRevisionPlugin.commithash()) }),
        new webpack.DefinePlugin({ 'CAMERAFIRMWARESHA1': JSON.stringify(cameraFirmwareRevisionPlugin.commithash().split(/\s+/)[2]) }),
        new webpack.DefinePlugin({      'BUILDROOTSHA1': JSON.stringify(     buildrootRevisionPlugin.commithash().split(/\s+/)[2]) }),
        // https://stackoverflow.com/questions/40755149/how-to-keep-my-shebang-in-place-using-webpack
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", entryOnly: true, raw: true }),
        new webpack.LoaderOptionsPlugin({ minimize: true })
    ]
};

const debug = {
    mode: "development",
    devtool: 'source-map'
};

const release = {
    mode: "production",
    output: {
        filename: "[name].js",
        chunkFilename: "[name].[chunkhash:8].js"
    },
    plugins: [
        new webpack.HashedModuleIdsPlugin(),
    ],
    optimization: {
        minimize: true,
        minimizer: [ new MinifyPlugin({}, { sourceMap: true }) ]
    }
};

const TARGET = process.env.npm_lifecycle_event;

if (!TARGET || TARGET==="start" || TARGET==="debug") {
    module.exports = merge(common, debug);
}

if (TARGET==="build:webpack" || TARGET==="build" || TARGET==="prepare") {
    module.exports = merge(common, release);
}

