
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
      key: "/height",
      component: "AppHeight",
    },
    {
      key: "/admin",
      component: "AppAdmin",
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