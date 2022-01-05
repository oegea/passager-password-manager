# Passager Password Manager

Passager Password Manager is an open-source and easy-to-use password manager.

## Why?

You could be wondering why the world needs another password manager.

The answer is that I don't know if the world needs another password manager, but I used to need an open source one that could be easily installed and maintained, and I have never found one.

This is the reason to create `passager`. To bring to the world a password manager that is:

* Simple to use and maintain, both for users and sys admins.
* Secure by design.
* Usable by teams.

## Disclaimer

This is a personal project. I'm not responsible for the usage given to this software.
Please understand that I can't be responsible for any damage this software may cause due to any security issue. I've developed this with all my 💛, but you know, there are evil people outside, that are more experimented than me in security topics.

If you find any security issue or possible improvement, feel free to submit a PR and I would try to do my best to handle it.

## Technical decisions

To achieve simplicity, security and usability for teams, the following technical decisions have been adopted:

* Get inspiration, without just copying them, from services like Google Drive, or apps like Finder. A password manager should be as easy-to-use as a file explorer is.
* Use third-party services (firebase) for authentication and database, to reduce the risk of implementing a property login system or administrating a database system.
* Decouple the application as much as possible from firebase, to reduce efforts if a service provider change is needed.
* Handle encryption of data on the client's browser, using secure and trusted dependencies to implement the encryption algorithms.
* Ensure that team sharing features do not reduce software security.

## Most relevant dependencies

* `create-react-app`, and all dependencies included in the default template are used to build the project foundation and scaffolding.
* `styled-components`, is used to style components.
* `@mdi/js`, to require and render material design icons.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.