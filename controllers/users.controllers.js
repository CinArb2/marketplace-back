require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const { User } = require('../models/user.model')
const { Order } = require('../models/order.model')
const { Cart } = require('../models/cart.model')
const { ProductInCart } = require('../models/productInCart.model')
// const { Product } = require('../models/product.model')

const { catchAsync } = require('../utils/catchAsync')
const { AppError } = require('../utils/appError')
const { storage } = require('../utils/firebase');

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  })
  res.status(200).json({
    users
  })
})

const getUserById = catchAsync(async (req, res, next) => {
  const { user } = req;

  // Get url from firebase
  const imgRef = ref(storage, user.avatarImg);
  const url = await getDownloadURL(imgRef);

  user.avatarImg = url;

  res.status(200).json({
    user,
  });
})

const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body

  const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`);
  const imgUploaded = await uploadBytes(imgRef, req.file.buffer);

  const salt = await bcrypt.genSalt(12)
  const hashPwd = await bcrypt.hash(password, salt)

  const newUser = await User.create(
    {
      username,
      email,
      password: hashPwd,
      avatarImg: imgUploaded.metadata.fullPath,
    })

  newUser.password = undefined

  res.status(201).json({ newUser })
})

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  const user = await User.findOne({
    where: { email, status: 'active' }
  })

  if (!user) {
    return next(new AppError('invalid credentials', 400))
  }

  const decode = await bcrypt.compare(password, user.password)

  if (!decode) {
    return next(new AppError('invalid credentials', 400))
  }

  const token = await jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  user.password = undefined

  res.status(200).json({ token, user })
})

const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req

  if (req.file) {
    const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`);
    const imgUploaded = await uploadBytes(imgRef, req.file.buffer);

    await user.update(
    {
        avatarImg: imgUploaded.metadata.fullPath,
    })
  }

  const { username, email } = req.body

  await user.update(
    {
      username,
      email
    })

  res.status(200).json({ status: 'success' })
})

const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req

  await user.update({ status: 'deleted' })

  res.status(200).json({ status: 'success' })
})

const getUserOrders = catchAsync(async (req, res, next) => {
  const { userSession } = req

  const userOrders = await Order.findAll({
    where: {
      userId: userSession.id,
    },
    include: {
      model: Cart,
      include: {
        model: ProductInCart,
      }
    }
  })
  
  if (!userOrders) {
    return next(new AppError('not orders found for this user', 400))
  }

  res.status(200).json({ userOrders })
})

const getOrderById = catchAsync(async (req, res, next) => {
  const { userSession } = req
  const { id } = req.params


  const userOrders = await Order.findOne({
    where: {
      id,
      userId: userSession.id,
    },
    include: {
      model: Cart,
      include: {
        model: ProductInCart,
      }
    }
  })

  if (!userOrders) {
    return next(new AppError('order not found with given id', 400))
  }

  res.status(200).json({ userOrders })
})

const getCurrentUser = catchAsync(async (req, res, next) => {
  const { userSession } = req

  // Get url from firebase
  const imgRef = ref(storage, userSession.avatarImg);
  const url = await getDownloadURL(imgRef);

  userSession.avatarImg = url;

  res.status(200).json({ userSession })
})

module.exports = {
  signup,
  login,
  updateUser,
  deleteUser,
  getUserOrders,
  getOrderById,
  getAllUsers,
  getUserById,
  getCurrentUser
}
