import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'

import Home from './views/home'
import NotFound from './views/not-found'
import './style.css'
import Tests_catalog from "@/views/tests_catalog.vue";
import test_taking from "@/views/test_taking.vue";
import test_results from "@/views/test_results.vue";
import test_review from "@/views/test_review.vue";

Vue.use(Router)
Vue.use(Meta)
export default new Router({
  mode: 'history',
  routes: [
    {
      name: 'Home',
      path: '/',
      component: Home,
    },
      {
          name: 'TestsCatalog',
          path: '/tests',
          component: Tests_catalog,
      },
      {
          name: 'TestTaking',
          path: '/test/:id/take',
          component: test_taking,
      },
      {
          name: 'TestResults',
          path: '/test/:id/results',
          component: test_results,
      },
      {
          name: 'TestReview',
          path: '/test/:id/review',
          component: test_review,
      },
    {
      name: '404 - Not Found',
      path: '**',
      component: NotFound,
      fallback: true,
    },

  ],
})
