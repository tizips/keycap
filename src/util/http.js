import axios from 'axios';
import store, {UpdateLoadingHttp} from '../store';

axios.defaults.baseURL = "https://app.panguoyun.com/api/";
// axios.defaults.withCredentials = true;

axios.interceptors.request.use(function (config) {

  store.dispatch(UpdateLoadingHttp(true));
  // Vue.prototype.$toAllLoading.start();
  //
  let token = window.$cookie.get('Authorization');
  let id = window.$cookie.get('id');
  // let mid = Vue.prototype.$cookie.get('mid');
  //
  if (token !== '' && token !== undefined) {
    config.headers.Authorization = token;
  }

  if (id !== '' && id !== undefined) {
    config.headers.Id = id;
  }
  //
  // if (mid != '' && mid != null) {
  //   config.headers.Id = mid;
  // }

  return config;
});

axios.interceptors.response.use(function (response) {

  store.dispatch(UpdateLoadingHttp(false));


  let token = response.headers.authorization;

  if (token !== "" && token !== undefined) {
    //   // 如果 header 中存在 token，那么触发 refreshToken 方法，替换本地的 token
    //   Vue.prototype.$cookie.set('Authorization', token)
    //   // if (window.location.pathname.indexOf('/login') < 0) {
    //   //   location.reload()
    //   // }
    window.$cookie.set('Authorization', token);
  }

  if (response.status !== 200) {
    window.$message.error(response.data.message);
    return response;
  }

  if (response.data.status !== 0) {
    window.$message.error(response.data.message);
  }

  return response;
}, function (error) {

  store.dispatch(UpdateLoadingHttp(false));
  window.$message.error(error.message);

  if (error.response === undefined) {
    return false;
  }

  if (error.response.status === 401) {
    window.location.href = '/redirect?uri=/login&title=请先登录后再进行此操作 ...';
  } else if (error.response.status === 502) {
    window.$message.error("网络错误，请检查您的网络后重试 ...");
  } else if (error.response.status === 500) {
    window.$message.error("服务器处理错误，请稍后重试 ...");
  } else if (error.response.status === 500) {
    window.$message.error("资源查询失败，请检查后重试 ...");
  }

  return error.response
});

window.$http = axios;