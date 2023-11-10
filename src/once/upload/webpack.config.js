process.traceDeprecation = true;
const mf_config = require("@patternslib/dev/webpack/webpack.mf");
const path = require("path");
const package_json = require("./package.json");
const package_json_mockup = require("@plone/mockup/package.json");
const webpack_config = require("@patternslib/dev/webpack/webpack.config").config;


module.exports = () => {
    let config = {
        entry: {
            "bundle.min": path.resolve(__dirname, "pat/index"),
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    bootstrapIcons: {
                        test: /[\\/]node_modules[\\/]bootstrap-icons/,
                        name: 'vendors',
                        chunks: 'all',
                        enforce: true,
                    },
                },
                minSize: 8000, // Establece un tamaño mínimo
            },
        },
    };

    config = webpack_config({
        config: config,
        package_json: package_json,
    });
    config.output.path = path.resolve(__dirname, "browser/static");
    config.output.clean = true;

    config.module.rules.push({
        test: /\.svg$/i,
        type: 'asset/resource',
        exclude: path.join(__dirname, "node_modules/bootstrap-icons/icons/"),
    });

    config.plugins.push(
        mf_config({
            name: "once-upload",
            filename: "remote.min.js",
            remote_entry: config.entry["bundle.min"],
            remotes: {
                '@plone/mockup': '@plone/mockup', // Remoto para el paquete original
              },
            dependencies: {
                ...package_json_mockup.dependencies,
                ...package_json.dependencies,
            },
            shared: {
                bootstrap: {
                    singleton: true,
                    requiredVersion: package_json.dependencies["bootstrap"],
                    eager: true,
                },
                jquery: {
                    singleton: true,
                    requiredVersion: "3.7.1",
                    eager: true,
                },
                "bootstrap-icons": {
                    singleton: true,
                    requiredVersion: package_json_mockup.dependencies["boostrap-icons"],
                    eager: true,
                }
            },
            externals: {
                "@plone/mockup": "@plone/mockup",
                // "bootstrap": "bootstrap",
                // "bootstrap-icons": "bootstrap-icons",
            },
            // patterns: {
            //     "upload": {
            //       "selector": "pat-upload",
            //       "module": "__patternslib_mf__onceupload",
            //     },
            // },
        })
    );

    if (process.env.NODE_ENV === "development") {
        config.devServer.port = "8011";
        config.devServer.static.directory = __dirname;
    }

    return config;
};