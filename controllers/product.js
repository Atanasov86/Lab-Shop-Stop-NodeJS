const Product = require('../models/Product')
const Category = require('../models/Category')
const fs = require('fs')
const path = require('path')

module.exports.addGet = (req, res) => {
  Category.find().then((categories) => {
    res.render('products/add', {categories: categories})
  })
}

module.exports.addPost = (req, res) => {
  let productObj = req.body
  if (req.file) {
    productObj.image = '\\' + req.file.path
  }

  Product.create(productObj).then((product) => {
    Category.findById(product.category).then((category) => {
      category.products.push(product._id)
      category.save()
    })
    res.redirect('/')
  })
}

module.exports.editGet = (req, res) => {
  let id = req.params.id
  Product.findById(id)
    .then(product => {
      if (!product) {
        res.sendStatus(404)
        return
      }

      Category.find()
        .then((categories) => {
          res.render('products/edit', {
            product: product,
            categories: categories
          })
        })
    })
}

module.exports.editPost = (req, res) => {
  let id = req.params.id
  let editedProduct = req.body

  Product.findById(id)
    .then((product) => {
      if (!product) {
        res.redirect(`/?error=${encodeURIComponent('error=Product was not found')}`)
      }

      product.name = editedProduct.name
      product.description = editedProduct.description
      product.price = editedProduct.price

      if (req.file) {
        product.image = '\\' + req.file.path
      }

      // checked whether category is changed
      if (product.category.toString() !== editedProduct.category) {
        Category.findById(product.category)
          .then((currentCategory) => {
            Category.findById(editedProduct.category)
              .then((nextCategory) => {
                let index = currentCategory.products.indexOf(product._id)
                console.log(index)
                if (index >= 0) {
                  // remove old category reference from list of products
                  currentCategory.products.splice(index, 1)
                }

                currentCategory.save()

                // add new category reference to list of products
                nextCategory.products.push(product._id)
                nextCategory.save()

                product.category = editedProduct.category

                product.save()
                  .then(() => {
                    res.redirect('/?success=' + encodeURIComponent('Product was successfully edited!!!'))
                  })
              })
          })
      } else {
        product.save()
          .then(() => {
            res.redirect('/?success=' + encodeURIComponent('Product was successfully edited!!!'))
          })
      }
    })
}

module.exports.deleteGet = (req, res) => {
  let id = req.params.id

  Product.findById(id)
    .then((product) => {
      res.render('products/delete', {product: product})
    })
}

module.exports.deletePost = (req, res) => {
  let id = req.params.id

  Product.findByIdAndRemove(id, (err, product) => {
    if (err) {
      console.log(err)
      return
    }

    // delete product id from category products list
    Category.findById(product.category)
      .then((category) => {
        let index = category.products.indexOf(product._id)
        if (index >= 0) {
          category.products.splice(index, 1)
        }

        let imagePath = path.normalize(path.join(__dirname, `../${product.image}`))
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log(err)
            return
          }

          console.log(`successfully deleted ${product.image}`)
        })
        category.save()
          .then(() => {
            res.redirect('/?success=' + encodeURIComponent('Product was successfully removed!!!'))
          })
      })
  })
}

module.exports.buyGet = (req, res) => {
  let id = req.params.id
  Product.findById(id)
    .then((product) => {
      res.render('products/buy', {product: product})
    })
}

module.exports.buyPost = (req, res) => {
  let productId = req.params.id

  Product.findById(productId)
    .then(product => {
      if (!req.user) {
        res.render('user/login', {error: 'Before buy product you must login.'})
        return
      }

      if (product.buyer) {
        let error = `error=${encodeURIComponent('Product was already bought!')}`
        res.redirect(`/?${error}`)
        return
      }

      product.buyer = req.user._id
      product.save().then(() => {
        req.user.boughtProducts.push(productId)
        req.user.save().then(() => {
          res.redirect('/')
        })
      })
    })
}
