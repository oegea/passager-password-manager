/**
 * Sequence of HTTP requests that exercises the whole documents service API the
 * way every version of the Passager frontend uses it, plus the relevant failure
 * and abuse cases.
 *
 * `golden.json` holds the responses that the original service
 * gave to this exact sequence. The service must keep answering the same.
 */

export const ALICE = 'alice@example.com'
export const BOB = 'bob@example.com'
export const CAROL = 'carol@example.com'

const UNKNOWN_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

const userDocument = (email, changes = {}) => ({
  email,
  displayName: email,
  photoURL: '',
  initialized: false,
  privateKey: '',
  ...changes
})

const passwordDocument = (owner, changes = {}) => ({
  name: 'My bank',
  owner,
  password: 'ZW5jcnlwdGVkLXBhc3N3b3Jk',
  url: 'https://bank.example.com',
  username: 'ZW5jcnlwdGVkLXVzZXJuYW1l',
  ...changes
})

/**
 * A step is { name, method, path, as, body, rawBody, headers, authorization, save, hardening }.
 *  - `body` is sent as JSON (it can be a function of the context). `rawBody` is sent untouched.
 *  - `path` can be a function of the context, to use identifiers of previous responses.
 *  - `as` selects whose session token is sent. `authorization` sends a raw header instead.
 *  - `save` stores values of the response in the context.
 *  - `hardening` marks requests whose answer intentionally differs from the original service.
 */
const step = (name, method, path, as, body, options = {}) => ({ name, method, path, as, body, ...options })

export const steps = [
  // #region Service discovery, CORS and routing
  step('services url', 'GET', '/services-url'),
  step('services url with HEAD', 'HEAD', '/services-url'),
  step('services url ignoring case, trailing slash and query', 'GET', '/SERVICES-URL/?foo=bar'),
  step('preflight with requested headers', 'OPTIONS', '/documents/users/find', null, undefined, {
    headers: {
      Origin: 'https://cloud.passager.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type'
    }
  }),
  step('preflight without requested headers', 'OPTIONS', '/documents/users'),
  step('preflight of an unknown route', 'OPTIONS', '/unknown'),
  step('unknown route', 'GET', '/unknown'),
  step('unknown route with special characters', 'GET', '/unknown/<b>"x"</b>?a=1'),
  step('root', 'POST', '/', ALICE, {}),
  step('unsupported method', 'PUT', `/documents/users/${UNKNOWN_ID}`, ALICE, {}),
  step('documents without collection', 'GET', '/documents', ALICE),
  step('collection without id', 'GET', '/documents/users', ALICE),
  step('too many segments', 'GET', `/documents/a/${UNKNOWN_ID}/b/${UNKNOWN_ID}/c`, ALICE),
  step('param that cannot be decoded', 'GET', '/documents/users/%E0%A4%A', ALICE),
  // #endregion

  // #region Body parsing
  step('malformed json', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: '{"email": ', headers: JSON_HEADERS }),
  step('json string instead of object', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: '"hello"', headers: JSON_HEADERS }),
  step('json number instead of object', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: '123', headers: JSON_HEADERS }),
  step('json null instead of object', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: 'null', headers: JSON_HEADERS }),
  step('empty json body', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: '', headers: JSON_HEADERS }),
  step('whitespace json body', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: '   ', headers: JSON_HEADERS }),
  step('body without content type is ignored', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: JSON.stringify({ email: ALICE }) }),
  step('text body is ignored', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: JSON.stringify({ email: ALICE }), headers: { 'Content-Type': 'text/plain' } }),
  step('json with charset parameter', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: JSON.stringify({ email: ALICE }), headers: { 'Content-Type': 'application/json; charset=utf-8' } }),
  step('json with upper case content type', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: JSON.stringify({ email: ALICE }), headers: { 'Content-Type': 'Application/JSON' } }),
  step('json with unsupported charset', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: JSON.stringify({ email: ALICE }), headers: { 'Content-Type': 'application/json; charset=iso-8859-1' } }),
  step('json with unsupported content encoding', 'POST', '/documents/users/find', ALICE, undefined, { rawBody: JSON.stringify({ email: ALICE }), headers: { ...JSON_HEADERS, 'Content-Encoding': 'br' } }),
  step('body over 100kb', 'POST', '/documents/users/find', ALICE, { email: ALICE, padding: 'x'.repeat(100 * 1024) }),
  step('body just under 100kb', 'POST', '/documents/users/find', ALICE, { email: ALICE, padding: 'x'.repeat(99 * 1024) }),
  step('array body', 'POST', '/documents/users/find', ALICE, []),
  // #endregion

  // #region Sessions
  step('no token', 'POST', '/documents/users/find', null, { email: ALICE }),
  step('garbage token', 'POST', '/documents/users/find', 'garbage', { email: ALICE }),
  step('expired token', 'POST', '/documents/users/find', 'expired', { email: ALICE }),
  step('token signed with another secret', 'POST', '/documents/users/find', 'wrongSecret', { email: ALICE }),
  step('unsigned token (alg none)', 'POST', '/documents/users/find', 'unsigned', { email: ALICE }),
  step('token with tampered payload', 'POST', '/documents/users/find', 'tampered', { email: ALICE }),
  step('token without bearer prefix', 'POST', '/documents/users/find', null, { email: ALICE }, { authorization: (tokens) => tokens[ALICE] }),
  step('token with any scheme', 'POST', '/documents/users/find', null, { email: ALICE }, { authorization: (tokens) => `Token ${tokens[ALICE]}` }),
  step('token issued by the original service', 'POST', '/documents/users/find', 'legacy', { email: ALICE }),
  step('HS512 token issued with jsonwebtoken', 'POST', '/documents/users/find', 'legacyHS512', { email: ALICE }),
  step('expired token issued by the original service', 'POST', '/documents/users/find', 'legacyExpired', { email: ALICE }),
  // #endregion

  // #region Users
  step('alice: find her user before it exists', 'POST', '/documents/users/find', ALICE, { email: ALICE }),
  step('alice: cannot create a user for somebody else', 'POST', '/documents/users', ALICE, userDocument(BOB)),
  step('alice: cannot create a user with missing fields', 'POST', '/documents/users', ALICE, { email: ALICE, displayName: ALICE }),
  step('alice: cannot create a user with extra fields', 'POST', '/documents/users', ALICE, userDocument(ALICE, { privateKeyVersion: 2 })),
  step('alice: cannot create a user with an id', 'POST', '/documents/users', ALICE, userDocument(ALICE, { id: UNKNOWN_ID })),
  step('alice: cannot create a user with internal fields', 'POST', '/documents/users', ALICE, userDocument(ALICE, { _passwords: [] })),
  step('alice: create her user', 'POST', '/documents/users', ALICE, userDocument(ALICE), {
    save: (message, context) => { context.aliceUserId = message.id }
  }),
  step('alice: cannot create her user twice', 'POST', '/documents/users', ALICE, userDocument(ALICE)),
  step('alice: find her user', 'POST', '/documents/users/find', ALICE, { email: ALICE }),
  step('alice: cannot find other users', 'POST', '/documents/users/find', ALICE, { email: BOB }),
  step('alice: cannot list users', 'POST', '/documents/users/find', ALICE, {}),
  step('alice: get her user', 'GET', (context) => `/documents/users/${context.aliceUserId}`, ALICE),
  step('alice: get her user with HEAD', 'HEAD', (context) => `/documents/users/${context.aliceUserId}`, ALICE),
  step('alice: get her user ignoring case and trailing slash', 'GET', (context) => `/Documents/users/${context.aliceUserId}/`, ALICE),
  step('alice: collection names are case sensitive', 'GET', (context) => `/documents/Users/${context.aliceUserId}`, ALICE),
  step('bob: cannot get the user of alice', 'GET', (context) => `/documents/users/${context.aliceUserId}`, BOB),
  step('anonymous: cannot get the user of alice', 'GET', (context) => `/documents/users/${context.aliceUserId}`),
  step('alice: get a user with an invalid id', 'GET', '/documents/users/not-an-id', ALICE),
  step('alice: get a user with a 12 characters id', 'GET', '/documents/users/abcdefghijkl', ALICE),
  step('alice: get a user that does not exist', 'GET', `/documents/users/${UNKNOWN_ID}`, ALICE),
  step('alice: set her master password', 'PATCH', (context) => `/documents/users/${context.aliceUserId}`, ALICE,
    userDocument(ALICE, { initialized: true, privateKey: 'c2FsdC1pdi1lbmNyeXB0ZWQtcHJpdmF0ZS1rZXk=' })),
  step('alice: store her private key in a newer format', 'PATCH', (context) => `/documents/users/${context.aliceUserId}`, ALICE,
    userDocument(ALICE, { initialized: true, privateKey: 'v2.600000.c2FsdC1pdi1lbmNyeXB0ZWQtcHJpdmF0ZS1rZXk=' })),
  step('alice: cannot update her user partially', 'PATCH', (context) => `/documents/users/${context.aliceUserId}`, ALICE, { privateKey: 'x' }),
  step('alice: cannot update her user with extra fields', 'PATCH', (context) => `/documents/users/${context.aliceUserId}`, ALICE,
    userDocument(ALICE, { privateKeyVersion: 2 })),
  step('alice: cannot change the email of her user', 'PATCH', (context) => `/documents/users/${context.aliceUserId}`, ALICE, userDocument(BOB)),
  step('alice: cannot update her user with an empty document', 'PATCH', (context) => `/documents/users/${context.aliceUserId}`, ALICE, {}),
  step('bob: cannot update the user of alice', 'PATCH', (context) => `/documents/users/${context.aliceUserId}`, BOB, userDocument(BOB)),
  step('alice: cannot update a user that does not exist', 'PATCH', `/documents/users/${UNKNOWN_ID}`, ALICE, userDocument(ALICE)),
  step('alice: cannot delete her user', 'DELETE', (context) => `/documents/users/${context.aliceUserId}`, ALICE),
  step('alice: get her user after the updates', 'GET', (context) => `/documents/users/${context.aliceUserId}`, ALICE),
  step('bob: create his user', 'POST', '/documents/users', BOB, userDocument(BOB), {
    save: (message, context) => { context.bobUserId = message.id }
  }),
  step('carol: create her user', 'POST', '/documents/users', CAROL, userDocument(CAROL)),
  // #endregion

  // #region User sharing settings (public keys)
  step('alice: find her sharing settings before they exist', 'POST', '/documents/userSharingSettings/find', ALICE, { email: ALICE }),
  step('alice: cannot create sharing settings for somebody else', 'POST', '/documents/userSharingSettings', ALICE, { publicKey: 'PUBLIC-KEY', email: BOB }),
  step('alice: cannot create sharing settings with extra fields', 'POST', '/documents/userSharingSettings', ALICE, { publicKey: 'PUBLIC-KEY', email: ALICE, uid: ALICE }),
  step('alice: cannot create sharing settings with missing fields', 'POST', '/documents/userSharingSettings', ALICE, { email: ALICE }),
  step('alice: create her sharing settings', 'POST', '/documents/userSharingSettings', ALICE, { publicKey: 'ALICE-PUBLIC-KEY', email: ALICE }, {
    save: (message, context) => { context.aliceSettingsId = message.id }
  }),
  step('alice: cannot create her sharing settings twice', 'POST', '/documents/userSharingSettings', ALICE, { publicKey: 'ALICE-PUBLIC-KEY', email: ALICE }),
  step('alice: update her public key', 'PATCH', (context) => `/documents/userSharingSettings/${context.aliceSettingsId}`, ALICE, { publicKey: 'ALICE-PUBLIC-KEY-2', email: ALICE }),
  step('alice: cannot update her sharing settings partially', 'PATCH', (context) => `/documents/userSharingSettings/${context.aliceSettingsId}`, ALICE, { publicKey: 'x' }),
  step('bob: cannot update the public key of alice', 'PATCH', (context) => `/documents/userSharingSettings/${context.aliceSettingsId}`, BOB, { publicKey: 'EVIL', email: BOB }),
  step('bob: can find the public key of alice', 'POST', '/documents/userSharingSettings/find', BOB, { email: ALICE }),
  step('bob: can get the sharing settings of alice', 'GET', (context) => `/documents/userSharingSettings/${context.aliceSettingsId}`, BOB),
  step('bob: cannot list sharing settings', 'POST', '/documents/userSharingSettings/find', BOB, {}),
  step('bob: cannot use operators to list sharing settings', 'POST', '/documents/userSharingSettings/find', BOB, { email: { $ne: null } }),
  step('anonymous: cannot find sharing settings', 'POST', '/documents/userSharingSettings/find', null, { email: ALICE }),
  step('alice: cannot delete her sharing settings', 'DELETE', (context) => `/documents/userSharingSettings/${context.aliceSettingsId}`, ALICE),
  step('bob: create his sharing settings', 'POST', '/documents/userSharingSettings', BOB, { publicKey: 'BOB-PUBLIC-KEY', email: BOB }, {
    save: (message, context) => { context.bobSettingsId = message.id }
  }),
  step('carol: create her sharing settings', 'POST', '/documents/userSharingSettings', CAROL, { publicKey: 'CAROL-PUBLIC-KEY', email: CAROL }, {
    save: (message, context) => { context.carolSettingsId = message.id }
  }),
  step('alice: find the settings of a user that does not exist', 'POST', '/documents/userSharingSettings/find', ALICE, { email: 'nobody@example.com' }),
  // #endregion

  // #region Folders
  step('alice: find her folders before they exist', 'POST', '/documents/folders/find', ALICE, { owner: ALICE }),
  step('alice: cannot create a folder for somebody else', 'POST', '/documents/folders', ALICE, { name: 'Work', key: 'KEY', owner: BOB, sharedWith: [] }),
  step('alice: cannot create a folder with missing fields', 'POST', '/documents/folders', ALICE, { name: 'Work', owner: ALICE }),
  step('alice: cannot create a folder with extra fields', 'POST', '/documents/folders', ALICE, { name: 'Work', key: 'KEY', owner: ALICE, sharedWith: [], encryptionVersion: 2 }),
  step('alice: cannot create a folder without name', 'POST', '/documents/folders', ALICE, { name: '', key: 'KEY', owner: ALICE, sharedWith: [] }),
  step('alice: cannot create a folder with a long name', 'POST', '/documents/folders', ALICE, { name: 'x'.repeat(51), key: 'KEY', owner: ALICE, sharedWith: [] }),
  step('alice: create a folder', 'POST', '/documents/folders', ALICE, { name: 'Work', key: 'ALICE-FOLDER-KEY', owner: ALICE, sharedWith: [] }, {
    save: (message, context) => { context.folderId = message.id }
  }),
  step('alice: create a second folder', 'POST', '/documents/folders', ALICE, { name: 'x'.repeat(50), key: 'ALICE-FOLDER-KEY-2', owner: ALICE, sharedWith: [] }, {
    save: (message, context) => { context.secondFolderId = message.id }
  }),
  step('alice: find her folders', 'POST', '/documents/folders/find', ALICE, { owner: ALICE }),
  step('alice: find her folders by name', 'POST', '/documents/folders/find', ALICE, { owner: ALICE, name: 'Work' }),
  step('alice: cannot find folders of bob', 'POST', '/documents/folders/find', ALICE, { owner: BOB }),
  step('alice: cannot list folders', 'POST', '/documents/folders/find', ALICE, {}),
  step('alice: get her folder', 'GET', (context) => `/documents/folders/${context.folderId}`, ALICE),
  step('bob: cannot get the folder of alice', 'GET', (context) => `/documents/folders/${context.folderId}`, BOB),
  step('alice: rename her folder', 'PATCH', (context) => `/documents/folders/${context.folderId}`, ALICE, { name: 'Work stuff' }),
  step('alice: cannot rename her folder with an empty name', 'PATCH', (context) => `/documents/folders/${context.folderId}`, ALICE, { name: '' }),
  step('alice: cannot give her folder away', 'PATCH', (context) => `/documents/folders/${context.folderId}`, ALICE, { owner: BOB }),
  step('alice: cannot add unknown fields to her folder', 'PATCH', (context) => `/documents/folders/${context.folderId}`, ALICE, { encryptionVersion: 2 }),
  step('bob: cannot rename the folder of alice', 'PATCH', (context) => `/documents/folders/${context.folderId}`, BOB, { name: 'Hacked' }),
  step('bob: cannot delete the folder of alice', 'DELETE', (context) => `/documents/folders/${context.folderId}`, BOB),
  step('alice: delete a folder that does not exist', 'DELETE', `/documents/folders/${UNKNOWN_ID}`, ALICE),
  step('alice: delete a folder with an invalid id', 'DELETE', '/documents/folders/not-an-id', ALICE),
  // #endregion

  // #region Passwords
  step('alice: list passwords of an empty folder', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, ALICE, {}),
  step('alice: cannot create a password with missing fields', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, ALICE, { name: 'My bank', owner: ALICE }),
  step('alice: cannot create a password with extra fields', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, ALICE, passwordDocument(ALICE, { notes: 'x' })),
  step('alice: cannot create a password owned by somebody else', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, ALICE, passwordDocument(BOB)),
  step('alice: cannot create a password without name', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, ALICE, passwordDocument(ALICE, { name: '' })),
  step('alice: cannot create a password with a long name', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, ALICE, passwordDocument(ALICE, { name: 'x'.repeat(51) })),
  step('alice: cannot create a password in a folder that does not exist', 'POST', `/documents/folders/${UNKNOWN_ID}/passwords`, ALICE, passwordDocument(ALICE)),
  step('alice: cannot create a password in a folder with an invalid id', 'POST', '/documents/folders/not-an-id/passwords', ALICE, passwordDocument(ALICE)),
  step('alice: create a password', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, ALICE, passwordDocument(ALICE), {
    save: (message, context) => { context.passwordId = message.id }
  }),
  step('alice: create a second password', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, ALICE, passwordDocument(ALICE, { name: 'My email', url: '' }), {
    save: (message, context) => { context.secondPasswordId = message.id }
  }),
  step('alice: create a password in her second folder', 'POST', (context) => `/documents/folders/${context.secondFolderId}/passwords`, ALICE, passwordDocument(ALICE, { name: 'Other' })),
  step('alice: list passwords', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, ALICE, {}),
  step('alice: list passwords without body', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, ALICE),
  step('alice: find passwords by name', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, ALICE, { name: 'My email' }),
  step('alice: find passwords with no match', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, ALICE, { name: 'Nothing', url: '' }),
  step('alice: get a password', 'GET', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, ALICE),
  step('alice: get a password that does not exist', 'GET', (context) => `/documents/folders/${context.folderId}/passwords/${UNKNOWN_ID}`, ALICE),
  step('alice: get a password with an invalid id', 'GET', (context) => `/documents/folders/${context.folderId}/passwords/not-an-id`, ALICE),
  step('alice: folders do not expose their passwords', 'GET', (context) => `/documents/folders/${context.folderId}`, ALICE),
  step('alice: unknown subcollections are not accessible', 'POST', (context) => `/documents/folders/${context.folderId}/secrets/find`, ALICE, {}),
  step('alice: edit a password', 'PATCH', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, ALICE,
    { name: 'My bank (new)', password: 'bmV3LXBhc3N3b3Jk', url: 'https://bank.example.com/login', username: 'bmV3LXVzZXJuYW1l' }),
  step('alice: get the edited password', 'GET', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, ALICE),
  step('alice: cannot edit a password with extra fields', 'PATCH', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, ALICE, { name: 'x', notes: 'y' }),
  step('alice: cannot change the owner of a password', 'PATCH', (context) => `/documents/folders/${context.folderId}/passwords/${context.secondPasswordId}`, ALICE, passwordDocument(BOB)),
  step('alice: cannot edit a password with an empty name', 'PATCH', (context) => `/documents/folders/${context.folderId}/passwords/${context.secondPasswordId}`, ALICE, { name: '' }),
  step('alice: editing a password that does not exist changes nothing', 'PATCH', (context) => `/documents/folders/${context.folderId}/passwords/${UNKNOWN_ID}`, ALICE, { name: 'x' }),
  step('bob: cannot list passwords of a folder not shared with him', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, BOB, {}),
  step('bob: cannot get a password of a folder not shared with him', 'GET', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, BOB),
  step('bob: cannot create a password in a folder not shared with him', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, BOB, passwordDocument(BOB)),
  step('bob: cannot edit a password of a folder not shared with him', 'PATCH', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, BOB, { name: 'Hacked' }),
  step('bob: cannot delete a password of a folder not shared with him', 'DELETE', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, BOB),
  step('anonymous: cannot list passwords', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, null, {}),
  // #endregion

  // #region Sharing a folder
  step('bob: list his shared folders before sharing', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/find`, BOB, {}),
  step('alice: check if her folder is already shared with bob', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/find`, ALICE, (context) => ({ folder: context.folderId })),
  step('alice: cannot list the shared folders of bob', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/find`, ALICE, {}),
  step('bob: cannot share with himself a folder of alice', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders`, BOB,
    (context) => ({ name: 'Work stuff', key: 'EVIL', shared: true, folder: context.folderId })),
  step('alice: cannot share a folder with herself', 'POST', (context) => `/documents/userSharingSettings/${context.aliceSettingsId}/sharedFolders`, ALICE,
    (context) => ({ name: 'Work stuff', key: 'KEY', shared: true, folder: context.folderId })),
  step('alice: cannot share a folder with missing fields', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders`, ALICE,
    (context) => ({ name: 'Work stuff', folder: context.folderId })),
  step('alice: cannot share a folder with extra fields', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders`, ALICE,
    (context) => ({ name: 'Work stuff', key: 'KEY', shared: true, folder: context.folderId, encryptionVersion: 2 })),
  step('alice: cannot share a folder that does not exist', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders`, ALICE,
    { name: 'Work stuff', key: 'KEY', shared: true, folder: UNKNOWN_ID }),
  step('alice: share her folder with bob', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders`, ALICE,
    (context) => ({ name: 'Work stuff', key: 'FOLDER-KEY-FOR-BOB', shared: true, folder: context.folderId }), {
      save: (message, context) => { context.sharedFolderId = message.id }
    }),
  step('alice: add bob to the shared list of her folder', 'PATCH', (context) => `/documents/folders/${context.folderId}`, ALICE, { sharedWith: [BOB] }),
  step('alice: cannot share her folder with bob twice', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders`, ALICE,
    (context) => ({ name: 'Work stuff', key: 'FOLDER-KEY-FOR-BOB', shared: true, folder: context.folderId })),
  step('alice: find her folders after sharing', 'POST', '/documents/folders/find', ALICE, { owner: ALICE }),
  step('bob: list his shared folders', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/find`, BOB, {}),
  step('bob: get his shared folder', 'GET', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, BOB),
  step('carol: cannot list the shared folders of bob', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/find`, CAROL, {}),
  step('carol: cannot get the shared folder of bob', 'GET', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, CAROL),
  step('alice: cannot get the shared folder of bob', 'GET', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, ALICE),
  step('bob: cannot modify his shared folder', 'PATCH', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, BOB, { name: 'x' }),
  step('alice: cannot modify the shared folder of bob', 'PATCH', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, ALICE, { name: 'x' }),
  step('bob: cannot remove himself from a shared folder', 'DELETE', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, BOB),
  step('bob: sharing settings do not expose shared folders', 'POST', '/documents/userSharingSettings/find', BOB, { email: BOB }),
  step('bob: list passwords of the shared folder', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, BOB, {}),
  step('bob: get a password of the shared folder', 'GET', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, BOB),
  step('bob: create a password in the shared folder', 'POST', (context) => `/documents/folders/${context.folderId}/passwords`, BOB, passwordDocument(BOB, { name: 'From bob' }), {
    save: (message, context) => { context.bobPasswordId = message.id }
  }),
  step('bob: edit a password of alice in the shared folder', 'PATCH', (context) => `/documents/folders/${context.folderId}/passwords/${context.secondPasswordId}`, BOB,
    { name: 'My email (bob)', password: 'Ym9i', url: '', username: 'Ym9i' }),
  step('alice: the password edited by bob lost its owner', 'GET', (context) => `/documents/folders/${context.folderId}/passwords/${context.secondPasswordId}`, ALICE),
  step('bob: delete a password of the shared folder', 'DELETE', (context) => `/documents/folders/${context.folderId}/passwords/${context.secondPasswordId}`, BOB),
  step('bob: cannot get the folder document', 'GET', (context) => `/documents/folders/${context.folderId}`, BOB),
  step('bob: cannot rename the shared folder', 'PATCH', (context) => `/documents/folders/${context.folderId}`, BOB, { name: 'Hacked' }),
  step('bob: cannot access the other folder of alice', 'POST', (context) => `/documents/folders/${context.secondFolderId}/passwords/find`, BOB, {}),
  step('carol: cannot list passwords of the folder shared with bob', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, CAROL, {}),
  step('alice: list passwords after bob changes', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, ALICE, {}),
  // #endregion

  // #region Unsharing a folder
  step('alice: find the shared folder record of bob', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/find`, ALICE, (context) => ({ folder: context.folderId })),
  step('carol: cannot unshare the folder of alice', 'DELETE', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, CAROL),
  step('alice: unshare her folder', 'DELETE', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, ALICE),
  step('alice: remove bob from the shared list of her folder', 'PATCH', (context) => `/documents/folders/${context.folderId}`, ALICE, { sharedWith: [] }),
  step('alice: unshare her folder again', 'DELETE', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/${context.sharedFolderId}`, ALICE),
  step('bob: list his shared folders after unsharing', 'POST', (context) => `/documents/userSharingSettings/${context.bobSettingsId}/sharedFolders/find`, BOB, {}),
  step('bob: cannot list passwords after unsharing', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, BOB, {}),
  step('bob: cannot delete his password after unsharing', 'DELETE', (context) => `/documents/folders/${context.folderId}/passwords/${context.bobPasswordId}`, BOB),
  // #endregion

  // #region Deleting
  step('alice: delete a password', 'DELETE', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, ALICE),
  step('alice: delete a password twice', 'DELETE', (context) => `/documents/folders/${context.folderId}/passwords/${context.passwordId}`, ALICE),
  step('alice: delete a password with an invalid id', 'DELETE', (context) => `/documents/folders/${context.folderId}/passwords/not-an-id`, ALICE),
  step('alice: list passwords after deleting', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, ALICE, {}),
  step('alice: delete her folder', 'DELETE', (context) => `/documents/folders/${context.folderId}`, ALICE),
  step('alice: delete her folder twice', 'DELETE', (context) => `/documents/folders/${context.folderId}`, ALICE),
  step('alice: cannot list passwords of a deleted folder', 'POST', (context) => `/documents/folders/${context.folderId}/passwords/find`, ALICE, {}),
  step('alice: find her folders after deleting', 'POST', '/documents/folders/find', ALICE, { owner: ALICE }),
  // #endregion

  // #region Collections without rules
  step('alice: cannot create documents in unknown collections', 'POST', '/documents/notes', ALICE, { text: 'hello' }),
  step('alice: cannot find documents in unknown collections', 'POST', '/documents/notes/find', ALICE, {}),
  step('alice: cannot read the login codes', 'POST', '/documents/emailVerification/find', ALICE, { email: ALICE }),
  step('alice: cannot get documents of unknown collections', 'GET', (context) => `/documents/notes/${context.aliceUserId}`, ALICE),
  // #endregion

  // #region Hardening: MongoDB operators are not accepted as search criteria
  step('alice: cannot inject operators in a search', 'POST', '/documents/users/find', ALICE, { email: ALICE, $where: 'return true' }, {
    hardening: 'Search criteria with MongoDB operators are rejected instead of being executed'
  }),
  step('alice: cannot use nested conditions in a search', 'POST', '/documents/folders/find', ALICE, { owner: ALICE, name: { $regex: '.*' } }, {
    hardening: 'Search criteria with non-primitive values are rejected instead of being executed'
  })
  // #endregion
]

/**
 * Runs the scenario against a running service.
 * @param {object} parameters
 * @param {(request: object) => Promise<object>} parameters.send Sends a request and resolves with the raw response
 * @param {(response: object) => object} parameters.normalize Turns a raw response into a comparable snapshot
 * @param {object} parameters.tokens Session tokens by user or kind
 * @returns {Promise<Array<{name: string, response: object, hardening?: string}>>}
 */
export const runScenario = async ({ send, normalize, tokens }) => {
  const context = {}
  const results = []

  for (const currentStep of steps) {
    const headers = { ...(currentStep.headers || {}) }
    if (currentStep.authorization) {
      headers.Authorization = currentStep.authorization(tokens)
    } else if (currentStep.as) {
      headers.Authorization = `Bearer ${tokens[currentStep.as]}`
    }

    let body = currentStep.rawBody
    if (body === undefined && currentStep.body !== undefined) {
      const value = typeof currentStep.body === 'function' ? currentStep.body(context) : currentStep.body
      body = JSON.stringify(value)
      headers['Content-Type'] = 'application/json'
    }

    const path = typeof currentStep.path === 'function' ? currentStep.path(context) : currentStep.path
    const rawResponse = await send({ method: currentStep.method, path, headers, body })

    if (currentStep.save) {
      currentStep.save(JSON.parse(rawResponse.body).message, context)
    }

    results.push({
      name: currentStep.name,
      response: normalize(rawResponse),
      ...(currentStep.hardening ? { hardening: currentStep.hardening } : {})
    })
  }

  return results
}
