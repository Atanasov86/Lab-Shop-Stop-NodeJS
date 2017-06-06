const homeHandler = require('./home')
const productHandler = require('./product')
const categoryHandler = require('./category')
const userHandler = require('./user')

module.exports = {
  home: homeHandler,
  user: userHandler,
  category: categoryHandler,
  product: productHandler
}
