// zod validation for admin routes. Parsed, typed values land on req.v.body / req.v.query /
// req.v.params (Express 5's req.query is read-only). Unknown body fields are dropped.
const { z } = require('zod');

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

const validate = (schemas) => (req, res, next) => {
  req.v = req.v || {};
  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.join('.');
      return res.status(400).json({ msg: field ? `${field}: ${issue.message}` : issue.message, code: 'VALIDATION' });
    }
    req.v[part] = result.data;
  }
  next();
};

// Shared bits.
const idParams = z.object({ id: objectId });
const paging = {
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
const search = z.string().trim().max(100).optional().default('');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { z, validate, objectId, idParams, paging, search, escapeRegex };
