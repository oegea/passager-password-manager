import { getPort, requireTokenSecret } from '../../shared/config.js'
import { createAuthenticationApp } from './app.js'
import { loadConfig } from './config.js'
import { sendEmail } from './emailSender.js'
import { getCollection } from './mongo.js'

requireTokenSecret()

loadConfig()

const port = getPort(process.env.AUTH_PORT, 3001)
const app = createAuthenticationApp({ getCollection, sendEmail })

await app.listen(port)
console.log(`Authentication service is running on port ${port}`)
