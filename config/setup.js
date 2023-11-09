/* eslint-env node */
const fs = require('fs')
const errorLog = error => console.log(error)

const envPath = './.env.local'
const context = `
# local development port
VITE_DEV_PORT=8080

# backend url
VITE_BACKEND_URL=http://127.0.0.1

`

const generateFile = async (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', err => {
      if (err) {
        errorLog(err.message)
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

if (!fs.existsSync(envPath)) {
  generateFile(envPath, context)
}
