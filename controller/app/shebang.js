const webpack = require('webpack');

module.exports = config => ({
    ...config,

    plugins: [ ...(config.plugins||[]),
        // https://stackoverflow.com/questions/40755149/how-to-keep-my-shebang-in-place-using-webpack
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", entryOnly: true, raw: true }),
    ]
})
