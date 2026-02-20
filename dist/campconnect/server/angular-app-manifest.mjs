
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/campsites"
  },
  {
    "renderMode": 2,
    "route": "/events"
  },
  {
    "renderMode": 2,
    "route": "/marketplace"
  },
  {
    "renderMode": 2,
    "route": "/community"
  },
  {
    "renderMode": 2,
    "route": "/map"
  },
  {
    "renderMode": 2,
    "route": "/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/seller"
  },
  {
    "renderMode": 2,
    "route": "/client"
  },
  {
    "renderMode": 2,
    "route": "/admin"
  },
  {
    "renderMode": 2,
    "route": "/auth/login"
  },
  {
    "renderMode": 2,
    "route": "/auth/register"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 2302, hash: '83c30835e3ac9f2e65ef262d1db4a229c95d67404ed7f99edd3845da05329db9', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 947, hash: '6cd9bbd9cc844e7e3b9658b6d676c535725eedce41a997fa1d7ab46e89d78b89', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 18473, hash: '3652cd53d1b548045f92f6ca01843a289c1dafe77150936ae9cff7f5ad8a35d3', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'events/index.html': {size: 20805, hash: '8263c6b2bcc06829e3c2d65017df6084b68aa64e517ac99d176289acfbf67a36', text: () => import('./assets-chunks/events_index_html.mjs').then(m => m.default)},
    'community/index.html': {size: 20663, hash: '261f6597835e051fb3031b01c5d62a9b9cca6a6ec7566f663593a982245d0035', text: () => import('./assets-chunks/community_index_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 324, hash: '2876c8c537955b74c3e22d5ffbed5828c4eda5f4261f7eb50a740aa25001a27a', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)},
    'client/index.html': {size: 315, hash: '59b393086799c60a8f4b4a26e3a47062658807a215cb87b5864cf1fe4fb02f38', text: () => import('./assets-chunks/client_index_html.mjs').then(m => m.default)},
    'auth/login/index.html': {size: 15822, hash: 'fd8a750dfd88409e4afbd6e43364b16b9175350e4ee9b93c8ccf79d70b336139', text: () => import('./assets-chunks/auth_login_index_html.mjs').then(m => m.default)},
    'campsites/index.html': {size: 24420, hash: '148447b1694685546ab8960ad9fc34e23b7d0888b7f2f7e62e7a11ed033b39ec', text: () => import('./assets-chunks/campsites_index_html.mjs').then(m => m.default)},
    'map/index.html': {size: 29774, hash: 'db96ef70ed247c873a8e7c0d0c602d92e153dc1db0a74b063d0e6f03c2b2b168', text: () => import('./assets-chunks/map_index_html.mjs').then(m => m.default)},
    'admin/index.html': {size: 312, hash: '610ed59725120ff28c9c89f0776d248679b59537140998702757350a987b0a94', text: () => import('./assets-chunks/admin_index_html.mjs').then(m => m.default)},
    'marketplace/index.html': {size: 31176, hash: 'd063487c6eb6829e3dec444043460d56a3713c51f5c437cdce1d8ed0f0a4a5a5', text: () => import('./assets-chunks/marketplace_index_html.mjs').then(m => m.default)},
    'auth/register/index.html': {size: 15822, hash: 'fd8a750dfd88409e4afbd6e43364b16b9175350e4ee9b93c8ccf79d70b336139', text: () => import('./assets-chunks/auth_register_index_html.mjs').then(m => m.default)},
    'seller/index.html': {size: 315, hash: '906d29ef6d81182cad36e65ae21cd7333050badf95a20edc5a1109d2308f8a6d', text: () => import('./assets-chunks/seller_index_html.mjs').then(m => m.default)},
    'styles-QW2UHOVY.css': {size: 33463, hash: 'HyyYwoYPFGg', text: () => import('./assets-chunks/styles-QW2UHOVY_css.mjs').then(m => m.default)}
  },
};
