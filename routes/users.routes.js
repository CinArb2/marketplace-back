const express = require('express')

const {
  signup,
  login,
  updateUser,
  deleteUser,
  getUserOrders,
  getOrderById,
  getAllUsers,
  getUserById
} = require('../controllers/users.controllers')

const {
  createUserValidations,
  checkValidations,
  updateUserValidations
} = require('../middlewares/validations.middlewares')

const {
  userExists,
  protectToken,
  protectAccountOwner
} = require('../middlewares/users.middlewares')

const { upload } = require('../utils/multer');

const router = express.Router()

router.post('/',
  upload.single('avatarImg'),
  createUserValidations,
  checkValidations,
  signup)

router.post('/login', login)

router.use('/', protectToken)

router.get('/', getAllUsers)

router.patch('/:id',
  upload.single('avatarImg'),
  userExists,
  protectAccountOwner,
  updateUserValidations,
  checkValidations,
  updateUser)

router.delete('/:id',
  userExists,
  protectAccountOwner,
  deleteUser)

router.get('/orders', getUserOrders)
router.get('/orders/:id', getOrderById)
router.get('/:id', userExists, getUserById)

module.exports = { userRouter: router }
