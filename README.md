# node-wx-third

node 微信第三方平台对接，可实现小程序一键发布

# 微信文档参考地址

https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/getting_started/how_to_read.html

## Install 安装

> use npm isntall
>
> 使用 npm 安装

```
npm install node-wx-third
```

## Sample example 使用说明

### init Client 初始化客户端

```
/**
 * 初始化工具客户端
 * @author xutao
 * @param    {[String]}                 appId [开发者第三方平台APPID]
 * @param    {[String]}                 appsecret [第三方平台appsecret]
 * @param    {[String]}                 encodingAESKey [开发者在第一步填写服务器配置的encodingAESKey]
 * @param    {[String]}                 token [开发者在第一步填写服务器配置的token]
*/
const wechatEncrypt = require('../index').initClient({
    appId: appId,  // 第三方平台appid
    appsecret: appsecret,// 第三方平台appsecret
    encodingAESKey: encodingAESKey,  // 开发者在第一步填写服务器配置的encodingAESKey
    token: token  // 开发者在第一步填写服务器配置的token
})
```

### 验证消息的有效性

```
/**
 * 
 * @param {String} encrypt [报文主体中 Encrypt 字段的值  以下参数是微信返回给开发者的参数]
 * @param {String} timestamp [推送消息链接上的 timestamp 字段值]
 * @param {Array} nonce [推送消息链接上的 nonce 字段值]
 * @param {Array} msg_signature [推送消息链接上 msg_signature 字段值]
 */
wechatEncrypt.checkMsg(encrypt,timestamp,nonce,msg_signature)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 消息加密

```
/**
 * 
 * @param {String} xml [需加密数据]
 */
wechatEncrypt.encryption(xml)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 消息解密

```
/**
 * 
 * @param {String} encrypt [报文主体中 Encrypt 字段的值  以下参数是微信返回给开发者的参数]
 */
wechatEncrypt.decrypt(encrypt)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取component_access_token

```
/**
 * 
 * @param {String} component_verify_ticket [微信后台推送的 ticket]
*/
wechatEncrypt.getComponentAccessToken(component_verify_ticket)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```
### 获取pre_auth_code(预授权码)

```
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
*/
wechatEncrypt.getPreAuthCode(component_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取授权链接

```
/**
 * 
 * @param {String} pre_auth_code [预授权码]
 * @param {String} redirect_uri [授权完成后的回调 URI]
 * @param {String} auth_type [要授权的帐号类型：1 则商户点击链接后，手机端仅展示公众号、2 表示仅展示小程序，3 表示公众号和小程序都展示。如果为未指定，则默认小程序和公众号都展示。第三方平台开发者可以使用本字段来控制授权的帐号类型。]
 * @param {String} biz_appid [指定授权唯一的小程序或公众号]
*/
wechatEncrypt.getAuthUrl(pre_auth_code,redirect_uri,'3',biz_appid)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 使用授权码获取授权信息

```
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} authorization_code [授权码, 会在授权成功时返回给第三方平台]
*/
wechatEncrypt.getAuthorizerAccessToken(component_access_token,auth_code)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取/刷新接口调用令牌

```
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} authorizer_appid [授权方 appid]
 * @param {String} authorizer_refresh_token [刷新令牌，获取授权信息时得到]
*/
wechatEncrypt.refreshAuthorizerAccessToken(component_access_token,biz_appid,authorizer_refresh_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 快速注册企业小程序

```
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.name [企业名（需与工商部门登记信息一致）；如果是“无主体名称个体工商户”则填“个体户+法人姓名”，例如“个体户张三”]
 * @param {String} params.code [企业代码]
 * @param {String} params.code_type [企业代码类型 1：统一社会信用代码（18 位） 2：组织机构代码（9 位 xxxxxxxx-x） 3：营业执照注册号(15 位)]
 * @param {String} params.legal_persona_wechat [法人微信号]
 * @param {String} params.legal_persona_name [法人姓名（绑定银行卡）]
*/
wechatEncrypt.fastRegisterWeApp(component_access_token,{
    "name": "xxxxxxx", // 企业名
    "code": "xxxxxxxx", // 企业代码
    "code_type": 1, // 企业代码类型（1：统一社会信用代码， 2：组织机构代码，3：营业执照注册号）
    "legal_persona_wechat": "xxxxxxxx", // 法人微信
    "legal_persona_name": "xxxxxx", // 法人姓名
    "component_phone":"xxxxxxxxx"
})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取代码草稿列表

```
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
*/
wechatEncrypt.getTemplateDraftList(component_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 将草稿添加到代码模板库

```
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.draft_id [草稿id]
 * @param {String} params.template_type [默认值是0，对应普通模板；可选1，对应标准模板库，关于标准模板库和普通模板库的区别可以查看小程序模板库介绍]
*/
wechatEncrypt.addToTemplate(component_access_token,{draft_id:draft_id,template_type:0})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取代码模板列表

```
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
*/
wechatEncrypt.getTemplateList(component_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 删除指定代码模板

```
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.template_id [要删除的模板 ID ，可通过获取代码模板列表接口获取]
*/
wechatEncrypt.deleteTemplate(component_access_token,{template_id:'2'})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 上传小程序代码

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.template_id [代码库中的代码模板 ID，可通过获取代码模板列表接口获取template_id]
 * @param {String} params.ext_json [为了方便第三方平台的开发者引入 extAppid 的开发调试工作，引入ext.json配置文件概念，该参数则是用于控制ext.json配置文件的内容。关于该参数的补充说明请查看下方的"ext_json补充说明"]
 * @param {String} params.user_version [代码版本号，开发者可自定义（长度不要超过 64 个字符）]
 * @param {String} params.user_desc [代码描述，开发者可自定义]
*/
wechatEncrypt.commit(authorizer_access_token,{template_id:'0',ext_json:JSON.stringify({}),user_version:'1.0.0',user_desc:'测试'})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取已上传的代码的页面列表

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
wechatEncrypt.getPage(authorizer_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取体验版二维码

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} path [指定二维码扫码后直接进入指定页面并可同时带上参数），选填]
 * @param {String} url [存储图片的地址]
*/
wechatEncrypt.getQrcode(authorizer_access_token,'page/index/index')
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 提交审核

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数，选填]
 * @param {String} params.item_list [审核项列表（选填，至多填写 5 项]
 * @param {String} params.preview_info [预览信息（小程序页面截图和操作录屏）]
 * @param {String} params.version_desc [小程序版本说明和功能解释]
 * @param {String} params.feedback_info [反馈内容，至多 200 字]
 * @param {String} params.feedback_stuff [用 | 分割的 media_id 列表，至多 5 张图片, 可以通过新增临时素材接口上传而得到]
 * @param {String} params.ugc_declare [用户生成内容场景（UGC）信息安全声明]
*/
wechatEncrypt.submitAudit(authorizer_access_token,{})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 查询指定发布审核单的审核状态

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.auditid [提交审核时获得的审核 id]
*/
wechatEncrypt.getAuditStatus(authorizer_access_token,{auditid:437789919})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 查询最新一次提交的审核状态

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
wechatEncrypt.getLatestAuditStatus(authorizer_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 小程序审核撤回

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
wechatEncrypt.undoCodeAudit(authorizer_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 发布已通过审核的小程序

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
wechatEncrypt.release(authorizer_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取可回退的小程序版本

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
wechatEncrypt.getHistoryVersion(authorizer_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 版本回退

```
//版本回退
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数，选填]
 * @param {String} params.app_version [默认是回滚到上一个版本；也可回滚到指定的小程序版本，可通过get_history_version获取app_version]
*/
wechatEncrypt.appVersion(authorizer_access_token,{app_version:'4'})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 查询当前设置的最低基础库版本及各版本用户占比

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
wechatEncrypt.getWeAppSupportVersion(authorizer_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 设置最低基础库版本

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.version [为已发布的基础库版本号]
*/
wechatEncrypt.setWeAppSupportVersion(authorizer_access_token,{version:'1.0.0'})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 加急审核申请

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.auditid [审核单ID]
*/
wechatEncrypt.speedUpAudit(authorizer_access_token,{auditid:'12345'})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 获取体验者列表

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
wechatEncrypt.memberAuth(authorizer_access_token)
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 绑定微信用户为体验者

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.wechatid [微信号]
*/
wechatEncrypt.bindTester(authorizer_access_token,{wechatid:'ahao100861'})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

### 解除绑定体验者

```
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.wechatid [微信号]
*/
wechatEncrypt.unbindTester(authorizer_access_token,{wechatid:'ahao100861'})
.then(function (body){
	console.log(body);
})
.catch(function (err){
	console.log(err);
});
```

