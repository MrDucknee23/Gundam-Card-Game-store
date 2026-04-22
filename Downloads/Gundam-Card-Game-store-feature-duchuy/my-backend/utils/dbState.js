const mongoose = require('mongoose');

const DEFAULT_CATEGORY_SEED = Object.freeze([
  { name: 'gundam', slug: 'gundam', label: 'Gundam', description: 'Mo hinh Gundam cac loai' },
  { name: 'pokemon', slug: 'pokemon', label: 'Pokemon', description: 'The bai Pokemon TCG' },
  { name: 'onepiece', slug: 'onepiece', label: 'One Piece', description: 'The bai One Piece Card Game' },
]);

const getDbReadyState = () => mongoose.connection.readyState;

const getDbStateLabel = () => {
  switch (getDbReadyState()) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
};

const isDbReady = () => getDbReadyState() === 1;

const isDbUnavailableError = (err) => {
  if (!err) {
    return !isDbReady();
  }

  const message = String(err?.message || err);
  const name = String(err?.name || '');

  return (
    !isDbReady() ||
    /server selection|buffering timed out|failed to connect|topology was destroyed|not connected|connection.*closed|client must be connected|socket|econnrefused|enotfound|etimedout|timed out/i.test(message) ||
    /MongoServerSelectionError|MongooseServerSelectionError|MongoNetworkError|MongoTopologyClosedError/i.test(name)
  );
};

const setDegradedHeaders = (res, source = 'mongo-unavailable') => {
  res.set('X-Data-Degraded', '1');
  res.set('X-Data-Source', source);
  res.set('X-Db-State', getDbStateLabel());
};

const sendDegradedJson = (res, data, { source = 'mongo-unavailable', status = 200 } = {}) => {
  setDegradedHeaders(res, source);
  return res.status(status).json(data);
};

const sendServiceUnavailable = (res, message = 'Du lieu tam thoi khong san sang', { source = 'mongo-unavailable' } = {}) => {
  setDegradedHeaders(res, source);
  return res.status(503).json({ message });
};

const logDbDegraded = (scope, err, extra = {}) => {
  console.warn(`[db-degraded:${scope}]`, {
    state: getDbStateLabel(),
    message: err?.message || err || 'db_unavailable',
    ...extra,
  });
};

const getDefaultCategoriesFallback = () => DEFAULT_CATEGORY_SEED.map((category) => ({
  ...category,
  id: category.slug,
}));

module.exports = {
  DEFAULT_CATEGORY_SEED,
  getDbReadyState,
  getDbStateLabel,
  getDefaultCategoriesFallback,
  isDbReady,
  isDbUnavailableError,
  logDbDegraded,
  sendDegradedJson,
  sendServiceUnavailable,
  setDegradedHeaders,
};