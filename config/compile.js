const fs = require('fs-extra');
const webpack = require('webpack');
const debug = require('debug')('app:bin:compile');
const webpackConfig = require('./webpack.config');

const helper = require('./helper');

const fail_on_warning = false;

// Wrapper around webpack to promisify its compiler and supply friendly logging
const webpackCompiler = (webpackConfig) =>
    new Promise((resolve, reject) => {
        const compiler = webpack(webpackConfig);
        
        compiler.run((err, stats) => {
            if (err) {
                console.log('Webpack compiler encountered a fatal error.', err);
                return reject(err);
            }
            
            const jsonStats = stats.toJson();
            console.log('Webpack compile completed.');
            console.log(stats.toString(helper.STATS));
            
            if (jsonStats.errors.length > 0) {
                console.log('Webpack compiler encountered errors.');
                console.log(jsonStats.errors.join('\n'));
                return reject(new Error('Webpack compiler encountered errors'));
            } else if (jsonStats.warnings.length > 0) {
                console.log('Webpack compiler encountered warnings.');
                console.log(jsonStats.warnings.join('\n'));
            } else {
                console.log('No errors or warnings encountered.');
            }
            resolve(jsonStats);
        });
    });

const compile = () => {
    console.log('Starting compiler.');
    return Promise.resolve()
        .then(() => webpackCompiler(webpackConfig))
        .then(stats => {
            if (stats.warnings.length && fail_on_warning) {
                throw new Error('Config set to fail on warning, exiting with status code "1".');
            }
            console.log('Copying static assets to dist folder.');
            fs.copySync(helper.PATHS.static, helper.PATHS.dist);
        })
        .then(() => {
            console.log('Compilation completed successfully.');
        })
        .catch((err) => {
            console.log('Compiler encountered an error.', err);
            process.exit(1);
        });
};

compile();
