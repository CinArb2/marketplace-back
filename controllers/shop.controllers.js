require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const { User } = require('../models/user.model')
const { Shop } = require('../models/shop.model')
const { Product } = require('../models/product.model')
const { ProductImg } = require('../models/productImg.model')


const { catchAsync } = require('../utils/catchAsync')
const { AppError } = require('../utils/appError')
const { storage } = require('../utils/firebase');

const createShop = catchAsync(async (req, res, next) => {
  const { title, description } = req.body
  const { userSession } = req
  
  const shopUser = await Shop.findOne({
    where: { userId: userSession.id, status: 'active' }
  })
  
  if (shopUser) {
    return next(new AppError('You already have a shop active', 400))
  }

  const imgReflogo = ref(storage, `shop/logo/${Date.now()}-${req.files['logoImg'][0].originalname}`);
  const imgUploadedLogo = await uploadBytes(imgReflogo, req.files['logoImg'][0].buffer);

  const imgRefCover = ref(storage, `shop/cover/${Date.now()}-${req.files['coverImg'][0].originalname}`);
  const imgUploadedCover = await uploadBytes(imgRefCover, req.files['coverImg'][0].buffer);

  const newShop = await Shop.create(
    {
      title,
      description,
      userId: userSession.id,
      logoImg: imgUploadedLogo.metadata.fullPath,
      coverImg: imgUploadedCover.metadata.fullPath,
    })

  res.status(200).json({ newShop })
})

const getShops = catchAsync(async (req, res, next) => {
  const shops = await Shop.findAll({
    where: { status: 'active'}
  });

  const shopPromises = shops.map(async shop => {

    // Create firebase img ref and get the full path
    const imgRefLogo = ref(storage, shop.logoImg);
    const imgRefCover = ref(storage, shop.coverImg);

    const urlLogo = await getDownloadURL(imgRefLogo);
    const urlCover = await getDownloadURL(imgRefCover);

    shop.logoImg = urlLogo;
    shop.coverImg = urlCover;

    return shop;
  });

  const shopResolved = await Promise.all(shopPromises);

  res.status(200).json({
    shops: shopResolved,
    
  });
})

const getShopByID = catchAsync(async (req, res, next) => {
  const { shop } = req;

  // Get url from firebase
  const imgRefLogo = ref(storage, shop.logoImg);
  const imgRefCover = ref(storage, shop.coverImg);

  const urlLogo = await getDownloadURL(imgRefLogo);
  const urlCover = await getDownloadURL(imgRefCover);

  shop.logoImg = urlLogo;
  shop.coverImg = urlCover;

  res.status(200).json({
    shop,
  });
})

const getShopProducts = catchAsync(async (req, res, next) => {
  const { shop } = req
  
  const shopProducts = await Product.findAll({
    where: { shopId: shop.id, status: 'active' },
    include: [
      { model: ProductImg }
    ]
  })

  if (!shopProducts) {
    return next(new AppError('no products for this user', 400))
  }

  const productPromises = shopProducts.map(async product => {
    // Get imgs from firebase
    const prodImgsPromises = product.productImgs.map(async prodImg => {
      const imgRef = ref(storage, prodImg.imgUrl);
      const url = await getDownloadURL(imgRef);

      // Update postImgUrl prop
      prodImg.imgUrl = url;
      return prodImg;
    });

    // Resolve pending promises
    const prodImgsResolved = await Promise.all(prodImgsPromises);
    product.productImgs = prodImgsResolved;

    return product;
  });

  const productResolved = await Promise.all(productPromises);

  res.status(201).json({ shopProducts: productResolved })
})

const updateShop = catchAsync(async (req, res, next) => {
  const { shop } = req

  if (req.files['logoImg'] && req.files['coverImg']) {
    const imgReflogo = ref(storage, `shop/logo/${Date.now()}-${req.files['logoImg'][0].originalname}`);
    const imgUploadedLogo = await uploadBytes(imgReflogo, req.files['logoImg'][0].buffer);

    const imgRefCover = ref(storage, `shop/cover/${Date.now()}-${req.files['coverImg'][0].originalname}`);
    const imgUploadedCover = await uploadBytes(imgRefCover, req.files['coverImg'][0].buffer);

     await shop.update(
      {
         logoImg: imgUploadedLogo.metadata.fullPath,
          coverImg: imgUploadedCover.metadata.fullPath,
      })
  }else if(req.files['logoImg']){
    
    const imgReflogo = ref(storage, `shop/logo/${Date.now()}-${req.files['logoImg'][0].originalname}`);
    const imgUploadedLogo = await uploadBytes(imgReflogo, req.files['logoImg'][0].buffer);
  
    await shop.update(
      {
        logoImg: imgUploadedLogo.metadata.fullPath
      })
  } else if(req.files['coverImg']){
    const imgRefCover = ref(storage, `shop/cover/${Date.now()}-${req.files['coverImg'][0].originalname}`);
    const imgUploadedCover = await uploadBytes(imgRefCover, req.files['coverImg'][0].buffer);

    await shop.update(
    {
      coverImg: imgUploadedCover.metadata.fullPath,
    })
  } 

  const { title, description } = req.body

  await shop.update(
    {
      title,
      description
    })

  res.status(200).json({ status: 'success' })
})

const deleteShop = catchAsync(async (req, res, next) => {
  const { shop } = req

  await shop.update({ status: 'deleted' })

  res.status(200).json({ status: 'success' })
})

const getCurrentShop = catchAsync(async (req, res, next) => {
  const { userSession } = req
  const { user } = req.query
  let shop;
  
  if (user === 'me') {
    
    shop = await Shop.findOne({
      where: {
        userId: userSession.id,
        status: 'active'
      },
      include: {
        model: Product,
        where: { status: 'active' },
        include: [
          { model: ProductImg }
        ],
        required: false
      },
      required: false
    })
  }

  if (!shop) {
    return next(new AppError('User doesnt have a shop', 404))
  }

  // Get url from firebase
  const imgRefLogo = ref(storage, shop.logoImg);
  const imgRefCover = ref(storage, shop.coverImg);

  const urlLogo = await getDownloadURL(imgRefLogo);
  const urlCover = await getDownloadURL(imgRefCover);

  shop.logoImg = urlLogo;
  shop.coverImg = urlCover;


  // Get all product' imgs
  const productPromises = shop.products.map(async product => {
    // Get imgs from firebase
    const prodImgsPromises = product.productImgs.map(async prodImg => {
      const imgRef = ref(storage, prodImg.imgUrl);
      const url = await getDownloadURL(imgRef);

      // Update postImgUrl prop
      prodImg.imgUrl = url;
      return prodImg;
    });

    // Resolve pending promises
    const prodImgsResolved = await Promise.all(prodImgsPromises);
    product.productImgs = prodImgsResolved;

    return product;
  });

  const productResolved = await Promise.all(productPromises);

  shop.products = productResolved
  res.status(200).json({ shop })
 })

module.exports = {
  createShop,
  getShops,
  getShopByID,
  getShopProducts,
  updateShop,
  deleteShop,
  getCurrentShop
}