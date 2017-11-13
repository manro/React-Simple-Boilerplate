const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsWebpackPlugin = require('uglifyjs-webpack-plugin');
const { BaseHrefWebpackPlugin } = require('base-href-webpack-plugin');

const helper = require('./helper');

const pkg = require('./../package.json');

const common = {
    entry: {
        app: helper.PATHS.src
    },
    resolve: {
        extensions: [ '.js', '.jsx', '.css', '.less' ],
        alias: {
            '@': helper.PATHS.src
        }
    },
    output: {
        path: helper.PATHS.dist,
        filename: '[name].js'
    },
    module: {},
    plugins: []
};

if (helper.TARGET === 'development' || !helper.TARGET) {
    module.exports = merge(common, {
        entry: {
            hmr: ['react-hot-loader/patch', 'webpack-hot-middleware/client?path=/__webpack_hmr'],
            app: [ helper.PATHS.src ],
            styles: helper.PATHS.styles,
        },
        devtool: 'cheap-eval-source-map',
        output: {
            path: '/',
            //filename: '[name].[hash].js'
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules)/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: helper.BABEL_DEV_RC
                        }
                    ],
                    include: helper.PATHS.src
                },
                // Define development specific CSS setup
                {
                    test: /\.less$/,
                    exclude: /(node_modules)/,
                    use: [ {
                        loader: 'style-loader'
                    }, {
                        loader: 'css-loader'
                    }, {
                        loader: 'less-loader'
                    } ],
                    include: helper.PATHS.src
                }
            ]
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.optimize.CommonsChunkPlugin({
                names: [ 'app', 'styles', 'hmr' ],
                minChunks: Infinity
            }),
            new HtmlWebpackPlugin({
                template: 'node_modules/html-webpack-template/index.ejs',
                filename: 'index.html',
                title: 'React App Simple Boilerplate',
                appMountId: 'application_host',
                inject: false,
                minify: false
            }),
            new BaseHrefWebpackPlugin({ baseHref: '/' })
        ]
    });
}

if (helper.TARGET === 'production' || helper.TARGET === 'stats') {
    const extractingCSSExtractTextPlugin = new ExtractTextPlugin({
        filename: 'styles.[chunkhash:4].css',
        allChunks: true
    });
    
    module.exports = merge(common, {
        entry: {
            vendor: Object.keys(pkg.dependencies).filter(function (dependency) {
                // Exclude alt-utils as it won't work with this setup
                // due to the way the package has been designed
                // (no package.json main).
                return (
                    dependency !== 'alt-utils' &&
                    dependency !== 'purecss' &&
                    dependency !== 'react-addons-update' &&
                    dependency.indexOf('devtools') < 0
                );
            }),
            //style: helper.PATHS.style
            app: [helper.PATHS.styles, helper.PATHS.src]
        },
        output: {
            path: helper.PATHS.dist,
            filename: '[name].[chunkhash:4].js',
            chunkFilename: '[chunkhash:4].js'
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules)/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: helper.BABEL_BUILD_RC
                        }
                    ],
                    include: helper.PATHS.src
                },
                // Extract CSS during build
                {
                    test: /\.(css|less)$/,
                    exclude: /(node_modules)/,
                    use: extractingCSSExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [ {
                            loader: 'css-loader',
                            options: {
                                discardDuplicates: false,
                                url: false,
                                sourceMap: false,
                                minimize: true
                            }
                        }, {
                            loader: 'less-loader',
                            options: {
                                sourceMap: false
                            }
                        } ]//'css-loader'
                    }),
                    include: helper.PATHS.src
                }
            ]
        },
        plugins: [
            new CleanPlugin([ helper.PATHS.dist + '/**/*.*' ], {
                root: helper.PATHS.root
            }),
            new HtmlWebpackPlugin({
                template: 'node_modules/html-webpack-template/index.ejs',
                filename: 'index.html',
                title: 'React App Simple Boilerplate',
                appMountId: 'application_host',
                inject: false,
                minify: {
                    removeComments: true,
                    collapseWhitespace: true
                }
            }),
            new BaseHrefWebpackPlugin({ baseHref: '/' }),
            // Extract vendor and manifest files
            new webpack.optimize.CommonsChunkPlugin({
                names: [ 'vendor', 'manifest' ]
            }),
            // Setting DefinePlugin affects React library size!
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': '"production"'
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: false
            }),
            
            // Output extracted CSS to a file
            extractingCSSExtractTextPlugin,
        ]
    });
}