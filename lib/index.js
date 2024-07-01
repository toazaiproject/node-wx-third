const request = require('request');
const fs = require('fs');
const WechatEncrypt = require("./WXMsgCrypto");
const util = require("./util");

let appId = "";
let appsecret = "";
let encodingAESKey = "";
let token = "";
let wechatEncrypt;
const apiUrl = {
	getComponentAccessTokenUrl:'https://api.weixin.qq.com/cgi-bin/component/api_component_token',
	getPreAuthCodeUrl:'https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token=',
	getAuthorizerAccessTokenUrl:'https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=',
	refreshAuthorizerAccessTokenUrl:'https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token=',
	fastRegisterWeAppUrl:'https://api.weixin.qq.com/cgi-bin/component/fastregisterweapp?action=create&component_access_token=',
	getTemplateDraftListUrl:'https://api.weixin.qq.com/wxa/gettemplatedraftlist?access_token=',
	addToTemplateUrl:'https://api.weixin.qq.com/wxa/addtotemplate?access_token=',
	getTemplateListUrl:'https://api.weixin.qq.com/wxa/gettemplatelist?access_token=',
	deleteTemplateUrl:'https://api.weixin.qq.com/wxa/deletetemplate?access_token=',
	commitUrl:'https://api.weixin.qq.com/wxa/commit?access_token=',
	getPageUrl:'https://api.weixin.qq.com/wxa/get_page?access_token=',
	getQrcodeUrl:'https://api.weixin.qq.com/wxa/get_qrcode?access_token=',
	submitAuditUrl:'https://api.weixin.qq.com/wxa/submit_audit?access_token=',
	getAuditStatusUrl:'https://api.weixin.qq.com/wxa/get_auditstatus?access_token=',
	getLatestAuditStatusUrl:'https://api.weixin.qq.com/wxa/get_latest_auditstatus?access_token=',
	undoCodeAuditUrl:'https://api.weixin.qq.com/wxa/undocodeaudit?access_token=',
	releaseUrl:'https://api.weixin.qq.com/wxa/release?access_token=',
	getHistoryVersionUrl:'https://api.weixin.qq.com/wxa/revertcoderelease?action=get_history_version&access_token=',
	appVersionUrl:'https://api.weixin.qq.com/wxa/revertcoderelease?access_token=',
	getWeAppSupportVersionUrl:'https://api.weixin.qq.com/cgi-bin/wxopen/getweappsupportversion?access_token=',
	setWeAppSupportVersionUrl:'https://api.weixin.qq.com/cgi-bin/wxopen/setweappsupportversion?access_token=',
	speedUpAuditUrl:'https://api.weixin.qq.com/wxa/speedupaudit?access_token=',
	memberAuthUrl:'https://api.weixin.qq.com/wxa/memberauth?access_token=',
	bindTesterUrl:'https://api.weixin.qq.com/wxa/bind_tester?access_token=',
	unbindTesterUrl:'https://api.weixin.qq.com/wxa/unbind_tester?access_token=',
	modifyDomainUrl:'https://api.weixin.qq.com/wxa/modify_domain?access_token=',
	setWebViewDomainUrl:'https://api.weixin.qq.com/wxa/setwebviewdomain?access_token=',
	setPrivacySettingUrl:'https://api.weixin.qq.com/cgi-bin/component/setprivacysetting?access_token='
};//请求接口

//验证消息的有效性
/**
 * 
 * @param {String} encrypt [报文主体中 Encrypt 字段的值  以下参数是微信返回给开发者的参数]
 * @param {String} timestamp [推送消息链接上的 timestamp 字段值]
 * @param {Array} nonce [推送消息链接上的 nonce 字段值]
 * @param {Array} msg_signature [推送消息链接上 msg_signature 字段值]
 */
const checkMsg = function(encrypt,timestamp,nonce,msg_signature){
    // 校验消息是否来自微信：取链接上的 timestamp, nonce 字段和报文主体的 Encrypt 字段的值，来生成签名
	// 生成的签名和链接上的 msg_signature 字段值进行对比
	let signature = wechatEncrypt.genSign({ timestamp, nonce, encrypt })
	let isValid = signature === msg_signature
	return new Promise((reslove, reject) => {
		return reslove({
			isValid:isValid,
			msg:isValid ? '消息有效' : '消息无效'
		});
	})
}

//消息加密
/**
 * 
 * @param {String} xml [需加密数据,json格式]
 */
const encryption = function(xml){
	xml = util.xmlHelper.parseObjectToXML(xml,'xml');
    let encryptedMsg = wechatEncrypt.encode(xml)
	return new Promise((reslove, reject) => {
		return reslove({
			result:encryptedMsg
		});
	})
}

//消息解密
/**
 * 
 * @param {String} encrypt [报文主体中 Encrypt 字段的值  以下参数是微信返回给开发者的参数]
 */
const decrypt = function(encrypt){
    return new Promise((reslove, reject) => {
		let xml = wechatEncrypt.decode(encrypt)
		return util.xmlStringToJson(xml)
		.then(function (result){
			return reslove({
				result:result
			});	
		})
	})
}

//获取component_access_token
/**
 * 
 * @param {String} component_verify_ticket [微信后台推送的 ticket]
*/
const getComponentAccessToken = function(component_verify_ticket){
	return new Promise(function(reslove,reject){
		if(!component_verify_ticket){
			return reslove({code:409,message:'请填写微信后台推送的component_verify_ticket'});
		}
		var options = {
			url:apiUrl.getComponentAccessTokenUrl,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:{
				"component_appid":  appId,
				"component_appsecret":  appsecret,
				"component_verify_ticket": component_verify_ticket
			},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取pre_auth_code(预授权码)
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
*/
const getPreAuthCode = function(component_access_token){
	return new Promise(function(reslove,reject){
		if(!component_access_token){
			return reslove({code:409,message:'请填写第三方平台component_access_token'});
		}
		var options = {
			url:apiUrl.getPreAuthCodeUrl + component_access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:{
				"component_appid":  appId
			},
			json:true
		};
		return request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取授权链接
/**
 * 
 * @param {String} biz_appid [预授权码]
 * @param {String} redirect_uri [授权完成后的回调 URI]
 * @param {String} auth_type [要授权的帐号类型：1 则商户点击链接后，手机端仅展示公众号、2 表示仅展示小程序，3 表示公众号和小程序都展示。如果为未指定，则默认小程序和公众号都展示。第三方平台开发者可以使用本字段来控制授权的帐号类型。]
 * @param {String} biz_appid [指定授权唯一的小程序或公众号]
*/
const getAuthUrl = function(pre_auth_code,redirect_uri,auth_type,biz_appid){
	return new Promise(function(reslove,reject){
		if(!pre_auth_code){
			return reslove({code:409,message:'请填写预授权码'});
		}
		if(!redirect_uri){
			return reslove({code:409,message:'请填写预授回调地址'});
		}
		if(!auth_type){
			return reslove({code:409,message:'请填写授权账号类型'});
		}
		if(['1','2','3'].indexOf(auth_type) == -1){
			return reslove({code:409,message:'请填写正确的授权账号类型'});
		}
		if(!biz_appid){
			return reslove({code:409,message:'请填写指定授权唯一的小程序或公众号'});
		}
		auth_type = auth_type ? auth_type : '2';
		redirect_uri = util.changeUrl(redirect_uri,'encode');
		const pcUrl = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + appId + '&pre_auth_code=' + pre_auth_code + '&redirect_uri=' + redirect_uri + '&auth_type=' + auth_type;
		const mobileUrl = 'https://mp.weixin.qq.com/safe/bindcomponent?action=bindcomponent&no_scan=1&component_appid=' + appId + '&pre_auth_code=' + pre_auth_code + '&redirect_uri=' + redirect_uri + '&auth_type=' + auth_type + '&biz_appid=' + biz_appid + '#wechat_redirect';

		return reslove({
			code:200,
			result:{
				pcUrl:pcUrl,
				mobileUrl:mobileUrl
			}
		});
	});
}

//使用授权码获取授权信息
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} authorization_code [授权码, 会在授权成功时返回给第三方平台]
*/
const getAuthorizerAccessToken = function(component_access_token,authorization_code){
	return new Promise(function(reslove,reject){
		if(!component_access_token){
			return reslove({code:409,message:'请填写第三方平台component_access_token'});
		}
		if(!authorization_code){
			return reslove({code:409,message:'请填写授权码(会在授权成功时返回给第三方平台)'});
		}
		var options = {
			url:apiUrl.getAuthorizerAccessTokenUrl + component_access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:{
				"component_appid": appId,
				"authorization_code":  authorization_code
			},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取/刷新接口调用令牌
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} authorizer_appid [授权方 appid]
 * @param {String} authorizer_refresh_token [刷新令牌，获取授权信息时得到]
*/
const refreshAuthorizerAccessToken = function(component_access_token,authorizer_appid,authorizer_refresh_token){
	return new Promise(function(reslove,reject){
		if(!component_access_token){
			return reslove({code:409,message:'请填写第三方平台component_access_token'});
		}
		if(!authorizer_appid){
			return reslove({code:409,message:'请填写授权方 appid'});
		}
		if(!authorizer_refresh_token){
			return reslove({code:409,message:'请填写刷新令牌(获取授权信息时得到)'});
		}
		var options = {
			url:apiUrl.refreshAuthorizerAccessTokenUrl + component_access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:{
				"component_appid": appId,
				"authorizer_appid": authorizer_appid,
				"authorizer_refresh_token": authorizer_refresh_token
			},
			json:true
		};
		
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//快速注册企业小程序
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
const fastRegisterWeApp = function(component_access_token,params){
	return new Promise(function(reslove,reject){
		if(!component_access_token){
			return reslove({code:409,message:'请填写第三方平台component_access_token'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.name){
			return reslove({code:409,message:'请填写企业名（需与工商部门登记信息一致）'});
		}
		if(!params.code){
			return reslove({code:409,message:'请填写企业代码'});
		}
		if(!params.code_type){
			return reslove({code:409,message:'请填写企业代码类型 1：统一社会信用代码（18 位） 2：组织机构代码（9 位 xxxxxxxx-x） 3：营业执照注册号(15 位)'});
		}
		if(!params.legal_persona_wechat){
			return reslove({code:409,message:'请填写法人微信号'});
		}
		if(!params.legal_persona_name){
			return reslove({code:409,message:'请填写法人姓名（绑定银行卡）'});
		}
		var options = {
			url:apiUrl.fastRegisterWeAppUrl + component_access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取代码草稿列表
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
*/
const getTemplateDraftList = function(component_access_token){
	return new Promise(function(reslove,reject){
		if(!component_access_token){
			return reslove({code:409,message:'请填写第三方平台component_access_token'});
		}
		var options = {
			url:apiUrl.getTemplateDraftListUrl + component_access_token,
			method:"get",
			headers:{"Content-Type":"application/json"},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//将草稿添加到代码模板库
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.draft_id [草稿id]
 * @param {String} params.template_type [默认值是0，对应普通模板；可选1，对应标准模板库，关于标准模板库和普通模板库的区别可以查看小程序模板库介绍]
*/
const addToTemplate = function(component_access_token,params){
	return new Promise(function(reslove,reject){
		if(!component_access_token){
			return reslove({code:409,message:'请填写第三方平台component_access_token'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.draft_id){
			return reslove({code:409,message:'请填写草稿id'});
		}
		if(!params.template_type){
			return reslove({code:409,message:'请填写模板类型'});
		}
		if([0,1].indexOf(params.template_type) == -1){
			return reslove({code:409,message:'请填写正确的模板类型'});
		}
		var options = {
			url:apiUrl.addToTemplateUrl + component_access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取代码模板列表
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
*/
const getTemplateList = function(component_access_token){
	return new Promise(function(reslove,reject){
		if(!component_access_token){
			return reslove({code:409,message:'请填写第三方平台component_access_token'});
		}
		var options = {
			url:apiUrl.getTemplateListUrl + component_access_token,
			method:"get",
			headers:{"Content-Type":"application/json"},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//删除指定代码模板
/**
 * 
 * @param {String} component_access_token [第三方平台component_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.template_id [要删除的模板 ID ，可通过获取代码模板列表接口获取]
*/
const deleteTemplate = function(component_access_token,params){
	return new Promise(function(reslove,reject){
		if(!component_access_token){
			return reslove({code:409,message:'请填写第三方平台component_access_token'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.template_id){
			return reslove({code:409,message:'请填写要删除的模板id'});
		}
		var options = {
			url:apiUrl.deleteTemplateUrl + component_access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//上传小程序代码
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.template_id [代码库中的代码模板 ID，可通过获取代码模板列表接口获取template_id]
 * @param {String} params.ext_json [为了方便第三方平台的开发者引入 extAppid 的开发调试工作，引入ext.json配置文件概念，该参数则是用于控制ext.json配置文件的内容。关于该参数的补充说明请查看下方的"ext_json补充说明"]
 * @param {String} params.user_version [代码版本号，开发者可自定义（长度不要超过 64 个字符）]
 * @param {String} params.user_desc [代码描述，开发者可自定义]
*/
const commit = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.template_id){
			return reslove({code:409,message:'请填写代码库中的代码模板id'});
		}
		if(!params.ext_json){
			return reslove({code:409,message:'请填写ext_json'});
		}
		if(!params.user_version){
			return reslove({code:409,message:'请填写代码版本号'});
		}
		if(!params.user_desc){
			return reslove({code:409,message:'请填写代码描述'});
		}
		var options = {
			url:apiUrl.commitUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取已上传的代码的页面列表
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
const getPage = function(access_token){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.getPageUrl + access_token,
			method:"get",
			headers:{"Content-Type":"application/json"},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取体验版二维码
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} path [指定二维码扫码后直接进入指定页面并可同时带上参数）]
 * @param {String} url [存储图片的地址]
*/
const getQrcode = function(access_token,path,url){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!url){
			return reslove({code:409,message:'请填写存储图片的地址'});
		}
		var options = {
			url:apiUrl.getQrcodeUrl + access_token + (path ? ('&path=' + util.changeUrl(path,'encode')) : ''),
			method:"get",
			headers:{"Content-Type":"application/json"},
			json:true
		};

		var writeStream = fs.createWriteStream(url);
		var readStream = request(options,function(error,body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}
		});

		readStream
		.pipe(writeStream);

		readStream.on('end', function(response) {
			reslove({
				code:200,
				result:url
			});
		    writeStream.end();
		});
	});
}

//提交审核
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.item_list [审核项列表（选填，至多填写 5 项]
 * @param {String} params.preview_info [预览信息（小程序页面截图和操作录屏）]
 * @param {String} params.version_desc [小程序版本说明和功能解释]
 * @param {String} params.feedback_info [反馈内容，至多 200 字]
 * @param {String} params.feedback_stuff [用 | 分割的 media_id 列表，至多 5 张图片, 可以通过新增临时素材接口上传而得到]
 * @param {String} params.ugc_declare [用户生成内容场景（UGC）信息安全声明]
 * @param {String} params.order_path [订单中心path]
*/
const submitAudit = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.submitAuditUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//查询指定发布审核单的审核状态
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.auditid [提交审核时获得的审核 id]
*/
const getAuditStatus = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.auditid){
			return reslove({code:409,message:'请填写提交审核时获得的审核 id'});
		}
		var options = {
			url:apiUrl.getAuditStatusUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//查询最新一次提交的审核状态
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
const getLatestAuditStatus = function(access_token){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.getLatestAuditStatusUrl + access_token,
			method:"get",
			headers:{"Content-Type":"application/json"},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//小程序审核撤回
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
const undoCodeAudit = function(access_token){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.undoCodeAuditUrl + access_token,
			method:"get",
			headers:{"Content-Type":"application/json"},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//发布已通过审核的小程序
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
const release = function(access_token){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.releaseUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:{},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取可回退的小程序版本
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
const getHistoryVersion = function(access_token){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.getHistoryVersionUrl + access_token,
			method:"get",
			headers:{"Content-Type":"application/json"},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//版本回退
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.app_version [默认是回滚到上一个版本；也可回滚到指定的小程序版本，可通过get_history_version获取app_version]
*/
const appVersion = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.appVersionUrl + access_token + (params.app_version ? ('&app_version=' + params.app_version) : ''),
			method:"get",
			headers:{"Content-Type":"application/json"},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//查询当前设置的最低基础库版本及各版本用户占比
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
const getWeAppSupportVersion = function(access_token){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.getWeAppSupportVersionUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:{},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//设置最低基础库版本
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.version [为已发布的基础库版本号]
*/
const setWeAppSupportVersion = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.version){
			return reslove({code:409,message:'请填写已发布的基础库版本号'});
		}
		var options = {
			url:apiUrl.setWeAppSupportVersionUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//加急审核申请
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.auditid [审核单ID]
*/
const speedUpAudit = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.auditid){
			return reslove({code:409,message:'请填写审核单ID'});
		}
		var options = {
			url:apiUrl.speedUpAuditUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取体验者列表
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
*/
const memberAuth = function(access_token){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		var options = {
			url:apiUrl.memberAuthUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:{
				action:'get_experiencer'
			},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//绑定微信用户为体验者
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.wechatid [微信号]
*/
const bindTester = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.wechatid){
			return reslove({code:409,message:'请填写微信号'});
		}
		var options = {
			url:apiUrl.bindTesterUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//解除绑定体验者
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.wechatid [微信号]
*/
const unbindTester = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.wechatid){
			return reslove({code:409,message:'请填写微信号'});
		}
		var options = {
			url:apiUrl.unbindTesterUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//设置服务器域名
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.action [操作类型,set覆盖,get获取]
 * @param {String} params.requestdomain [request 合法域名；当 action 是 get 时不需要此字段]
 * @param {String} params.wsrequestdomain [socket 合法域名；当 action 是 get 时不需要此字段]
 * @param {String} params.uploaddomain [uploadFile 合法域名；当 action 是 get 时不需要此字段]
 * @param {String} params.downloaddomain [downloadFile 合法域名；当 action 是 get 时不需要此字段]
*/
const modifyDomain = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.action){
			return reslove({code:409,message:'请填写操作类型'});
		}
		if(['set','get'].indexOf(params.action) == -1){
			return reslove({code:409,message:'请填写正确的操作类型'});
		}
		if(params.action == 'set'){
			if(!params.requestdomain){
				return reslove({code:409,message:'请填写request合法域名数组'});
			}
			if(!params.wsrequestdomain){
				return reslove({code:409,message:'请填写socket合法域名数组'});
			}
			if(!params.uploaddomain){
				return reslove({code:409,message:'请填写uploaddomain合法域名数组'});
			}
			if(!params.downloaddomain){
				return reslove({code:409,message:'请填写downloaddomain合法域名数组'});
			}
		}
		var options = {
			url:apiUrl.modifyDomainUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//设置业务域名
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.action [操作类型,set覆盖,get获取]
 * @param {String} params.webviewdomain [小程序业务域名，当 action 参数是 get 时不需要此字段]
*/
const setWebViewDomain = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.action){
			return reslove({code:409,message:'请填写操作类型'});
		}
		if(['set','get'].indexOf(params.action) == -1){
			return reslove({code:409,message:'请填写正确的操作类型'});
		}
		if(params.action == 'set'){
			if(!params.webviewdomain){
				return reslove({code:409,message:'请填写小程序业务域名数组'});
			}
		}
		var options = {
			url:apiUrl.setWebViewDomainUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//设置隐私保护协议
/**
 * 
 * @param {String} access_token [第三方平台接口调用令牌authorizer_access_token]
 * @param {String} params [其他参数]
 * @param {String} params.owner_setting [收集方（开发者）信息配置]
 * @param {String} params.owner_setting.contact_email [信息收集方（开发者）的邮箱地址，4种联系方式至少要填一种]
 * @param {String} params.owner_setting.contact_phone [信息收集方（开发者）的手机号，4种联系方式至少要填一种]
 * @param {String} params.owner_setting.contact_qq [信息收集方（开发者）的qq号，4种联系方式至少要填一种]
 * @param {String} params.owner_setting.contact_weixin [信息收集方（开发者）的微信号，4种联系方式至少要填一种]
 * @param {String} params.owner_setting.notice_method [通知方式，指的是当开发者收集信息有变动时，通过该方式通知用户。这里服务商需要按照实际情况填写，例如通过弹窗或者公告或者其他方式。]
 * @param {String} params.setting_list [要收集的用户信息配置，可选择的用户信息类型参考下方详情]
 * @param {String} params.setting_list.privacy_key [官方的可选值参考下方说明；该字段也支持自定义]
 * @param {String} params.setting_list.privacy_text [是	请填写收集该信息的用途。例如privacy_key=Location（位置信息），那么privacy_text则填写收集位置信息的用途。无需再带上“为了”或者“用于”这些字眼，小程序端的显示格式是为了xxx，因此开发者只需要直接填写用途即可。]
*/
const setPrivacySetting = function(access_token,params){
	return new Promise(function(reslove,reject){
		if(!access_token){
			return reslove({code:409,message:'请填写第三方平台接口调用令牌'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.owner_setting){
			return reslove({code:409,message:'请填写收集方（开发者）信息配置'});
		}
		if(!params.setting_list){
			return reslove({code:409,message:'请填写要收集的用户信息配置'});
		}
		var options = {
			url:apiUrl.setPrivacySettingUrl + access_token,
			method:"post",
			headers:{"Content-Type":"application/json"},
			body:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

/**
 * 初始化工具客户端
 * @author xutao
 * @param    {[String]}                 appId [开发者第三方平台APPID]
 * @param    {[String]}                 encodingAESKey [开发者在第一步填写服务器配置的encodingAESKey]
 * @param    {[String]}                 token [开发者在第一步填写服务器配置的token]
 */
exports.initClient = function (params){
	if(!params){
		return ;
	}
	if(!params.appId){
		return ;
	}
	if(!params.encodingAESKey){
		return ;
	}
	if(!params.token){
		return ;
	}

	appId = params.appId;
	encodingAESKey = params.encodingAESKey;
	token = params.token;
	appsecret = params.appsecret;

	wechatEncrypt = new WechatEncrypt({
		appId: appId,  // 开发者小程序APPID
		encodingAESKey: encodingAESKey,  // 开发者在第一步填写服务器配置的encodingAESKey
		token: token  // 开发者在第一步填写服务器配置的token
	})

	return {
        checkMsg:checkMsg,//验证消息有效性
		encryption:encryption,//加密消息
		decrypt:decrypt,//解密消息
		getComponentAccessToken:getComponentAccessToken,//获取component_access_token
		getPreAuthCode:getPreAuthCode,//获取pre_auth_code(预授权码)
		getAuthUrl:getAuthUrl,//获取授权链接
		getAuthorizerAccessToken:getAuthorizerAccessToken,//使用授权码获取授权信息
		refreshAuthorizerAccessToken:refreshAuthorizerAccessToken,//获取/刷新接口调用令牌
		fastRegisterWeApp:fastRegisterWeApp,//快速注册企业小程序
		getTemplateDraftList:getTemplateDraftList,//获取代码草稿列表
		addToTemplate:addToTemplate,//将草稿添加到代码模板库
		getTemplateList:getTemplateList,//获取代码模板列表
		deleteTemplate:deleteTemplate,//删除指定代码模板
		commit:commit,//上传小程序代码
		getPage:getPage,//获取已上传的代码的页面列表
		getQrcode:getQrcode,//获取体验版二维码
		submitAudit:submitAudit,//提交审核
		getAuditStatus:getAuditStatus,//查询指定发布审核单的审核状态
		getLatestAuditStatus:getLatestAuditStatus,//查询最新一次提交的审核状态
		undoCodeAudit:undoCodeAudit,//小程序审核撤回
		release:release,//发布已通过审核的小程序
		getHistoryVersion:getHistoryVersion,//获取可回退的小程序版本
		appVersion:appVersion,//版本回退
		getWeAppSupportVersion:getWeAppSupportVersion,//查询当前设置的最低基础库版本及各版本用户占比
		setWeAppSupportVersion:setWeAppSupportVersion,//设置最低基础库版本
		speedUpAudit:speedUpAudit,//加急审核申请
		memberAuth:memberAuth,//获取体验者列表
		bindTester:bindTester,//绑定微信用户为体验者
		unbindTester:unbindTester,//解除绑定体验者
		modifyDomain:modifyDomain,//设置服务器域名
		setWebViewDomain:setWebViewDomain,//设置业务域名
		setPrivacySetting:setPrivacySetting,//配置小程序用户隐私保护指引
	};
};