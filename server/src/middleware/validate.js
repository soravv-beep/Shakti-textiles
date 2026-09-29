/** Wraps express-validator chains into one middleware and reports field errors uniformly. */
const { validationResult } = require('express-validator');

function validate(validations) {
  return [
    ...validations,
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) return next();
      return res.status(422).json({
        success: false,
        message: 'Please correct the highlighted fields and try again.',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    },
  ];
}

module.exports = { validate };
