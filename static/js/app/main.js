// load default page
$(document).ready(function () {
    if (typeof params != 'undefined' && params.first) {
        loadPage(params.moduleId, params.url);
    }
});

// 出来History back事件
$(window).hashchange(function (e) {
    reload(window.location.hash.split("#")[1]);
});

// 根据模块ID 加载页面
function loadPage(obj, url) {
    reload(url);
    $("#" + obj).addClass("active");
}

// 加载页面
function reload(url) {
    $("#appContent").load(url);
}

// 加载页面 post
function forward(url, data) {
    $("#appContent").load(url, data);
}

