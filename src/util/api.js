import axios from 'axios';
import { createMsg } from './ADS';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();

let baseURL='https://skcyfoxx.qingtime.cn';

axios.interceptors.response.use(
    (response) => {
        switch (response.data.statusCode || response.data.status) {
            case '701':
                localStorage.clear()
                createMsg('登录失效');
                break
            case '201':
                createMsg(response.data.msg)
                break
            default:
        }

        return response
    },
    (err) => {
      console.log(err)
    }
)

const request = {
    get: (url, params, base = '') => {
        return new Promise((resolve, reject) => {
            axios
            .get((base ? base : baseURL)+url, {params})
            .then((response) => {
                resolve(response.data);
                if(response.data.status == 301){// 验证码失效 => 跳转 验证码校验UI 2022.07.02 -> baolf
                    // createMsg(response.data.msg);
                    router.push('/authentication');
                }
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
        })
    },
    post: (url, params, base) => {
        return new Promise((resolve, reject) => {
            axios
            .post((base ? base : baseURL)+url, params)
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    patch: (url, params) => {
        return new Promise(function(resolve, reject) {
            axios
            .patch(baseURL+url, params)
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    delete: (url, params) => {
        return new Promise(function(resolve, reject) {
            axios
            .delete(baseURL+url, {
                data: params
            })
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    }
}

const user = {
    getUserInfo(token){
        let param = {
            token: token
        }
        return request.get('/sgbh/account/userinfo', param, 'https://baokudata.qingtime.cn');
    },
    userAndStarInfoAndRole(token, starKey){
        let param = {
            token: token,
            starKey: starKey,
        }
        return request.post('/sgbh/star/userAndStarInfoAndRole', param, 'https://kintime.qingtime.cn');
    },
    getUptoken(token){
        let param = {
            token: token,
            bucketType: 16,
        }
        return request.get('/sgbh/upTokenQiniu/getQiNiuUpToken', param, 'https://baokudata.qingtime.cn');
    },
}

const upload = {
    uploadFile(fd){
        return request.post('/upload', fd);
    }
}

const background = {
    getBackgroundRandom(siteKey){// 随机背景
        let param = {
            siteKey: siteKey
        }
        return request.get('/background/random', param);
    },
    getBackgroundFront(siteKey, tagKey, page, limit){// 背景列表（前台）
        let param = {
            siteKey: siteKey,
            tagKey: tagKey,
            page: page,
            limit: limit,
        }
        return request.get('/background/front', param);
    },
    getTagFront(siteKey, keyword){// 标签列表（前台）
        let param = {
            siteKey: siteKey,
            keyword: keyword,
        }
        return request.get('/tag/front', param);
    },
    addMergeImage(param){// 新增合成图
        
        return request.post('/merge', param);
    },
    getMergeDetail(token, mergeKey){// 合成详情
        let param = {
            token: token,
            mergeKey: mergeKey,
        }
        return request.get('/merge/detail', param);
    },
}

const site = {
    getSiteDetail(token, siteKey){// 站点详情
        let param = {
            siteKey: siteKey,
            token: token,
        }
        return request.get('/site/detail', param);
    },
}

const wechat = {
    signature(url){
        let param = {
            url: url,
        }
        return request.post('/account/getShareWXInfo', param, 'https://baokudata.qingtime.cn/sgbh');
    },
}

export {
    background, user, upload, site, wechat, 
}