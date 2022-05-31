const express = require('express')

const {
  createShop,
  getShops,
  getShopByID,
  getShopProducts,
  updateShop,
  deleteShop,
  getCurrentShop
} = require('../controllers/shop.controllers')

const {
  shopValidations,
  checkValidations,
  updateShopValidations
} = require('../middlewares/validations.middlewares')

const {protectToken} = require('../middlewares/users.middlewares')

const { shopExist, protectShopOwner } = require('../middlewares/shop.middlewares')

const { upload } = require('../utils/multer');

const router = express.Router()

const cpUpload = upload.fields([
  { name: 'logoImg', maxCount: 1 },
  {name: 'coverImg', maxCount: 1}])
  

router.get('/products/:id', shopExist, getShopProducts)
router.get('/:id', shopExist, getShopByID)

router.use('/', protectToken)

router.get('/', getCurrentShop)
  
router.post('/',
  cpUpload, 
  shopValidations,
  checkValidations,
  createShop)

router.patch('/:id',
  cpUpload,
  shopExist,
  protectShopOwner,
  updateShopValidations,
  checkValidations,
  updateShop)

router.delete('/:id',
  shopExist,
  protectShopOwner,
  deleteShop)


module.exports = { shopRouter: router }
