const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// --- Analytics Settings ---

// Get Analytics Settings
router.get('/analytics', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM analytics_settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        console.error('Error fetching analytics settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Analytics Settings
router.post('/analytics', authenticateToken, authorizeAdmin, async (req, res) => {
    const { google_analytics_id, facebook_pixel_id, custom_header_scripts, custom_footer_scripts } = req.body;
    try {
        const [rows] = await db.query('SELECT id FROM analytics_settings LIMIT 1');
        if (rows.length > 0) {
            await db.query(
                'UPDATE analytics_settings SET google_analytics_id = ?, facebook_pixel_id = ?, custom_header_scripts = ?, custom_footer_scripts = ? WHERE id = ?',
                [google_analytics_id, facebook_pixel_id, custom_header_scripts, custom_footer_scripts, rows[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO analytics_settings (google_analytics_id, facebook_pixel_id, custom_header_scripts, custom_footer_scripts) VALUES (?, ?, ?, ?)',
                [google_analytics_id, facebook_pixel_id, custom_header_scripts, custom_footer_scripts]
            );
        }
        res.json({ message: 'Analytics settings updated successfully' });
    } catch (error) {
        console.error('Error updating analytics settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Site Settings ---

// Get Site Settings
router.get('/site', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM site_settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Site Settings
router.post('/site', authenticateToken, authorizeAdmin, async (req, res) => {
    const {
        site_title, site_tagline, site_email, contact_phone, address, logo_url, favicon_url, maintenance_mode,
        social_facebook, social_twitter, social_instagram, social_linkedin, social_youtube
    } = req.body;
    // maintenance_mode usually comes as string 'true'/'false' or boolean from JSON
    const maintenance = maintenance_mode === 'true' || maintenance_mode === true || maintenance_mode === 1;

    try {
        const [rows] = await db.query('SELECT id FROM site_settings LIMIT 1');
        if (rows.length > 0) {
            await db.query(
                'UPDATE site_settings SET site_title = ?, site_tagline = ?, site_email = ?, contact_phone = ?, address = ?, logo_url = ?, favicon_url = ?, maintenance_mode = ?, social_facebook = ?, social_twitter = ?, social_instagram = ?, social_linkedin = ?, social_youtube = ? WHERE id = ?',
                [site_title, site_tagline, site_email, contact_phone, address, logo_url, favicon_url, maintenance, social_facebook, social_twitter, social_instagram, social_linkedin, social_youtube, rows[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO site_settings (site_title, site_tagline, site_email, contact_phone, address, logo_url, favicon_url, maintenance_mode, social_facebook, social_twitter, social_instagram, social_linkedin, social_youtube) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [site_title, site_tagline, site_email, contact_phone, address, logo_url, favicon_url, maintenance, social_facebook, social_twitter, social_instagram, social_linkedin, social_youtube]
            );
        }
        res.json({ message: 'Site settings updated successfully' });
    } catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Email Settings ---

// Get Email Settings
router.get('/email', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM email_settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        console.error('Error fetching email settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Email Settings
router.post('/email', authenticateToken, authorizeAdmin, async (req, res) => {
    const { mail_driver, mail_host, mail_port, mail_username, mail_password, mail_encryption, from_address, from_name } = req.body;
    try {
        const [rows] = await db.query('SELECT id FROM email_settings LIMIT 1');
        if (rows.length > 0) {
            await db.query(
                'UPDATE email_settings SET mail_driver = ?, mail_host = ?, mail_port = ?, mail_username = ?, mail_password = ?, mail_encryption = ?, from_address = ?, from_name = ? WHERE id = ?',
                [mail_driver, mail_host, mail_port, mail_username, mail_password, mail_encryption, from_address, from_name, rows[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO email_settings (mail_driver, mail_host, mail_port, mail_username, mail_password, mail_encryption, from_address, from_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [mail_driver, mail_host, mail_port, mail_username, mail_password, mail_encryption, from_address, from_name]
            );
        }
        res.json({ message: 'Email settings updated successfully' });
    } catch (error) {
        console.error('Error updating email settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
