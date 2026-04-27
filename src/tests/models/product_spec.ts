import { ProductStore, Product } from '../../models/product'

const store = new ProductStore()

describe('Product Model', () => {
  it('should have an index method', () => {
    expect(store.index).toBeDefined()
  })

  it('should have a show method', () => {
    expect(store.show).toBeDefined()
  })

  it('should have a create method', () => {
    expect(store.create).toBeDefined()
  })

  it('create method should add a product', async () => {
    const result = await store.create({
      name: 'Test Product',
      price: 100,
      category: 'Test Category'
    })
    expect(result.name).toEqual('Test Product')
    expect(Number(result.price)).toEqual(100)
  })

  it('index method should return a list of products', async () => {
    const result = await store.index()
    expect(result.length).toBeGreaterThan(0)
  })

  it('show method should return the correct product', async () => {
    const product = await store.create({
      name: 'Show Test Product',
      price: 200
    })
    const result = await store.show(product.id!)
    expect(result.name).toEqual('Show Test Product')
  })

  it('update method should update the product', async () => {
    const product = await store.create({
      name: 'Update Test Product',
      price: 300
    })
    const result = await store.update(product.id!, {
      name: 'Updated Product',
      price: 350
    })
    expect(result.name).toEqual('Updated Product')
    expect(Number(result.price)).toEqual(350)
  })

  it('delete method should remove the product', async () => {
    const product = await store.create({
      name: 'Delete Test Product',
      price: 400
    })
    await store.delete(product.id!)
    const result = await store.show(product.id!)
    expect(result).toBeUndefined()
  })
})
