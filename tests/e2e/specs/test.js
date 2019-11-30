// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
const documentUrl = process.env.VUE_DEV_SERVER_URL + "#/document/nightwatchTestDocument";
const suggestionsUrl = documentUrl + "/section?sections=inTheVote";

module.exports = {
  // "Test that document draft is visible": browser => {
  //   browser
  //     .url(documentUrl + "/draft")
  //     .waitForElementVisible(".v-toolbar__title", 5000)
  //     .assert.containsText(".v-toolbar__title", "טיוטת המסמך")
  //     .waitForElementVisible(".bcm .my-headline", 5000)
  //     .assert.containsText(".bcm .my-headline", "Nightwatch Test Document")
  //     .click(".v-toolbar__side-icon")
  //     .click("aside a[href='#/aboutDocument']")
  //     .waitForElementVisible(".mirFont .my-headline", 1000)
  //     .assert.containsText(".my-subheading.cg", "Nightwatch test document about value")
  //     .end();
  // },
  // "Test that adding a section without a user prompts login": browser => {
  //   browser
  //     .url(suggestionsUrl)
  //     .waitForElementVisible(".v-btn--floating", 10000)
  //     .click(".v-btn--floating")
  //     .assert.urlContains("login")
  //     .end();
  // },
  // "Test email login": browser => {
  //   browser
  //     .url(suggestionsUrl)
  //     .waitForElementVisible("button.v-btn", 10000)
  //     .click("button.v-btn")
  //     .waitForElementVisible("a", 1000)
  //     .click("a")
  //     .setValue("input[type=email]", "test@test.com")
  //     .setValue("input[type=password]", "testtest")
  //     .click("form button.v-btn")
  //     .waitForElementVisible(".v-btn--floating", 10000)
  //     .assert.urlContains(suggestionsUrl)
  //     .end();
  // }
};
