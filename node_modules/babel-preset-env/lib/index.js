"use strict";

exports.__esModule = true;
exports.validateWhitelistOption = exports.validateModulesOption = exports.validateLooseOption = exports.getTargets = exports.getCurrentNodeVersion = exports.isPluginRequired = exports.MODULE_TRANSFORMATIONS = undefined;
exports.default = buildPreset;

var _plugins = require("../data/plugins.json");

var _plugins2 = _interopRequireDefault(_plugins);

var _browserslist = require("browserslist");

var _browserslist2 = _interopRequireDefault(_browserslist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MODULE_TRANSFORMATIONS = exports.MODULE_TRANSFORMATIONS = {
  "amd": "transform-es2015-modules-amd",
  "commonjs": "transform-es2015-modules-commonjs",
  "systemjs": "transform-es2015-modules-systemjs",
  "umd": "transform-es2015-modules-umd"
};

/**
 * Determine if a transformation is required
 * @param  {Object}  supportedEnvironments  An Object containing environment keys and the lowest
 *                                          supported version as a value
 * @param  {Object}  plugin                 An Object containing environment keys and the lowest
 *                                          version the feature was implmented in as a value
 * @return {Boolean}  Whether or not the transformation is required
 */
var isPluginRequired = exports.isPluginRequired = function isPluginRequired(supportedEnvironments, plugin) {
  if (supportedEnvironments.browsers) {
    supportedEnvironments = getTargets(supportedEnvironments);
  }

  var targetEnvironments = Object.keys(supportedEnvironments);

  if (targetEnvironments.length === 0) {
    return true;
  }

  var isRequiredForEnvironments = targetEnvironments.filter(function (environment) {
    // Feature is not implemented in that environment
    if (!plugin[environment]) {
      return true;
    }

    var lowestImplementedVersion = plugin[environment];
    var lowestTargetedVersion = supportedEnvironments[environment];

    if (lowestTargetedVersion < lowestImplementedVersion) {
      return true;
    }

    return false;
  });

  return isRequiredForEnvironments.length > 0 ? true : false;
};

var isBrowsersQueryValid = function isBrowsersQueryValid(browsers) {
  return typeof browsers === "string" || Array.isArray(browsers);
};

var browserNameMap = {
  chrome: "chrome",
  edge: "edge",
  firefox: "firefox",
  ie: "ie",
  ios_saf: "ios",
  safari: "safari"
};

var getLowestVersions = function getLowestVersions(browsers) {
  return browsers.reduce(function (all, browser) {
    var _browser$split = browser.split(" "),
        browserName = _browser$split[0],
        browserVersion = _browser$split[1];

    if (browserName in browserNameMap) {
      all[browserNameMap[browserName]] = parseInt(browserVersion);
    }
    return all;
  }, {});
};

var mergeBrowsers = function mergeBrowsers(fromQuery, fromTarget) {
  return Object.keys(fromTarget).reduce(function (queryObj, targKey) {
    if (targKey !== "browsers") {
      queryObj[targKey] = fromTarget[targKey];
    }
    return queryObj;
  }, fromQuery);
};

var getCurrentNodeVersion = exports.getCurrentNodeVersion = function getCurrentNodeVersion() {
  return parseFloat(process.versions.node);
};

var getTargets = exports.getTargets = function getTargets() {
  var targetOpts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (targetOpts.node === true || targetOpts.node === "current") {
    targetOpts.node = getCurrentNodeVersion();
  }

  var browserOpts = targetOpts.browsers;
  if (isBrowsersQueryValid(browserOpts)) {
    var queryBrowsers = getLowestVersions((0, _browserslist2.default)(browserOpts));
    return mergeBrowsers(queryBrowsers, targetOpts);
  }
  return targetOpts;
};

// TODO: Allow specifying plugins as either shortened or full name
// babel-plugin-transform-es2015-classes
// transform-es2015-classes
var validateLooseOption = exports.validateLooseOption = function validateLooseOption() {
  var looseOpt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  if (typeof looseOpt !== "boolean") {
    throw new Error("Preset env: 'loose' option must be a boolean.");
  }

  return looseOpt;
};

var validateModulesOption = exports.validateModulesOption = function validateModulesOption() {
  var modulesOpt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "commonjs";

  if (modulesOpt !== false && Object.keys(MODULE_TRANSFORMATIONS).indexOf(modulesOpt) === -1) {
    throw new Error("The 'modules' option must be 'false' to indicate no modules\n" + "or a module type which be be one of: 'commonjs' (default), 'amd', 'umd', 'systemjs'");
  }

  return modulesOpt;
};

var validateWhitelistOption = exports.validateWhitelistOption = function validateWhitelistOption() {
  var whitelistOpt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  if (!Array.isArray(whitelistOpt)) {
    throw new Error("The 'whitelist' option must be an Array<string> of plugins\n      {\n        \"presets\": [\n          [\"env\", {\n            \"targets\": {\n              \"chrome\": 50\n            },\n            \"whitelist\": [\"transform-es2015-arrow-functions\"]\n          }]\n        ]\n      }\n      was passed \"" + whitelistOpt + "\" instead\n    ");
  }

  return whitelistOpt;
};

var hasBeenLogged = false;

function buildPreset(context) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var loose = validateLooseOption(opts.loose);
  var moduleType = validateModulesOption(opts.modules);
  var whitelist = validateWhitelistOption(opts.whitelist);
  var targets = getTargets(opts.targets);
  var debug = opts.debug;

  var transformations = Object.keys(_plugins2.default).filter(function (pluginName) {
    return isPluginRequired(targets, _plugins2.default[pluginName]);
  });

  if (debug && !hasBeenLogged) {
    hasBeenLogged = true;

    console.log("babel-preset-env: `DEBUG` option");
    console.log("");
    console.log("Using targets: " + JSON.stringify(targets, null, 2));
    console.log("");
    console.log("Using plugins:");
    console.log("");
    console.log("module: " + moduleType);
    transformations.forEach(function (transform) {
      var envList = _plugins2.default[transform];
      var filteredList = Object.keys(targets).reduce(function (a, b) {
        a[b] = envList[b];
        return a;
      }, {});
      console.log(transform, JSON.stringify(filteredList, null, 2));
    });
  }

  transformations = [].concat(transformations, whitelist).map(function (pluginName) {
    return [require("babel-plugin-" + pluginName), { loose: loose }];
  });

  var modules = [moduleType === "commonjs" && [require("babel-plugin-transform-es2015-modules-commonjs"), { loose: loose }], moduleType === "systemjs" && [require("babel-plugin-transform-es2015-modules-systemjs"), { loose: loose }], moduleType === "amd" && [require("babel-plugin-transform-es2015-modules-amd"), { loose: loose }], moduleType === "umd" && [require("babel-plugin-transform-es2015-modules-umd"), { loose: loose }]].filter(Boolean);

  return {
    plugins: [].concat(modules, transformations)
  };
}