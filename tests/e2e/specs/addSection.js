// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
const documentUrl = process.env.VUE_DEV_SERVER_URL + "#/document/document1102";
const suggestionsUrl = documentUrl + "/section?sections=inTheVote&status=inTheVote";

module.exports = {
  "Test adding section is OK": browser => {
    browser
      .url(suggestionsUrl)
      .waitForElementVisible(".v-toolbar__title", 10000)
      .click(".bcp .v-btn")
      .waitForElementVisible("a", 1000)
      .click("a")
      .setValue("input[type=email]", "reu@gmail.com")
      .setValue("input[type=password]", "0000000000")
      .click("form button.v-btn")
      .waitForElementVisible(".v-btn--floating", 10000)
      .assert.urlContains(suggestionsUrl)
      .click(".bcp .v-btn")
      .waitForElementVisible(".v-btn", 5000)
      .setValue(".text-area .v-text-field__slot", "סעיף חדש")
      .click(".v-btn")
      .waitForElementVisible(".my-subheading", 30000)
      // .setValue(".text-area .v-text-field__slot", "טיעון חדש")
      .click(".v-btn")
      .waitForElementVisible(".v-btn--floating", 10000)
      .assert.urlContains(suggestionsUrl)
      .end();
  },
};
