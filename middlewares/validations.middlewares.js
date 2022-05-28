const { body, validationResult } = require('express-validator')

const { AppError } = require('../utils/appError')

const createUserValidations = [
  body('username')
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('email')
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
]

const checkValidations = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const messages = errors.array().map(({ msg }) => msg)

    const errorMsg = messages.join('. ')

    return next(new AppError(errorMsg, 404))
  }

  next()
}

const cartValidations = [
  body('productId')
    .notEmpty()
    .withMessage('productId cannot be empty')
    .isInt({min: 0})
    .withMessage('id must be integer'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity cannot be empty')
    .isInt({min: 0})
    .withMessage('Quantity must be integer')
]

const productValidations = [
  body('title')
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('description')
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 100 })
    .withMessage('comments must be maximum 100 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price cannot be empty')
    .isFloat({min: 0})
    .withMessage('Invalide value'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity cannot be empty')
    .isInt({min: 0})
    .withMessage('Quantity must be integer')
]

const shopValidations = [
  body('title')
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('description')
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 100 })
    .withMessage('comments must be maximum 100 characters')
]

const categoryValidations = [
  body('name')
    .notEmpty()
    .withMessage('Name cannot be empty'),
]

const updateProdValidations = [
  body('price')
    .optional()
    .isFloat({min: 0})
    .withMessage('Invalide value'),
  body('quantity')
    .optional()
    .isInt({min: 0})
    .withMessage('Quantity must be integer')
]

const updateUserValidations = [
  body('email')
    .isEmail()
    .optional()
    .withMessage('Must be a valid email'),
]

const updateShopValidations = [
  body('title')
    .optional()
    .isLength({ max: 50 })
    .withMessage('title must be maximum 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('description must be maximum 200 characters')
]

module.exports = {
  createUserValidations,
  checkValidations,
  productValidations,
  cartValidations,
  updateProdValidations,
  updateUserValidations,
  categoryValidations,
  shopValidations,
  updateShopValidations
}
