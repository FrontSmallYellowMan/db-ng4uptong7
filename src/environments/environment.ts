// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const dbomsPath = "/";

export const APIAddress = "http://10.0.1.26:88"; //服务器接口IP地址

//net
export const environment = {
    debounceTime: 500,
    production: false,
    server: "/api/"
};

export const environment_java = {
    debounceTime: 500,
    production: false,
    server: "/dbomsapi/"
};

export const environment_crm = {
    debounceTime: 500,
    production: false,
    server: "/EBCrm/"
};

//选人 由于java选人接口问题  现在切换到.NET选人接口
//searchUrlPattern:environment_java.server+"persons"
export const PersonAPIConfig = {
    searchUrlPattern: environment_java.server + "persons"
    // searchUrlPattern: environment.server + "persons"
};
