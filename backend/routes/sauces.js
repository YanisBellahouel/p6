const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();

const saucesCtrl = require('../controllers/sauces');

router.post('/', auth, multer, saucesCtrl.addSauce);
router.get('/', auth, saucesCtrl.getSauces);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
router.post('/:id/like', auth, saucesCtrl.likeOrDislike);

module.exports = router;