const fs = require('fs')
const path = require('path')
const dbPath = path.join(__dirname, 'database.json')

module.exports.products = {}

module.exports.products.getProducts = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '[]')
    return []
  }

  let json = fs.readFileSync(dbPath).toString() || '[]'
  return JSON.parse(json)
}

module.exports.products.saveProducts = (products) => {
  let json = JSON.stringify(products)
  fs.writeFileSync(dbPath, json)
}

module.exports.products.add = (product) => {
  let products = this.products.getProducts()

  product.id = products.length + 1
  products.push(product)
  this.products.saveProducts(products)
}

module.exports.products.findByName = (name) => {
  return this.products.getProducts().filter(p => p.name.toLowerCase().includes(name))
}
