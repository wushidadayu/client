$(document).ready(function () {

    document.title = "管理员详情";

    var vm = new Vue({
        el: '#pageView',
        data: {
            msg: ""
        },
        methods: {
            returnList: function () {
                reload(params.backUrl);
            },
            login: function () {
                // form validation
                successMsg(".alert");
                vm.msg = "正在登陆请稍后...";
                $.ajax({
                    url: params.loginUrl,
                    dataType: params.dataType,
                    contentType: params.contentType,
                    type: params.type,
                    data: $("#loginForm").serializeArray(),
                    success: function (data) {
                        if (data) {
                            if (data.code == Constant.SUCCESS) {
                                successMsg(".alert");
                                setTimeout(function () {
                                    window.location.href = "/";
                                }, 2000);
                            } else {
                                errorMsg(".alert");
                            }
                            vm.msg = data.message;
                        }
                    }
                });
            }
        }
    })

});
