import app from './server'

const address = '0.0.0.0:3000'

app.listen(3000, () => {
  console.log(`Server started on: ${address}`)
})
