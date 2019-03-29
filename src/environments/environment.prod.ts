
// export const environment = {
//   production: true,
//   server:'http://10.0.1.26:88/'
// };

//针对于单点登录
//net
// export const environment = {
//   debounceTime:500,
//   production: true,
//   server:'./../dbomsapi/api/'
// };
// export const environment_java ={
//   debounceTime:500,
//   production: true,
//   server:'./../dboms/dbomsapi/'
// }

export const dbomsPath = '/dboms/';

export const APIAddress='http://10.0.1.85:88';//服务器接口IP地址
//export const APIAddress='http://10.0.17.132:8181';//服务器接口IP地址

export const environment = {
  debounceTime:500,
  production: true,
  server:'./api/'
};
export const environment_java ={
  debounceTime:500,
  production: true,
  server:'./dbomsapi/'
}

export const environment_crm ={
  debounceTime:500,
  production: true,
  server:'./EBCrm/'
}

//选人 由于java选人接口问题  现在切换到.NET选人接口
//searchUrlPattern:environment_java.server+"persons"
export const PersonAPIConfig = {
	searchUrlPattern:environment.server+"persons"
}
