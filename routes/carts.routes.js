const express = require('express')

const {
  getCart,
  addProductCart,
  purchaseCart,
  updateCart,
  deleteProductCart,
  getProductsInCart,
  emptyCart
} = require('../controllers/carts.controllers')

const {
  cartValidations,
  checkValidations
} = require('../middlewares/validations.middlewares')

const {
  protectToken
} = require('../middlewares/users.middlewares')

const {
  cartActiveExist,
  validateQuantity
} = require('../middlewares/carts.middlewares')

const router = express.Router()


router.use('/', protectToken)

router.get('/', cartActiveExist, getProductsInCart)

router.post('/add-product',
  cartValidations,
  checkValidations,
  cartActiveExist,
  validateQuantity,
  addProductCart)

router.patch('/update-cart',
  cartActiveExist, 
  validateQuantity,
  updateCart)

router.delete('/:productId',
  cartActiveExist,
  deleteProductCart)

router.delete('/',
  cartActiveExist,
  emptyCart
)

router.post('/purchase',
  cartActiveExist, 
  purchaseCart)

module.exports = { cartRouter: router }