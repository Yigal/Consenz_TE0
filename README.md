Vue Firebase 

Add firebase settings in src/config/index.js 

Scripts
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build  with minification
npm run build:qa / npm run build:staging / npm run build:production

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
For a detailed explanation on how things work, check out the guide and docs for vue-loader.

# Deploy
Install firebase-tools: npm install -g firebase-tools
Build the project with npm run build & NODE_ENV
Go to the firebase folder: cd dist
Set current project: firebase use default(=qa) / staging / production
Deploy your project using firebase deploy
Open the app using firebase open hosting:site, this will open a browser.