const express = require('express');
const router = express.Router();

// GET 404
router.use((req, res) => {
    console.error(`404 Error - Page not found: ${req.originalUrl}`); //debugging
    res.status(404).render('404', { title: 'Page Not Found' });
});

module.exports = router;