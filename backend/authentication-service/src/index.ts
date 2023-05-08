import * as dotenv from 'dotenv'
import {loadConfig, startAuthenticationService} from '@useful-tools/docky-authentication-service/dist'

dotenv.config({ path: '../.env' })

loadConfig({
    commonAppName: process.env.COMMON_APP_NAME,
    commonOrganizationName: process.env.COMMON_ORGANIZATION_NAME,
    commonMongoDbConnectionString: process.env.COMMON_MONGODB_CONNECTION_STRING,
    commonTokenSecret: process.env.COMMON_TOKEN_SECRET,
    commonMongoDbDatabase: process.env.COMMON_MONGODB_DATABASE,
    authCollection: process.env.AUTH_COLLECTION,
    authPort: Number(process.env.AUTH_PORT),
    authSmtpHost: process.env.AUTH_SMTP_HOST,
    authSmtpPort: Number(process.env.AUTH_SMTP_PORT),
    authSmtpUser: process.env.AUTH_SMTP_USER,
    authSmtpPassword: process.env.AUTH_SMTP_PASSWORD,
    authSmtpSender: process.env.AUTH_SMTP_SENDER,
    authLimitAccessByEmail: Boolean(process.env.AUTH_LIMIT_ACCESS_BY_EMAIL),
    authAllowedDomains: process.env.AUTH_ALLOWED_DOMAINS,
    authAllowedEmails: process.env.AUTH_ALLOWED_EMAILS,
    docsPort: Number(process.env.DOCS_PORT)
})

startAuthenticationService()