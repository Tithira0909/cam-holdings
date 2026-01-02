const db = require('../config/db');

exports.getQuotationSettings = async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM quotation_settings');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateQuotationSettings = async (req, res) => {
  const { key, value } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM quotation_settings WHERE setting_key = ?', [key]);
    if (existing.length > 0) {
      await db.query('UPDATE quotation_settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
    } else {
      await db.query('INSERT INTO quotation_settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
    }
    res.json({ message: 'Setting updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSiteSettings = async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM site_settings');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSiteSettings = async (req, res) => {
  const { key, value } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM site_settings WHERE setting_key = ?', [key]);
    if (existing.length > 0) {
      await db.query('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
    } else {
      await db.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
    }
    res.json({ message: 'Site setting updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
