const express = require('express');
const router = express.Router();
const mandalartController = require('../controllers/mandalartController');

router.get('/', mandalartController.getMandalartForm);
router.post('/', mandalartController.createMandalart);
router.post('/addTask', mandalartController.addTask);

module.exports = router;
