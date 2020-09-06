import supertest from 'supertest'
import app from '../express'
import mongoDB from '../../config/mongoTestConnection'
import passwordGenerator from '../../server/helpers/randomPasswordGenerator'

beforeAll(() => {
  mongoDB.connect()
})

afterAll(async (done) => {
  await mongoDB.disconnect(done)
})

describe('Checking the standalone backend', () => {
  const users = [
    {
      name: 'Jane Smith',
      email: 'jane@smith.info',
      password: passwordGenerator.generateRandomPassword(8, 16),
    },
    {
      name: 'John Smith',
      email: 'john@smith.info',
      password: passwordGenerator.generateRandomPassword(8, 16),
    },
  ]
  const user0update = {
    name: 'Jane2 Smith2',
    email: 'jane2@smith2.info',
  }
  test('GET:/ - HTML from template.js', (done) => {
    supertest(app)
      .get('/')
      .then((res) => {
        expect(res.type).toBe('text/html')
        expect(res.statusCode).toEqual(200)
        expect(res.toJSON().text).toMatchInlineSnapshot(`
          "<!doctype html>
          <html lang=\\"en\\">
          <head>
              <meta charset=\\"utf-8\\">
              <meta
                      name=\\"viewport\\"
                      content=\\"minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no\\"
              >
              <title>MERN Social</title>
              <link rel=\\"stylesheet\\" href=\\"https://fonts.googleapis.com/css?family=Roboto:100,300,400\\">
              <link rel=\\"stylesheet\\" href=\\"https://fonts.googleapis.com/icon?family=Material+Icons\\">
              <style>
                  a {
                      text-decoration: none
                  }
              </style>
          </head>
          <body style=\\"margin:0\\">
          Mern social template.js 0
          <div id=\\"root\\"><h1>Markup from express.js 0</h1></div>
          <style id=\\"jss-server-side\\">body {background-color: #ffffff;}</style>
          <script type=\\"text/javascript\\" src=\\"/dist/bundle.js\\"></script>
          </body>
          </html>"
        `)
        done()
      })
  })
  test('GET:/ - Checking for various middleware', (done) => {
    supertest(app)
      .get('/')
      .then((res) => {
        expect(res.type).toBe('text/html')
        expect(res.statusCode).toEqual(200)
        // console.log(res.headers)
        // check for compression middleware
        expect(res.headers['vary']).toBe('Accept-Encoding')
        // check for cors middleware
        expect(res.headers['access-control-allow-origin']).toBe('*')
        // check for helmet middleware
        expect(res.headers['x-powered-by']).toBeUndefined()
        expect(res.headers['content-security-policy']).toBeDefined()
        expect(res.headers['x-xss-protection']).toBe('0')
        done()
      })
  })
  test.each(users)('POST:/api/users - Creating new users', (user) => {
    return supertest(app)
      .post('/api/users')
      .send({
        name: user.name,
        email: user.email,
        password: user.password,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(200)
        expect(res.body).toStrictEqual({ message: 'Successfully signed up!' })
      })
  })
  test('POST:/api/users - Attempting to create a duplicate user', (done) => {
    supertest(app)
      .post('/api/users')
      .send({
        name: users[0].name,
        email: users[0].email,
        password: users[0].password,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body).toStrictEqual({ error: 'E already exists' })
        done()
      })
  })
  test('POST:/api/users - Attempting to create a user with password too short', (done) => {
    supertest(app)
      .post('/api/users')
      .send({
        name: 'Mr. Password Too Short',
        email: 'mr-password@too-short.com',
        password: 'short',
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body).toStrictEqual({
          error: 'Password must be at least 6 characters.',
        })
        done()
      })
  })
  test('POST:/api/users - Attempting to create without password', (done) => {
    supertest(app)
      .post('/api/users')
      .send({
        name: 'Mr. Missing Password',
        email: 'mr-missing@password.com',
        password: '',
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body).toStrictEqual({ error: 'Password hash is required' })
        done()
      })
  })
  test('GET:/api/users - Fetching the user list', () => {
    return supertest(app)
      .get('/api/users')
      .then((res) => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.length).toEqual(users.length)
        res.body.forEach((user, index) => {
          expect(user._id.length).toEqual(24)
          expect(user.name).toMatch(user.name)
          expect(user.email).toMatch(user.email)
          expect(user.created.length).toEqual(24)
          users[index].id = user._id
          users[index].created = user.created
        })
      })
  })
  test('GET:/api/users/:id - Trying to fetch a non-existing single user', (done) => {
    supertest(app)
      .get('/api/users/id')
      .then((res) => {
        expect(res.statusCode).toEqual(400)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body).toStrictEqual({ error: 'Could not retrieve user' })
        done()
      })
  })
  test('GET:/api/users/:id - Trying to fetch an existing single user', (done) => {
    supertest(app)
      .get(`/api/users/${users[0].id}`)
      .then((res) => {
        expect(res.statusCode).toEqual(401)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body).toStrictEqual({
          error: 'UnauthorizedError: No authorization token was found',
        })
        done()
      })
  })
  test('PUT:/api/users/:id - Attempting to update user without signing in first', (done) => {
    supertest(app)
      .put(`/api/users/${users[0].id}`)
      .send({
        name: 'Not Signed In',
        email: 'not_signed_in@email.com',
        password: passwordGenerator.generateRandomPassword(8, 16),
      })
      .then((res) => {
        expect(res.statusCode).toEqual(401)
        expect(res.type).toBe('application/json')
        expect(res.body).toStrictEqual({
          error: 'UnauthorizedError: No authorization token was found',
        })
        done()
      })
  })
  test('POST:/api/signin - Attempting to signing in - User not found', (done) => {
    supertest(app)
      .post('/auth/signin')
      .send({
        email: 'user_not_found@mymail.com',
        password: 'user_password_not_found',
      })
      .then((res) => {
        expect(res.statusCode).toEqual(401)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body).toStrictEqual({ error: 'User not found' })
        done()
      })
  })
  test('POST:/api/signin - Attempting to signing in - Wrong password', (done) => {
    supertest(app)
      .post('/auth/signin')
      .send({
        email: users[0].email,
        password: 'wrong_password',
      })
      .then((res) => {
        expect(res.statusCode).toEqual(401)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body).toStrictEqual({
          error: 'Email and password don\'t match.',
        })
        done()
      })
  })
  test('POST:/api/signin - Signing in successfully', (done) => {
    supertest(app)
      .post('/auth/signin')
      .send({
        email: users[0].email,
        password: users[0].password,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(200)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body.token.length).toEqual(149)
        expect(res.body.user.name).toMatch(users[0].name)
        expect(res.body.user.email).toMatch(users[0].email)
        users[0].id = res.body.user._id
        users[0].token = res.body.token
        done()
      })
  })
  test('GET:/api/users/:id - Fetching a single user successfully', () => {
    return supertest(app)
      .get(`/api/users/${users[0].id}`)
      .set('Authorization', `Bearer ${users[0].token}`)
      .then((res) => {
        expect(res.statusCode).toEqual(200)
        expect(res.body.name).toMatch(users[0].name)
        expect(res.body.email).toMatch(users[0].email)
        expect(res.body.created).toMatch(users[0].created)
      })
  })
  test('PUT:/api/users/:id - Attempt to update non-existing user', (done) => {
    supertest(app)
      .put('/api/users/non-existing-user')
      .set('Authorization', `Bearer ${users[0].token}`)
      .send({
        name: 'Different User',
        email: 'different_user@email.com',
        password: passwordGenerator.generateRandomPassword(8, 16),
      })
      .then((res) => {
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.statusCode).toEqual(400)
        expect(res.body).toStrictEqual({ error: 'Could not retrieve user' })
        done()
      })
  })
  test('PUT:/api/users/:id - Attempt to update somebody else`s user profile', (done) => {
    supertest(app)
      .put(`/api/users/${users[1].id}`)
      .set('Authorization', `Bearer ${users[0].token}`)
      .send({
        name: 'Different User',
        email: 'different_user@email.com',
        password: passwordGenerator.generateRandomPassword(8, 16),
      })
      .then((res) => {
        expect(res.statusCode).toEqual(403)
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.body).toStrictEqual({ error: 'User is not authorized' })
        done()
      })
  })
  test('PUT:/api/users/:id - Successfully updating your own user profile', () => {
    return supertest(app)
      .put(`/api/users/${users[0].id}`)
      .set('Authorization', `Bearer ${users[0].token}`)
      .send({
        name: user0update.name,
        email: user0update.email,
        password: passwordGenerator.generateRandomPassword(8, 16),
      })
      .then((res) => {
        expect(res.statusCode).toEqual(200)
        expect(res.body._id).toMatch(users[0].id)
        expect(res.body.name).toMatch(user0update.name)
        expect(res.body.email).toMatch(user0update.email)
        expect(res.body.created).toMatch(users[0].created)
        expect(res.body.updated.length).toEqual(24)
        users[0].name = user0update.name
        users[0].email = user0update.email
        users[0].updated = res.body.updated
      })
  })
  test('DELETE:/api/users/:id - Attempting to delete user without token', (done) => {
    supertest(app)
      .delete(`/api/users/${users[0].id}`)
      .then((res) => {
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.statusCode).toEqual(401)
        expect(res.body).toStrictEqual({
          error: 'UnauthorizedError: No authorization token was found',
        })
        done()
      })
  })
  test('DELETE:/api/users/:id - Attempting to deleting a non-existing user', (done) => {
    supertest(app)
      .delete('/api/users/non-existing-user')
      .set('Authorization', `Bearer ${users[0].token}`)
      .then((res) => {
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.statusCode).toEqual(400)
        expect(res.body).toStrictEqual({ error: 'Could not retrieve user' })
        done()
      })
  })
  test('DELETE:/api/users/:id - Attempting to delete somebody else`s account', (done) => {
    supertest(app)
      .delete(`/api/users/${users[1].id}`)
      .set('Authorization', `Bearer ${users[0].token}`)
      .then((res) => {
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.statusCode).toEqual(403)
        expect(res.body).toStrictEqual({ error: 'User is not authorized' })
        done()
      })
  })
  test('DELETE:/api/users/:id - Successfully deleting own profile', () => {
    return supertest(app)
      .delete(`/api/users/${users[0].id}`)
      .set('Authorization', `Bearer ${users[0].token}`)
      .then((res) => {
        expect(res.statusCode).toEqual(200)
        expect(res.body._id).toMatch(users[0].id)
        expect(res.body.name).toMatch(users[0].name)
        expect(res.body.email).toMatch(users[0].email)
        expect(res.body.created).toMatch(users[0].created)
        expect(res.body.updated).toMatch(users[0].updated)
      })
  })
  test('GET:/auth/signout - Signing out', (done) => {
    supertest(app)
      .get('/auth/signout')
      .then((res) => {
        expect(res.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        )
        expect(res.statusCode).toEqual(200)
        expect(res.body).toStrictEqual({ message: 'signed out' })
        done()
      })
  })
})
