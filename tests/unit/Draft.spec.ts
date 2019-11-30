const shallowMount = require('@vue/test-utils');
const createLocalVue = require('@vue/test-utils');
const Vuex = require('vuex');
const store = require('../../src/store/index');
const localVue = createLocalVue();

localVue.use(Vuex);

describe('store.vue', () => {
  let getters;
  let Store;

  const Getters = store.getters;
  beforeEach(() => {
    getters = {
      documentTitle: () => 'מזמך',
      // inputValue: () => 'input'
    };

    Store = new Vuex.Store({
      getters,
    });
  });

  it('Renders "store.getters.documentTitle"', () => {
    const wrapper = shallowMount(Getters, { store: Store, localVue });
    const p = wrapper.find('p');
    expect(p.text()).toBe(getters.documentTitle());
  });

  // it('Renders "store.getters.clicks" in second p tag', () => {
  //   const wrapper = shallowMount(Getters, { store, localVue })
  //   const p = wrapper.findAll('p').at(1)
  //   expect(p.text()).toBe(getters.clicks().toString())
  // })
});

// describe("HelloWorld.vue", () => {
//   test("renders props.msg when passed", () => {
//     const msg = "new message";
//     const wrapper = shallowMount(Draft, {
//       propsData: { msg },
//     });
//     expect(wrapper.text()).toMatch(msg);
//   });
// });
