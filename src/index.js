import React from 'react';
import ReactDOM from 'react-dom';
import Page from './router/page';
import './store';
import './util/helper';
import './util/http';
import * as serviceWorker from './serviceWorker';

import {LocaleProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

window.$moment.locale('zh-cn');

ReactDOM.render(
  <LocaleProvider locale={zhCN}>
    <Page/>
  </LocaleProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
