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
        resolve: {
            extensions: ['.js', '.jsx', '.json', '.xml'],
            alias: {
                // Alias para sobrescribir el módulo upload de @plone/mockup
                // "upload": path.resolve(__dirname, "pat/upload/upload.js"),
                "./pat/upload/upload": path.resolve(__dirname, "pat/upload/upload.js"),
                // upload$: path.resolve(__dirname, "pat/upload"),
            }
        }
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
    });

    config.plugins.push(
        mf_config({
            name: "once-upload",
            filename: "bundle-remote.min.js",
            remote_entry: config.entry["bundle.min"],
            dependencies: {
                ...package_json_mockup.dependencies,
                ...package_json.dependencies,
            },
            externals: 'bootstrap-icons'
        })
    );

    if (process.env.NODE_ENV === "development") {
        config.devServer.port = "8011";
        config.devServer.static.directory = __dirname;
    }

    return config;
};