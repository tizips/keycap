
// import {lazy} from 'react';
// import LazyLoad from '../optimization/lazyLoad';

export default {
  menus: [ // 菜单相关路由
    {
      key: "/dashboard",
      component: 'AppDashboard',
    },
    {
      key: "/keycap",
      component: 'KeycapList',
    },
    {
      key: "/keycap/edit",
      component: 'KeycapEditor',
    },
    {
      key: "/type",
      component: "AppType",
    },
    {
      key: "/area",
      component: "AppArea",
    },
    {
      key: "/admin",
      component: "AppAdmin",
    },
    {
      key: "/role",
      component: "AppRole",
    },
  ],
  others: [
    // {
    //   key: '/app/merchant/edit',
    //   component: 'AppMerchantEditor',
    // },
    // {
    //   key: '/app/child/edit',
    //   component: 'AppChildEditor',
    // },
  ] // 非菜单相关路由
}