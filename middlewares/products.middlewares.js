require('dotenv').config()
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const { storage } = require('../utils/firebase');

const { Product } = require('../models/product.model')
const { Shop } = require('../models/shop.model')
const { ProductImg } = require('../models/productImg.model')


const { AppError } = require('../utils/appError')
const { catchAsync } = require('../utils/catchAsync')

const productExists = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const product = await Product.findOne({
    where: { id, status: 'active' },
    include: [
      { model: Shop },
      { model: ProductImg }
    ]
  })
  
  if (!product) {
    return next(new AppError('Product doesn\'t exist with given Id', 404))
  }

  // Get url from firebase
  const imgRefLogo = ref(storage, product.shop.logoImg);
  const imgRefCover = ref(storage, product.shop.coverImg);

  const urlLogo = await getDownloadURL(imgRefLogo);
  const urlCover = await getDownloadURL(imgRefCover);

  product.shop.logoImg = urlLogo;
  product.shop.coverImg = urlCover;
  
  req.product = product
  next()
})

const protectProductOwner = catchAsync(async (req, res, next) => {
  const { userSession, product } = req

  const userShop = await Shop.findOne({
    where: {
      userId: userSession.id,
      status: 'active'
    }
  })
  
  if (userShop.id !== product.shopId) {
    return next(new AppError('you are not authorized', 403))
  }

  next()
})

const userHasShop = catchAsync(async (req, res, next) => {
  const { userSession } = req

  const userShop = await Shop.findOne({
    where: { userId: userSession.id, status: 'active' }
  })

  if (!userShop) {
    return next(new AppError('create shop in order to add products to shop', 403))
  }

  req.userShop = userShop
  next()
})

module.exports = {
  productExists,
  protectProductOwner,
  userHasShop
}