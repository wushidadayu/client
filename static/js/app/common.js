/**
 * 设置查询参数
 * @param formId
 * @param d
 */
function setParams(formId, d) {
    var params = $("#" + formId).serializeArray();
    $.each(params, function (index, obj) {
        var key = obj["name"];
        var value = obj["value"];
        d[key] = value;
    });
}

function successMsg(div, msg) {
    $(div).removeClass("alert-danger").addClass("alert-success");
    $(div + " span").html(msg);
    $(div).show();
};

function errorMsg(div, msg) {
    $(div).removeClass("alert-success").addClass("alert-danger");
    $(div + " span").html(msg);
    $(div).show();
};

function loading() {
    var panel = $("#webApp");
    panel_refresh(panel);
}

function unloading() {
    loading();
}

function commonSwal(title, text, callback) {
    swal({
        title:title,
        text: text,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText:"取消",
        confirmButtonText: '确认',
        allowOutsideClick:"true"
    },function(isConfirm) {
        if (isConfirm) {
            callback();
        }
    });
}

/**
 *
 * @param vm
 * @param data
 * @param callback 成功后的回调函数
 */
function showResult(vm, data, callback) {
    if (data) {
        if (data.code == Constant.SUCCESS) {
            successMsg(".alert");
            if (callback && typeof(callback) === 'function') {
                callback();
            }
        } else {
            errorMsg(".alert");
        }
        vm.msg = data.message;
        setTimeout(function () {
            $(".alert").hide();
        }, 5000);
    }
}

// 注销
function logout() {
    // form validation
    $.ajax({
        url: "/doLogout",
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "post",
        data: {},
        success: function (data) {
            window.location.href = "/login";
        }
    });
}

// 带提示框的注销
function logoutWithNotification() {
    noty({
        text: '你真的确定退出吗?',
        layout: 'topRight',
        buttons: [
            {
                addClass: 'btn btn-success btn-clean', text: '确定', onClick: function ($noty) {
                $noty.close();
                // form validation
                $.ajax({
                    url: "/doLogout",
                    dataType: "json",
                    contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                    type: "post",
                    data: {},
                    success: function (data) {
                        window.location.href = "/login";
                    }
                });

            }
            },
            {
                addClass: 'btn btn-danger btn-clean', text: '取消', onClick: function ($noty) {
                $noty.close();
            }
            }
        ]
    })
}

/**
 * 显示弹出消息
 * @param msg
 */
function showPopMsg(msg) {
    noty({
        text: msg,
        layout: 'topCenter',
        type: 'error',
        timeout: true,
        animation: {
            open: {opacity: 'toggle'},
            close: {height: 'toggle'},
            easing: 'swing',
            speed: 3000
        },
    });
}

/**
 * Ajax 核心方法
 * @param url
 * @param data
 * @param type
 * @param operation
 */
function ajax(url, data, type, operation) {
    $.ajax({
        url: url,
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: type,
        data: data,
        success: operation
    });
};

/**
 * Post 方法
 * @param url
 * @param data
 * @param operation
 */
function post(url, data, operation) {
    ajax(url, data, "post", operation);
};

/**
 * Get 方法
 * @param url
 * @param data
 * @param operation
 */
function get(url, data, operation) {
    ajax(url, data, "get", operation);
};


/**
 * 得到默认的表格
 * @param id
 * @returns {jQuery}
 */
function getDefaultDataTable(id) {
    var config = {
        "paging": true,
        "processing": false,
        "serverSide": false,
        "autoWidth": true,
        "searching": false,
        "ordering": false,
        "lengthChange": false,
        "pageLength": 15,
        "destroy": true,
        "language": {
            "url": "/assets/js/plugins/datatables/Chinese.json"
        }
    };
    return $('#' + id).DataTable(config);
}

/**
 * 日期转换
 * @param data
 * @constructor
 */
function UTC2Time(data) {
    if (data) {
        $.each(data, function (index, item) {
            if (item.printDeadline != null) {
                item.printDeadline = new Date(item.printDeadline).format("%Y-%m-%d %H:%M:%S");
            }
        })
        return data;
    } else {
        return [];
    }
}


function enableValidation(validationForm) {
    $(validationForm).validationEngine();
    $(validationForm + ' input').attr('data-prompt-position', 'bottomLeft');
    $(validationForm + ' input').data('promptPosition', 'bottomLeft');
    $(validationForm + ' textarea').attr('data-prompt-position', 'bottomLeft');
    $(validationForm + ' textarea').data('promptPosition', 'bottomLeft');
    $(validationForm + ' select').attr('data-prompt-position', 'bottomLeft');
    $(validationForm + ' select').data('promptPosition', 'bottomLeft');
    $(validationForm + ' radio').attr('data-prompt-position', 'bottomLeft');
    $(validationForm + ' radio').data('promptPosition', 'bottomLeft');
}