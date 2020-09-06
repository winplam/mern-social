import expressJwt from 'express-jwt'
import jwt from 'jsonwebtoken'
import config from './../../config/config'
import User from '../models/user.model'

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth',
  algorithms: ['HS256']
})

const signin = async (req, res) => {
  try {
    let user = await User.findOne({
      'email': req.body.email,
    })

    if (!user) {
      return res.status('401').json({
        error: 'User not found',
      })
    }

    if (!user.authenticate(req.body.password)) {
      return res.status('401').send({
        error: 'Email and password don\'t match.',
      })
    }

    const token = jwt.sign({
      _id: user._id,
    }, config.jwtSecret)
    // }, config.jwtSecret, { expiresIn: '1800s' })

    // res.cookie('t', token, {
    //   expire: new Date() + 9999,
    // })

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    })

  } catch (err) {
    return res.status('401').json({
      error: 'Could not sign in',
    })
  }
}

const hasAuthorization = (req, res, next) => {
  // console.log(`---------- req.auth ${JSON.stringify(req.auth)}`)
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
    return res.status('403').json({ error: 'User is not authorized', })
  }
  next()
}

const signout = (req, res) => {
  res.clearCookie('t')
  return res.status('200').json({ message: 'signed out', })
}

export default {
  requireSignin,
  signin,
  hasAuthorization,
  signout,
}
