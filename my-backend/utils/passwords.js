const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$.{53}$/;

const looksLikePasswordHash = (value) => typeof value === 'string' && BCRYPT_HASH_PATTERN.test(value);

const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

const verifyAndUpgradeLegacyPassword = async (user, candidatePassword) => {
  if (!user?.password || !candidatePassword) {
    return false;
  }

  if (looksLikePasswordHash(user.password)) {
    return bcrypt.compare(candidatePassword, user.password);
  }

  const isLegacyMatch = user.password === candidatePassword;

  if (!isLegacyMatch) {
    return false;
  }

  user.password = await hashPassword(candidatePassword);
  await user.save();
  return true;
};

module.exports = {
  hashPassword,
  looksLikePasswordHash,
  verifyAndUpgradeLegacyPassword,
};