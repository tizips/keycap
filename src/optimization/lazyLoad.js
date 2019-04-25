// 懒加载方法
import React from 'react';
import Loadable from 'react-loadable';

// 默认加载组件，可以直接返回 null
const Loading = (props) => {
  return <div>Loading...</div>
};

export default loader => Loadable({
  loader,
  loading: Loading,
})

