import { reactive, inject } from 'vue';
import {getValue} from '../util/ADS';

const stateSymbol = Symbol('state');

const state = reactive({ 
  token: getValue('token') || '',
  userKey: getValue('userKey') || '',
  userName: getValue('userName') || '',
  avatar: getValue('avatar') || '',
  profile: getValue('profile') ? JSON.parse(getValue('profile')) : {},
  origin: window.location.origin || '',
  siteKey: getValue('siteKey') || '9003249130',
  siteName: getValue('siteName') || '时空穿越 打卡万安',
  role: getValue('role') ? Number(getValue('role')) :  -1,
  navActive: '/',
  baseURL: 'https://pumudata.qingtime.cn',
  isLoading: false,
  qiniuURL: 'https://cdn-icare.qingtime.cn',
  qiniuToken: getValue('qiniuToken') || '',
  sourceDataBlob: '',
  photoSize: 0,
  photoURL: '',
  bgImg: {w: 0, h: 0},
  photoImg: {w: 0, h: 0},
  socket: '',
  socketMessageEvent: '',
  pc: '',
  sourceData: '',
  sourceDataURL: '',
  videoPlayer: '',
});

const changePropertyValue = (property, value) => {
  state[property] = value;
}

const useState = () => inject(stateSymbol);

export {
  stateSymbol,
  state,
  useState,
  changePropertyValue,
}