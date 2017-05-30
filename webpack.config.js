module.exports = {
    entry: [
        'babel-polyfill','./public/script/main.js'
    ],
    output: {
        filename: './public/bundle.js'
    },
    module:{
        loaders:[
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loaders: [
                'babel-loader'
                ]
            }
        ]
    },
    watch: true,
    devtool:"inline-source-map"
};