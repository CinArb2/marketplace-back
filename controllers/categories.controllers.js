const { catchAsync } = require('../utils/catchAsync')
const { AppError } = require('../utils/appError')

const { Category } = require('../models/category.model')

const createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body

  const newCategory = await Category.create({
    name,
  })

  res.status(200).json({
    status: 'success',
    newCategory
  })
})

const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({
    where: { status: 'active'}
  })

  res.status(200).json({
    categories
  })
});;

module.exports = {
  createCategory,
  getCategories
}