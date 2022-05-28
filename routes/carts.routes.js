const express = require('express')

const {
  getCart,
  addProductCart,
  purchaseCart,
  updateCart,
  deleteProductCart,
  getProductsInCart
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

router.get('/', getProductsInCart)

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

router.post('/purchase',
  cartActiveExist, 
  purchaseCart)

module.exports = { cartRouter: router }