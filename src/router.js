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
import student_profile from "@/views/student_profile.vue";
import teacher_tests from "@/views/teacher_tests.vue";
import test_constructor from "@/views/test_constructor.vue";
import teacher_groups from "@/views/teacher_groups.vue";
import test_reports from "@/views/test_reports.vue";
import teacher_layout from "@/views/teacher_layout.vue";

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
          name: 'StudentProfile',
          path: '/profile',
          component: student_profile,
      },
      {
          path: '/teacher',
          component:teacher_layout,
          children: [
              {
                  name: 'TeacherTests',
                  path: 'tests',
                  component: teacher_tests,
              },
              {
                  name: 'TestConstructor',
                  path: 'test/:id/edit',
                  component: test_constructor,
              },
              {
                  name: 'TeacherGroups',
                  path: 'groups',
                  component: teacher_groups,
              },
              {
                  name: 'TestReports',
                  path: 'test/:id/reports',
                  component: test_reports,
              }
          ]
      },
    {
      name: '404 - Not Found',
      path: '**',
      component: NotFound,
      fallback: true,
    },

  ],
})
