import { lazy } from "solid-js";

const routes = [
  {
    path: "/item/:id",
    component: lazy(() => import('./pages/item/[id]'))
  },
  {
    path: "/item",
    component: lazy(() => import('./pages/item/index'))
  },
  {
    path: "/feed/:id",
    component: lazy(() => import('./pages/feed/[id]'))
  },
  {
    path: "/feed",
    component: lazy(() => import('./pages/feed/index'))
  },
  {
    path: "/",
    component: lazy(() => import('./pages/index'))
  },
  {
    path: "/*all",
    component: lazy(() => import('./pages/[...all]'))
  }
];

export default routes