
require('dotenv').config()
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { Op } = require("sequelize");

const { Product } = require('../models/product.model')
const { ProductImg } = require('../models/productImg.model')

const { catchAsync } = require('../utils/catchAsync')
const { AppError } = require('../utils/appError')
const { storage } = require('../utils/firebase');

const createProduct = catchAsync(async (req, res, next) => {
  const { userShop } = req
  
  const {
    title,
    description,
    quantity,
    price,
    categoryId
  } = req.body
  
  const newProduct = await Product.create({
    title,
    description,
    quantity,
    price,
    shopId: userShop.id,
    categoryId
  })

  // Map through the files and upload them to firebase
  const productImgsPromises = req.files.map(async file => {
    // Create img ref
    const imgRef = ref(
      storage,
      `products/${newProduct.id}-${Date.now()}-${file.originalname}`
    );

    // Use uploadBytes
    const imgUploaded = await uploadBytes(imgRef, file.buffer);

    // Create a new ProductImg instance (ProductImg.create)
    return await ProductImg.create({
      productId: newProduct.id,
      imgUrl: imgUploaded.metadata.fullPath,
    });
  });

  // Resolve the pending promises
  await Promise.all(productImgsPromises);

  res.status(200).json({
    status: 'success',
    newProduct
  })
})

const getListProducts = catchAsync(async (req, res, next) => {
  const { category } = req.query
  const { search } = req.query
      
  const aditionalWhereClause =
    category
    ? {categoryId: category}
     : search
        ?{title: { [Op.iLike]: '%' + search + '%',}}
        : {}
  
  const productList = await Product.findAll({
    where: {
      status: 'active',
      ...aditionalWhereClause
    },
    include: [
      { model: ProductImg }
    ]
  })
  
  if (!productList) {
    return next(new AppError('not products available', 404))
  }

  // Get all product' imgs
  const productPromises = productList.map(async product => {
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

  res.status(200).json({
    products: productResolved,
  });

})

const getProductById = catchAsync(async (req, res, next) => {
  const { product } = req
  
  const prodImgsPromises = product.productImgs.map(async prodImg => {
      const imgRef = ref(storage, prodImg.imgUrl);
      const url = await getDownloadURL(imgRef);

      // Update postImgUrl prop
      prodImg.imgUrl = url;
      return prodImg;
    });

  const prodImgsResolved = await Promise.all(prodImgsPromises);
  product.productImgs = prodImgsResolved;

  res.status(200).json({
    product
  })
})

const updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req
  const { title, description, quantity, price } = req.body
  
  await product.update({ title, description, quantity, price })
  
  if (req.files) {
    // Map through the files and upload them to firebase
    const productImgsPromises = req.files.map(async (file, index) => {
      // Create img ref
      const imgRef = ref(
        storage,
        `products/${product.id}-${Date.now()}-${file.originalname}`
      );

      // Use uploadBytes
      const imgUploaded = await uploadBytes(imgRef, file.buffer);

      // Create a new ProductImg instance (ProductImg.create)
      
      return await product.productImgs[index].update({
        imgUrl: imgUploaded.metadata.fullPath,
      });
    });

    // Resolve the pending promises
    await Promise.all(productImgsPromises);
  }
  res.status(200).json({ status: 'success' })
})

const deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req

  await product.update({ status: 'deleted' })

  res.status(200).json({ status: 'success' })
})


module.exports = {
  createProduct,
  getListProducts,
  getProductById,
  updateProduct,
  deleteProduct
}