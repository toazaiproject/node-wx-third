const appId = 'xxxxxxx';  // 第三方平台appid
const appsecret = 'xxxxxxx'; //第三方平台appsecret
const encodingAESKey = 'xxxxxxx';  // 开发者在第一步填写服务器配置的encodingAESKey
const token = 'xxxxxxx';  // 开发者在第一步填写服务器配置的token
const biz_appid = 'xxxxxxx'; // 指定授权唯一的小程序或公众号

// 报文主体中 Encrypt 字段的值  以下参数是微信返回给开发者的参数
const encrypt = 'IPrwMAEOnlSjsQYFQ/hSBiRwodYePro+7fmcTQUfIa3wdR1EQRCrA6rT3QK4ONAHflTq9zuOOlHNpjYNit6yhVDD4wjNL585Yj/s/gYMZOViH6JSVepQW2S5xli0FCpCuISTKS7MPfD+NAKaL6Bm4rOEDxdSX0GnqkHgWilzlIqG9ecfZdEmx0kLyyawjfigfWl9QBMnzXYfI55mca/KCmXmX5Tnp/0vz693R+4Ok80NebgZfH2C3cU+aj39EyWb+TvSjs9ReVkNX0JnJOYFBWvTj7tP19xwH4eLo/tlk9h2uhrMgUlDgyEmaeWNdR3RL1dS7tu2LRQz2a8l2oS2fWP9W33iviv+EMCIlJ7e2lFIEM8VWCDXBCXRnOkVW+tRypxjen3bcCsLotthcs83/oRLq1t53nO7g+Vbm/uyvcztW3xHT//mu/Gt8R/OLCfu378AZb1ADQ9hQ4zC/V7p4/Kg=='
const encrypt1 = 'BLodI22iq2ZUr7m64fyKvNlebgW7Yfxn0lrK7w3/rSSNIa/qVNu4tSGY770Q/k2o/slbcijrIzwzblAFD2tZ5Qr/mCTdVUsf5bf1WpO3/48ThEUYYD1LAaMVNY5c1hpgEkBE20oSOI+mnN5LR0E+Wxv5FwRZ8SyyPKmpTBn9SP912siDOKU+qXjrwCGcPcO2nfguMi87ciglv1pQxzOWsSvDDHUkFEYYmDJdSRXOipPKmfXLPgbdWoYtiUhQDyujrsu+yQBGiGlqpsAc41eb6OOvQfC+I1PEtLTFXzz//Arh9H4MYmZqHWSyPL8q52oxBzDcTGka2Rf5PFz+ATU/1FP+FxpdNp0KLoy090veavUR5j0QHlXxPpWdhm+2rDCIZHbPlnANeBN1dKW4Ylgwe12j4UhrKYqiCEy83MblXM4Dt22Geg8ZzKHa/HJmaj5RmO26ms3NVNNGla8Y0ci/Bg=='
const timestamp = '1627871257' // 推送消息链接上的 timestamp 字段值
const nonce = '1787353124'    // 推送消息链接上的 nonce 字段值
const msg_signature = '624640265d49599511a063047dfff2e9832b7547' // 推送消息链接上 msg_signature 字段值
const xml = '<xml><AppId><![CDATA[wx550ed3a0385d4d59]]></AppId>\n<CreateTime>1627622264</CreateTime>\n<InfoType><![CDATA[component_verify_ticket]]></InfoType>\n<ComponentVerifyTicket><![CDATA[ticket@@@wRZFNIlcztx_le5_fGai4fmnWLJu2S9mDUqyYiZ64kfhwo9gXhcl73NomI63rkO6Qdp2mY8-FwWPEECEfgY0Zg]]></ComponentVerifyTicket>\n</xml>';
const redirect_uri = 'https://xxx.xxxxx.com/xxxxxx'; // 回调 URI

/**
 * 初始化工具客户端
 * @param    {[String]}                 appId [开发者第三方平台APPID]
 * @param    {[String]}                 appsecret [第三方平台appsecret]
 * @param    {[String]}                 encodingAESKey [开发者在第一步填写服务器配置的encodingAESKey]
 * @param    {[String]}                 classificationSecret [开发者在第一步填写服务器配置的token]
 */
const wechatEncrypt = require('../index').initClient({
    appId: appId,  // 第三方平台appid
    appsecret: appsecret,// 第三方平台appsecret
    encodingAESKey: encodingAESKey,  // 开发者在第一步填写服务器配置的encodingAESKey
    token: token  // 开发者在第一步填写服务器配置的token
})

// var util = require('../lib/util');
// console.log(util.xmlStringToJson(xml));

// //验证消息的有效性
// /**
//  * 
//  * @param {String} encrypt [报文主体中 Encrypt 字段的值  以下参数是微信返回给开发者的参数]
//  * @param {String} timestamp [推送消息链接上的 timestamp 字段值]
//  * @param {Array} nonce [推送消息链接上的 nonce 字段值]
//  * @param {Array} msg_signature [推送消息链接上 msg_signature 字段值]
//  */
// wechatEncrypt.checkMsg(encrypt,timestamp,nonce,msg_signature)
// .then(function (body){
// 	console.log(body);
// })
// .catch(function (err){
// 	console.log(err);
// });

// //消息加密
// /**
//  * 
//  * @param {String} xml [需加密数据]
//  */
// wechatEncrypt.encryption(xml)
// .then(function (body){
// 	console.log(body);
// })
// .catch(function (err){
// 	console.log(err);
// });

// //消息解密
// /**
//  * 
//  * @param {String} encrypt [报文主体中 Encrypt 字段的值  以下参数是微信返回给开发者的参数]
//  */
// wechatEncrypt.decrypt(encrypt)
// .then(function (body){
// 	console.log(body);
// })
// .catch(function (err){
// 	console.log(err);
// });

// //消息解密
// /**
//  * 
//  * @param {String} encrypt [报文主体中 Encrypt 字段的值  以下参数是微信返回给开发者的参数]
//  */
//  wechatEncrypt.decrypt(encrypt1)
//  .then(function (body){
//      console.log(body);
//  })
//  .catch(function (err){
//      console.log(err);
//  });

let component_verify_ticket = 'ticket@@@K76eTTifkH_YiizyHR-bDX-AiG1ff8gZ-_xn68CPQBIYLg-BGPYx600rcP16J4iJWY6gUuOrDQkso1EmIbW1NA';
// wechatEncrypt.getComponentAccessToken(component_verify_ticket);
let component_access_token = '47_COyqj-_TJlfBkpSvkC8k501EuSWe58DcxReFC7EbyWuuQkvGqWExzXSbmgIhhGtp6uP6IDPOpMq56O0YlECKOS3V5SHUkGxNULyxNDoQqE7KZmAzT5k6piwo1kEWgVD5VXdzlThkpMXBFmBaFCZeAHANKH';
// wechatEncrypt.getPreAuthCode(component_access_token);
let pre_auth_code = 'preauthcode@@@mpQ7RhobgaMyMGtlA_4Dah83BjEFPT6m-TjKP_cmS_EwdZJhH6D6XlV0V3cx7KbVyRWWD3hP2wAcxqGEbE0zCQ';
// wechatEncrypt.getAuthUrl(pre_auth_code,redirect_uri,'3',biz_appid);
let auth_code = 'queryauthcode@@@4f709Vr6GSv_iia-oFT2W-plCUQX-Z4VApBI69wU3txIkaIWfgnjO9Qi2R6WIZ5_ssIiX_7TD36k2hLnUgQlgQ';
// wechatEncrypt.getAuthorizerAccessToken(component_access_token,auth_code);
let authorizer_access_token = '47_d176iEc6F4eujq8ToQc9sx4Y80v0mP75pNmA78xFGnZ3p1RN_FYhLQYCU7U8acxX14CAK0C_8R_WxlrKOAItXZJkaPsDb3_97MeY56zR1yzk0MhAJiikzmqno5KOhiTUxJ9dXdEGEYrNT4Y_UCSgAJDNVL';
let authorizer_refresh_token = 'refreshtoken@@@KQVQ_c-DUN3y0iqfApzcz2NzAL2wkaC_CJhi-vAltWo';
// wechatEncrypt.refreshAuthorizerAccessToken(component_access_token,biz_appid,authorizer_refresh_token);

// wechatEncrypt.fastRegisterWeApp(component_access_token,{
//     "name": "xxxxx", // 企业名
//     "code": "xxxxxx", // 企业代码
//     "code_type": 1, // 企业代码类型（1：统一社会信用代码， 2：组织机构代码，3：营业执照注册号）
//     "legal_persona_wechat": "xxxxx", // 法人微信
//     "legal_persona_name": "xxxxxx", // 法人姓名
//     "component_phone":"xxxxxxxx"
// });
// wechatEncrypt.getTemplateDraftList(component_access_token);
let draft_id = '1';
// let draft_id = '2';
// wechatEncrypt.addToTemplate(component_access_token,{draft_id:draft_id,template_type:0});
// wechatEncrypt.getTemplateList(component_access_token);
// wechatEncrypt.deleteTemplate(component_access_token,{template_id:'2'});
// wechatEncrypt.commit(authorizer_access_token,{template_id:'0',ext_json:JSON.stringify({}),user_version:'1.0.0',user_desc:'测试'});
// wechatEncrypt.getPage(authorizer_access_token);
// wechatEncrypt.getQrcode(authorizer_access_token,'page/index/index','./1.png');
// wechatEncrypt.submitAudit(authorizer_access_token,{});
// wechatEncrypt.getAuditstatus(authorizer_access_token,{auditid:437789919});
// wechatEncrypt.getLatestAuditstatus(authorizer_access_token);
// wechatEncrypt.undoCodeAudit(authorizer_access_token);
// wechatEncrypt.release(authorizer_access_token);
// wechatEncrypt.getHistoryVersion(authorizer_access_token);
// wechatEncrypt.appVersion(authorizer_access_token,{app_version:'4'});
// wechatEncrypt.getWeAppSupportVersion(authorizer_access_token);
// wechatEncrypt.setWeAppSupportVersion(authorizer_access_token,{version:'1.0.0'});
// wechatEncrypt.memberAuth(authorizer_access_token);
// wechatEncrypt.bindTester(authorizer_access_token,{wechatid:'ahao100861'});
// wechatEncrypt.unBindTester(authorizer_access_token,{wechatid:'ahao100861'});