import {createStore, combineReducers} from 'redux';

const systemInfo = {
  width: 1024,
  height: 768,
};

const userInfo = {
  basic: {
    name: '',
    nickname: '',
    thumb: '',
  },
  role: {
    type: '',
    right: [],
  },
};

const loadingInfo = {
  http: false,
};

const systemReducer = function (state = systemInfo, action) {
  switch (action.type) {
    case 'UPDATE_WIDTH': {
      return {
        width: action.payload,
        height: state.height,
      }
    }
    case 'UPDATE_HEIGHT': {
      return {
        width: state.width,
        height: action.payload,
      }
    }
    default: {
      return state;
    }
  }
};

const loadingReducer = function (state = loadingInfo, action) {
  switch (action.type) {
    case 'UPDATE_HTTP_LOADING': {
      return {
        http: action.payload,
      }
    }
    default: {
      return state;
    }
  }
};

const userReducer = function (state = userInfo, action) {
  switch (action.type) {
    case 'UPDATE_USER_INFO': {
      return action.payload
    }
    default: {
      return state;
    }
  }
};

export function UpdateSystemWidth(width) {
  return {
    type: 'UPDATE_WIDTH',
    payload: width,
  }
}

export function UpdateSystemHeight(height) {
  return {
    type: 'UPDATE_HEIGHT',
    payload: height,
  }
}

export function UpdateLoadingHttp(ok) {
  return {
    type: 'UPDATE_HTTP_LOADING',
    payload: ok,
  }
}

export function UpdateUserInfo(user) {
  return {
    type: 'UPDATE_USER_INFO',
    payload: user,
  }
}

const allReducers = {
  system: systemReducer,
  loading: loadingReducer,
  user: userReducer,
};

const rootReducer = combineReducers(allReducers);

const state = createStore(rootReducer);

export default state;