import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const _5314801b = () => import('../pages/projects/create.vue' /* webpackChunkName: "pages/projects/create" */).then(m => m.default || m)
const _a524c1d2 = () => import('../pages/projects/_address/index.vue' /* webpackChunkName: "pages/projects/_address/index" */).then(m => m.default || m)
const _0c8b3223 = () => import('../pages/projects/_address/payments/create.vue' /* webpackChunkName: "pages/projects/_address/payments/create" */).then(m => m.default || m)
const _2c513a88 = () => import('../pages/index.vue' /* webpackChunkName: "pages/index" */).then(m => m.default || m)



if (process.client) {
  window.history.scrollRestoration = 'manual'
}
const scrollBehavior = function (to, from, savedPosition) {
  // if the returned position is falsy or an empty object,
  // will retain current scroll position.
  let position = false

  // if no children detected
  if (to.matched.length < 2) {
    // scroll to the top of the page
    position = { x: 0, y: 0 }
  } else if (to.matched.some((r) => r.components.default.options.scrollToTop)) {
    // if one of the children has scrollToTop option set to true
    position = { x: 0, y: 0 }
  }

  // savedPosition is only available for popstate navigations (back button)
  if (savedPosition) {
    position = savedPosition
  }

  return new Promise(resolve => {
    // wait for the out transition to complete (if necessary)
    window.$nuxt.$once('triggerScroll', () => {
      // coords will be used if no selector is provided,
      // or if the selector didn't match any element.
      if (to.hash) {
        let hash = to.hash
        // CSS.escape() is not supported with IE and Edge.
        if (typeof window.CSS !== 'undefined' && typeof window.CSS.escape !== 'undefined') {
          hash = '#' + window.CSS.escape(hash.substr(1))
        }
        try {
          if (document.querySelector(hash)) {
            // scroll to anchor by returning the selector
            position = { selector: hash }
          }
        } catch (e) {
          console.warn('Failed to save scroll position. Please add CSS.escape() polyfill (https://github.com/mathiasbynens/CSS.escape).')
        }
      }
      resolve(position)
    })
  })
}


export function createRouter () {
  return new Router({
    mode: 'history',
    base: '/',
    linkActiveClass: 'nuxt-link-active',
    linkExactActiveClass: 'nuxt-link-exact-active',
    scrollBehavior,
    routes: [
		{
			path: "/projects/create",
			component: _5314801b,
			name: "projects-create"
		},
		{
			path: "/projects/:address?",
			component: _a524c1d2,
			name: "projects-address"
		},
		{
			path: "/projects/:address?/payments/create",
			component: _0c8b3223,
			name: "projects-address-payments-create"
		},
		{
			path: "/",
			component: _2c513a88,
			name: "index"
		}
    ],
    
    
    fallback: false
  })
}
