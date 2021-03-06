const bindFunctions = require('../../bindFunctions')
const UserModel = require('../../database/models/User')

const usersController = {
  _init (Users = UserModel) {
    bindFunctions(this)

    this.Users = Users
    return this
  },

  getCurrent (req, res, next) {
    const id = req.payload.id

    this.Users.findById(id).then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json(user.toJSON())
    }).catch(next)
  },

  putCurrent (req, res, next) {
    const id = req.payload.id

    this.Users.findById(id).then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const { email, projectsAppliedFor } = req.body.user

      if (typeof email !== 'undefined') {
        user.email = email
      }

      if (typeof projectsAppliedFor !== 'undefined') {
        user.projectsAppliedFor = projectsAppliedFor
      }

      user.save().then(() => {
        return res.status(200).send(user.toJSON())
      })
    }).catch(next)
  },

  getUsers (req, res) {
    return this.Users.find().exec((err, users) => {
      if (err) {
        return res.sendStatus(500)
      }

      return res.status(200).json(users.map(user => user.toJSON()))
    })
  },

  signup (req, res) {
    const newUser = new this.Users(req.body.user)

    return newUser.save((err, user) => {
      if (err) {
        return res.sendStatus(500)
      }

      res.setHeader('Content-Type', 'application/json')
      return res.status(200).json(user.toJSON())
    })
  },

  getUser (req, res) {
    const id = req.params.user

    this.Users.findById(id).exec((err, user) => {
      if (err) {
        return res.sendStatus(500)
      }

      if (!user) {
        return res.sendStatus(404)
      }

      return res.status(200).json(user.toJSON())
    })
  },

  putUser (req, res) {},

  getSalt (req, res) {
    const { email } = req.query
    this.Users.findOne({ email }).exec((err, user) => {
      if (err) {
        return res.status(500).json({ error: '500' })
      }

      if (!user) {
        return res.status(401).json({ error: '401' })
      }

      const { salt } = user
      return res.status(200).json({ salt })
    })
  },

  login (req, res) {
    const { email, hash } = req.body

    this.Users.findOne({ email }).exec((err, user) => {
      if (err) {
        return res.sendStatus(403)
      }

      if (!user) {
        res.statusMessage = 'Wrong email'
        return res.status(403).json({ error: 'Invalid email' })
      } else if (hash !== user.hash) {
        res.statusMessage = 'Wrong password'
        return res.status(403).json({ error: 'Invalid password' })
      }

      return res.status(200).json(user.toJSON())
    })
  },

  changePassword (req, res) {
    const {email, salt, hash} = req.body

    const query = {'email': email}
    this.Users.findOneAndUpdate(query, {$set: { salt, hash }}, {}, function (error, doc) {
      if (error) {
        return res.send(500, { error })
      } else if (!doc) {
        return res.send(404, { error: 'No user found. No password updated' })
      }
      return res.send(doc.toJSON())
    })
  }

}

module.exports = usersController
