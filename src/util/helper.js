import {message, Modal} from 'antd';
import moment from 'moment';
import Cookies from 'universal-cookie';

window.urlEncode = function (param, key, encode) {

  if (param == null) return '';
  let paramStr = '';
  let t = typeof (param);
  if (t === 'string' || t === 'number' || t === 'boolean') {
    paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
  } else {
    for (let i in param) {
      let k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
      paramStr += window.urlEncode(param[i], k, encode);
    }
  }

  if (paramStr.length === 0) {
    return paramStr
  }

  let tm = paramStr.substring(0, 1);

  let tmp = '';

  if (tm === '&') {
    tmp = paramStr.substring(1);
  } else {
    tmp = paramStr;
  }

  return tmp;
};

window.urlDecode = function (url) {

  let obj = {};

  let keyvalue = [];

  let key = "",
    value = "";

  let paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");

  for (let i in paraString) {
    keyvalue = paraString[i].split("=");
    key = keyvalue[0];
    value = keyvalue[1];
    obj[key] = value;
  }

  return obj;
};

window.toUploadFn = (param) => {

  const uri = window.$picture;
  const xhr = new XMLHttpRequest();
  const fd = new FormData();

  const successFn = (response) => {
    // 假设服务端直接返回文件上传后的地址
    // 上传成功后调用param.success并传入上传后的文件地址
    console.log(xhr.response);

    let jsonStr = JSON.parse(xhr.response);

    param.success({
      url: window.$upload + jsonStr.result,
      meta: {
        id: 'xxx',
        title: 'xxx',
        alt: 'xxx',
      }
    })
  };

  const progressFn = (event) => {
    // 上传进度发生变化时调用param.progress
    param.progress(event.loaded / event.total * 100)
  };

  const errorFn = (response) => {
    // 上传发生错误时调用param.error
    param.error({
      msg: 'unable to upload.'
    })
  };

  xhr.upload.addEventListener("progress", progressFn, false);
  xhr.addEventListener("load", successFn, false);
  xhr.addEventListener("error", errorFn, false);
  xhr.addEventListener("abort", errorFn, false);

  fd.append('file', param.file);
  xhr.open('POST', uri, true);
  xhr.setRequestHeader("Authorization",window.$cookie.get("Authorization"));
  xhr.send(fd);
};

window.controls = ['font-size', 'line-height', 'text-color', 'bold', 'italic', 'underline', 'strike-through', 'superscript', 'subscript', 'text-indent', 'link', 'media', 'text-align', 'hr', 'remove-styles'];

window.$uri = 'https://test.pheilcia.com/api/';
window.$upload = 'https://test.pheilcia.com/api/';

window.$picture = window.$upload + 'v1/administer/upload';

window.$layout = {
  labelCol: {span: 5},
  wrapperCol: {span: 19},
};

window.$layoutSetting = {
  labelCol: {span: 2},
  wrapperCol: {span: 10},
};

window.$layoutSettingSubmit = {
  wrapperCol: {
    span: 10,
    offset: 2,
  },
};

window.$message = message;
window.$moment = moment;
window.$confirm = Modal.confirm;

window.$cookie = new Cookies();