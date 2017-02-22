/**
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
export default function segmentsMiddleware(req, res, next) {
  req.hull = req.hull || {};

  if (!req.hull.client) {
    return next();
  }

  const { message } = req.hull;
  const bust = (message && (message.Subject === "segment:update" || message.Subject === "segment:delete"));

  return (() => {
    if (bust) {
      return cache.del("segments");
    }
    return Promise.resolve();
  })().then(() => {
    return cache.wrap("segments", () => req.hull.client.get("/segments"));
  ]).then((segments) => {
    req.hull.segments = segments;
    return next();
  }, () => next());
}
