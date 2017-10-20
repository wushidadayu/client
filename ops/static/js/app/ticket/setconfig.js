/**
 * Created by sunconglin on 2017-6-24.
 */
var vm;
$(document).ready(function () {
    document.title = "系统设置"

    vm = new Vue({
        el: "#webApp",
        data: {
            lotteryClass: {},
            defConfigInfo: {}

        },
        methods: {
            initLoad: function () {
                mypost(params.configInfoLoadUrl, {}, function (data) {
                    vm.lotteryClass = data.lotteryclass;
                    setTimeout(function () {
                        $('#def-printtype').selectpicker('refresh');
                        $('#def-prizetype').selectpicker('refresh');
                        $('#def-printtype').selectpicker('val', vm.defConfigInfo.printtype);
                        $('#def-prizetype').selectpicker('val', vm.defConfigInfo.prizetype);
                    }, 500);
                    vm.defConfigInfo = data.defconfig;
                })
            },
            saveInfo: function () {
                var tabid = $('div.tab-pane.active').attr("id");
                if (tabid == "tab-defconfig") {
                    vm.defEdit();
                }else if (tabid == "tab-paramconfig") {

                }
            },
            /**
             * 基本设置修改
             */
            defEdit: function () {
                // if ( vm.sname == undefined || vm.sname == ''
                //     || vm.keyid == undefined || vm.keyid == ''
                //     || vm.saddress == undefined || vm.saddress == '') {
                //     noty({text: '信息不能有空', layout: 'topCenter', type: 'error', timeout: 2000});
                //     return
                // }
                if (vm.defConfigInfo.sno <= 0) {
                    noty({text: '信息填写有误', layout: 'topCenter', type: 'error', timeout: 2000});
                    return
                }
                vm.defConfigInfo.printtype = $('#def-printtype').selectpicker('val');
                vm.defConfigInfo.prizetype = $('#def-prizetype').selectpicker('val');
                mypost(params.configInfoDefEditUrl, vm.defConfigInfo, function (data) {
                    if (data && data.code == Constant.SUCCESS) {
                        noty({text: '修改成功', layout: 'topCenter', type: 'success', timeout: 2000});
                    } else {
                        noty({text: '修改失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '修改失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                });
            },
            refreshVendors:function () {
                commonSwal("确认更新供应商记录?", '', function () {
                    get(params.reflashVendorsUrl, {}, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            noty({text: '更新成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        } else {
                            noty({text: '更新失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '更新失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                });
            }
        }
    });
    vm.initLoad();
});