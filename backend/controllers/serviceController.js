const { query } = require('../db');

const listServices = async (req, res) => {
    try {
        const services = await query("SELECT * FROM services");
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createService = async (req, res) => {
    const { title, description, icon, status } = req.body;
    try {
        await query("INSERT INTO services (title, description, icon, status) VALUES (?, ?, ?, ?)",
            [title, description, icon, status]);
        res.status(201).json({ message: 'Service created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateService = async (req, res) => {
    const { id } = req.params;
    const { title, description, icon, status } = req.body;
    try {
        await query("UPDATE services SET title=?, description=?, icon=?, status=? WHERE id=?",
            [title, description, icon, status, id]);
        res.json({ message: 'Service updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        await query("DELETE FROM services WHERE id=?", [id]);
        res.json({ message: 'Service deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { listServices, createService, updateService, deleteService };
