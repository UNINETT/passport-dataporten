/**
 * Module dependencies.
 */
var util = require('util')
, OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


/**
 * `Strategy` constructor.
 *
 * The Feide Connect authentication strategy authenticates requests by
 * delegating to Feide Connect using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Feide Connect application's client id
 *   - `clientSecret`  your Feide Connect application's client secret
 *   - `callbackURL`   URL to which Feide Connect will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new FeideConnectStrategy({
 *         clientID: '42934c73-6fae-4507-92a4-c67f87923aa9',
 *         clientSecret: 'shhh-its-a-secret',
 *         callbackURL: 'https://www.example.net/auth/feideconnect/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
	options = options || {};
	options.authorizationURL = options.authorizationURL || 'https://auth.dataporten.no/oauth/authorization';
	options.tokenURL = options.tokenURL || 'https://auth.dataporten.no/oauth/token';
	options.scopeSeparator = options.scopeSeparator || ' ';
	options.customHeaders = options.customHeaders || {};

	this.profileUrl = options.profileUrl || 'https://auth.dataporten.no/userinfo',

	options.sessionKey = options.sessionKey || 'oauth:dataporten';

	if (!options.customHeaders['User-Agent']) {
		options.customHeaders['User-Agent'] = options.userAgent || 'passport-dataporten';
	}
	OAuth2Strategy.call(this, options, verify);
	this.name = 'dataporten';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Feide Connect.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `feideconnect`
 *   - `id`               the user's ID
 *   - `displayName`      the user's username
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
	this._oauth2.get(
		this.profileUrl,
		accessToken,
		function (err, body, res) {
			if (err) {
				return done(err);
			} else {
				try {
					var json = JSON.parse(body);

					var profile = {
						provider: 'Dataporten'
					};

					profile.id = json.user.userid;
					profile.displayName = json.user.name;
					if (json.user.email)
						profile.emails = [ json.user.email ];
					if (json.user.profilephoto)
						profile.photos = [ 'https://api.dataporten.no/userinfo/v1/user/media/' + json.user.profilephoto ];

					profile._raw = body;
					profile._json = json;

					done(null, profile);
					
				} catch(e) {
					done(e);
				}
			}
		}
	);
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
