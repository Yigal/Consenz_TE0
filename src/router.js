// TODO Check why router.js not generated from ts
import Vue from "vue";
import Router from "vue-router";
import AddDocument from "./views/AddDocuments/AddDocument.vue";
import AddNew from "./views/AddNew/AddNew.vue";
import Draft from "./views/Document/Draft/Draft.vue";
import Section from "./views/Document/Section/Section.vue";
import Login from "./views/Login/Login.vue";
import aboutConsenz from "./views/NavBar/AboutConsenz.vue";
import aboutDocument from "./views/NavBar/AboutDocument.vue";
import contactUs from "./views/NavBar/ContactUs.vue";
import NavBar from "./views/NavBar/NavBar.vue";

Vue.use(Router);

export const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/",
    name: "home",
    component: NavBar,
    children: [
      {
        path: "/",
        name: "draft",
        component: Draft,
      },
      {
        path: "/aboutConsenz/:prettyLink",
        name: "aboutConsenz",
        component: aboutConsenz,
      },
      {
        path: "/aboutDocument/:prettyLink",
        name: "aboutDocument",
        component: aboutDocument,
      },
      {
        path: "/contactUs",
        name: "contactUs",
        component: contactUs,
      },
      {
        path: "/document/:prettyLink/draft",
        name: "draft",
        component: Draft,
      },
      {
        path: "/document/:prettyLink/addNew",
        name: "addNew",
        component: AddNew,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/document/:prettyLink/section",
        name: "section",
        component: Section,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/addDocument",
        name: "AddDocument",
        component: AddDocument,
        meta: { requiresAuth: true },
      },
    ],
  },
];
export let router = new Router({
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});
