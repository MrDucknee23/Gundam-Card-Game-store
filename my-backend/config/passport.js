const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const getApiBaseUrl = () => process.env.API_BASE_URL?.trim() || `http://localhost:${process.env.PORT || 5000}`;

const extractProfileName = (profile) => {
  if (profile.displayName?.trim()) {
    return profile.displayName.trim();
  }

  const givenName = profile.name?.givenName?.trim() || '';
  const familyName = profile.name?.familyName?.trim() || '';
  return `${givenName} ${familyName}`.trim() || 'Social User';
};

const extractProfilePhoto = (profile) => profile.photos?.[0]?.value?.trim() || '';

const createOAuthFailure = (reason) => {
  const error = new Error(reason);
  error.oauthReason = reason;
  return error;
};

const findOrCreateOAuthUser = async ({ provider, providerId, email, name, avatar }) => {
  const normalizedEmail = email?.trim().toLowerCase() || '';
  const providerKey = provider === 'google' ? 'googleId' : 'facebookId';

  const existingProviderUser = await User.findOne({ [providerKey]: providerId });
  if (existingProviderUser) {
    if (!existingProviderUser.name && name) {
      existingProviderUser.name = name;
    }

    if (!existingProviderUser.avatar && avatar) {
      existingProviderUser.avatar = avatar;
    }

    if (!existingProviderUser.email && normalizedEmail) {
      existingProviderUser.email = normalizedEmail;
    }

    await existingProviderUser.save();
    return existingProviderUser;
  }

  if (!normalizedEmail) {
    throw createOAuthFailure('oauth_email_missing');
  }

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = new User({
      email: normalizedEmail,
      name,
      avatar,
      role: 'customer',
      status: 'active',
      [providerKey]: providerId,
    });
    await user.save();
    return user;
  }

  if (!user[providerKey]) {
    user[providerKey] = providerId;
  }

  if (!user.name && name) {
    user.name = name;
  }

  if (!user.avatar && avatar) {
    user.avatar = avatar;
  }

  await user.save();
  return user;
};

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `${getApiBaseUrl()}/api/auth/google/callback`,
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser({
          provider: 'google',
          providerId: profile.id,
          email: profile.emails?.[0]?.value,
          name: extractProfileName(profile),
          avatar: extractProfilePhoto(profile),
        });
        done(null, user);
      } catch (error) {
        done(error);
      }
    }));
  }

  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || `${getApiBaseUrl()}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'name', 'emails', 'photos'],
      enableProof: true,
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser({
          provider: 'facebook',
          providerId: profile.id,
          email: profile.emails?.[0]?.value,
          name: extractProfileName(profile),
          avatar: extractProfilePhoto(profile),
        });
        done(null, user);
      } catch (error) {
        done(error);
      }
    }));
  }
};