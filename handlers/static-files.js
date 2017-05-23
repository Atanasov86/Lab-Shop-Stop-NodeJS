const url = require('url')
const fs = require('fs')
const path = require('path')

function getContentType (url) {
  if (url.endsWith('.css')) {
    return 'text/css'
  } else if (url.endsWith('.ico')) {
    return 'image/x-icon'
  }
}

module.exports = (req, res) => {
  req.pathname = req.pathname || url.parse(req.url).pathname

  if (req.pathname.startsWith('/content/') && req.method === 'GET') {
    let filePath = path.normalize(path.join(__dirname, `..${req.pathname}`))

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, {
          'Content-Type': 'text/plain'
        })

        res.write('Resource not found!')
        res.end()
        return
      } else {
        res.writeHead('200', {
          'Content-Type': getContentType(req.pathname)
        })

        res.write(data)
        res.end()

        // TODO send data
      }
    })
  } else {
    return true
  }
}
