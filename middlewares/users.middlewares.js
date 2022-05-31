const jwt = require('jsonwebtoken')
require('dotenv').config()

// Models
const { User } = require('../models/user.model')

const { AppError } = require('../utils/appError')
const { catchAsync } = require('../utils/catchAsync')

const protectToken = catchAsync(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('session invalid', 403))
  }

  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET)

  const userSession = await User.findOne({
    where: { id: decodedToken.id, status: 'active' },
    attributes: { exclude: ['password'] }
  })

  if (!userSession) {
    return next(new AppError('The owner not longer available', 403))
  }

  req.userSession = userSession
  next()
})

const protectAccountOwner = catchAsync(async (req, res, next) => {
  const { userSession, user } = req

  if (userSession.id !== user.id) {
    return next(new AppError('you are not authorized', 403))
  }

  next()
})

const userExists = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const user = await User.findOne({
    where: { id, status: 'active' },
    attributes: { exclude: ['password'] }
  })

  if (!user) {
    return next(new AppError('User does not exist with given Id', 404))
  }

  req.user = user
  next()
})

module.exports = {
  userExists,
  protectToken,
  protectAccountOwner
}
