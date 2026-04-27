import { UserStore, User } from '../../models/user'

const store = new UserStore()

describe('User Model', () => {
  it('should have an index method', () => {
    expect(store.index).toBeDefined()
  })

  it('should have a show method', () => {
    expect(store.show).toBeDefined()
  })

  it('should have a create method', () => {
    expect(store.create).toBeDefined()
  })

  it('create method should add a user and hash the password', async () => {
    const result = await store.create({
      first_name: 'Test',
      last_name: 'User',
      password: 'testpassword'
    })
    expect(result.first_name).toEqual('Test')
    // Result should not contain password
    expect((result as any).password).toBeUndefined()
  })

  it('authenticate method should return user with correct password', async () => {
    const result = await store.authenticate('Test', 'testpassword')
    expect(result).not.toBeNull()
    expect(result?.first_name).toEqual('Test')
  })

  it('authenticate method should return null with incorrect password', async () => {
    const result = await store.authenticate('Test', 'wrongpassword')
    expect(result).toBeNull()
  })
})
