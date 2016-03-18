/**
 * Module dependencies.
 */
var Strategy = require('./oauth2');


/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Strategy = Strategy;
