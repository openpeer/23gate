import 'dotenv/config'
import path from 'path'
import Fastify from 'fastify'
import fastifyAutoload from '@fastify/autoload'
import { sequelize } from './models/index.mjs'
import formDataPlugin from '@fastify/formbody'

const isProduction = process.env.NODE_ENV === 'production'

const logger = isProduction
  ? undefined
  : {
      transport: {
        target: '@fastify/one-line-logger',
      },
    }

const fastify = Fastify({
  logger,
})

fastify.register(formDataPlugin)

fastify.decorate('sequelize', sequelize)

fastify.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/api/')) {
    try {
      // await verifySession()(request, reply)
    } catch (err) {
      // console.log('Supertokens VerifySession error:', err)
    }

    const userId = request?.session?.getUserId
      ? request.session.getUserId()
      : null
    if (!userId) {
      reply.status(401).send({ success: false, message: 'Unauthorized' })
      return
    }
  }
})

fastify.register(fastifyAutoload, {
  dir: path.resolve('.', 'routes'),
  dirNameRoutePrefix: true,
  autoHooks: true,
  cascadeHooks: true,
})

fastify.setErrorHandler(async (error, request, reply) => {
  console.error('Caught error:')
  console.error(error)
  // FIXME: catch sequelize errors here? Or we don't care?

  if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    reply.status(401)

    if (request.url.startsWith('/api/')) {
      reply.send({ success: false, message: 'Unauthorized' })
    } else {
      reply.send('authorization failed')
    }

    return
  }

  if (error.validation) {
    reply.status(422)

    if (request.url.startsWith('/api/')) {
      reply.send({ success: false, message: 'Validation error' })
    } else {
      reply.send('validation failed')
    }

    return
  }

  reply.status(500)

  if (request.url.startsWith('/api/')) {
    reply.send({ success: false, message: 'Internal server error' })
  } else {
    reply.send('Internal server error')
  }
})

fastify.listen(
  {
    port: process.env.LISTEN_PORT,
    host: process.env.LISTEN_HOST,
  },
  (err, address) => {
    if (err) {
      console.log(err)
      process.exit(1)
    }

    console.log(`server listening on ${address}`)

    if (process.send) {
      process.send('ready')
    }
  }
)
