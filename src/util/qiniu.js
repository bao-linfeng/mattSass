import * as qiniu from 'qiniu-js';
import { randomString } from "./ADS.js";

const uploadFile = async (file, callback, uptoken) => {
    const domain = 'https://cdn-skcy.qingtime.cn/';
    let putExtra = {
        fname: "",
        params: {},
        mimeType: ""
    };
    let config = {
        useCdnDomain: true,
        disableStatisticsReport: false,
        retryCount: 5,
        region: qiniu.region.z0
    };
    let observer = {
        next(res) {
        },
        error(err) {
            console.log(err.message);
        },
        complete(res) {
            callback(domain + res.key);
        }
    }
    // 上传
    let observable = qiniu.upload(file, Date.now()+'.png', uptoken, putExtra, config);
    // 上传开始
    observable.subscribe(observer);
}

export {
    uploadFile
}