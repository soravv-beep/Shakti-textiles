export const validators = {
  required: (label) => (v) => (String(v ?? '').trim() ? '' : `${label} is required.`),
  email: (v) => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? '' : 'Please enter a valid business email.';
  },
  phone: (v) => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    return /^[+]?[\d\s-]{7,20}$/.test(s) ? '' : 'Please enter a valid phone number with country code.';
  },
  maxLen: (n) => (v) => (String(v ?? '').length <= n ? '' : `Must be ${n} characters or fewer.`),
};

/** Runs a { field: [validatorFn, ...] } map against { field: value } values. */
export function validateFields(values, schema) {
  const errors = {};
  for (const [field, fns] of Object.entries(schema)) {
    for (const fn of fns) {
      const msg = fn(values[field]);
      if (msg) { errors[field] = msg; break; }
    }
  }
  return errors;
}
