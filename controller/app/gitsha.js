const webpack = require('webpack');
const GitRevisionPlugin = require("git-revision-webpack-plugin");

const                  gitWorkTree = process.env.SNAPCRAFT_PROJECT_DIR;
const            gitRevisionPlugin = new GitRevisionPlugin({ gitWorkTree });
const cameraFirmwareRevisionPlugin = new GitRevisionPlugin({ gitWorkTree, commithashCommand: 'ls-tree --full-tree HEAD camera'    });
const      buildrootRevisionPlugin = new GitRevisionPlugin({ gitWorkTree, commithashCommand: 'ls-tree --full-tree HEAD buildroot' });

module.exports = config => ({
  ...config,

  plugins: [ ...(config.plugins||[]),
    new webpack.DefinePlugin({            'GITSHA1': JSON.stringify(           gitRevisionPlugin.commithash()) }),
    new webpack.DefinePlugin({ 'CAMERAFIRMWARESHA1': JSON.stringify(cameraFirmwareRevisionPlugin.commithash().split(/\s+/)[2]) }),
    new webpack.DefinePlugin({      'BUILDROOTSHA1': JSON.stringify(     buildrootRevisionPlugin.commithash().split(/\s+/)[2]) })
  ]
});

