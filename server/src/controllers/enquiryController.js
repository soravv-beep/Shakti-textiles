const data = require('../services/data');
const mailer = require('../services/mailer');

/* POST /api/enquiry */
exports.createEnquiry = async (req, res, next) => {
  try {
    const { name, company, phone, email, product, quantity, message } = req.body;
    const enquiry = await data.createEnquiry({
      name, company, phone, email, product, quantity, message,
      source: req.body.source || 'website',
    });
    // Fire-and-forget notifications — never block the API response on mail.
    mailer.sendEnquiryAlert(enquiry).catch((e) => console.error('[mail] enquiry alert failed:', e.message));
    mailer.sendEnquiryConfirmation(enquiry).catch((e) => console.error('[mail] confirmation failed:', e.message));
    res.status(201).json({
      success: true,
      message: 'Sample request submitted successfully. Our team will contact you within 24 hours.',
      data: { id: enquiry._id },
    });
  } catch (err) { next(err); }
};

/* POST /api/contact */
exports.createContact = async (req, res, next) => {
  try {
    const { name, email, company, message } = req.body;
    const contact = await data.createContact({ name, email, company, message });
    mailer.sendContactAlert(contact).catch((e) => console.error('[mail] contact alert failed:', e.message));
    res.status(201).json({
      success: true,
      message: 'Message sent. We will get back to you within one business day.',
      data: { id: contact._id },
    });
  } catch (err) { next(err); }
};
