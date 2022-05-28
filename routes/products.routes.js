const express = require('express')

const {
  createProduct,
  getListProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/products.controllers')

const {
  createCategory,
  getCategories
 } = require('../controllers/categories.controllers')

const {
  productValidations,
  checkValidations,
  updateProdValidations,
  categoryValidations
} = require('../middlewares/validations.middlewares')

const {
  protectToken
} = require('../middlewares/users.middlewares')

const {
  productExists,
  protectProductOwner,
  userHasShop
} = require('../middlewares/products.middlewares')

const { upload } = require('../utils/multer');

const router = express.Router()

router.get('/', getListProducts)
router.get('/categories', getCategories)
router.get('/:id', productExists, getProductById)

router.use('/', protectToken)

router.post('/',
  upload.array('productImgs', 3),
  userHasShop, 
  productValidations,
  checkValidations,
  createProduct)

router.patch('/:id',
  productExists,
  protectProductOwner,
  updateProdValidations,
  checkValidations,
  updateProduct)

router.delete('/:id',
  productExists,
  protectProductOwner,
  deleteProduct)

router.post('/categories',
  categoryValidations,
  checkValidations,
  createCategory
)

module.exports = { productRouter: router }

