const express = require('express');
const { register } = require('../controllers/registercontroller');
const { login, logout } = require('../controllers/authcontroller');


const router = express.Router();

// Controllers handle sending responses; use them directly as handlers.
router.post('/user/register', register);
router.post('/user/login', login);
router.get('/user/logout', logout);

module.exports = router;
