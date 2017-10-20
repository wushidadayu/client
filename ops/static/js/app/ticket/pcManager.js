/**
 * Created by sunconglin on 2017-6-15.
 */
var vm;
$(document).ready(function () {

    document.title = "PC管理";
    jQuery.ajaxSettings.traditional = true;

    vm = new Vue({
        el: '#webApp',
        data: {
            pcl: [],
            isLoading: 0,
            onlineMap: {
                "0": "离线",
                "1": "在线"
            },
            stateMap: {
                "0": "停止",
                "1": "出票"
            },
            amountflagMap: {
                false: "停用",
                true: "启用"
            },
            printmodeMap: {
                "1": "键盘",
                "2": "扫描/键盘"
            },
            lotteryClass: {},
            pcInfo: {}
        },
        methods: {
            initConditions: function () {
                refreshData()
            },
            /**
             * 初始化 radio checkbox 点击事件
             */
            initStyle: function () {
                if ($(".iradio").length > 0) {
                    $(".iradio").iCheck({
                        radioClass: 'iradio_minimal-grey'
                    });
                }
            },
            /**
             * 加载PC修改模态框
             * @param id
             */
            loadPcInfoMode: function (id) {
                mypost(params.pcinfoUrl, {"id": id}, function (data) {
                    $('#pcedit-printmode').selectpicker('deselectAll');
                    $('#pcedit-printmode').selectpicker('refresh');//重绘下拉框
                    $('#pcedit-printtype').selectpicker('deselectAll');
                    $('#pcedit-printtype').selectpicker('refresh');
                    vm.pcInfo = data;
                    //vm.pcInfo.printmode = vm.printmodeMap["2"];
                    $('#pcedit-printmode').selectpicker('val', vm.pcInfo.printmode);
                    $('#pcedit-printtype').selectpicker('val', vm.pcInfo.printtype);
                    $("#modalPcEdit").modal('show');
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '加载失败', layout: 'topCenter', type: 'error', timeout: 2000});
                    vm.pcInfo = {};
                    $("#modalPcEdit").modal('hide');
                });
            },
            /**
             * 关闭PC修改模态框
             */
            closePcInfoMode: function () {
                vm.pcInfo = {};
                $("#modalPcEdit").modal('hide');
            },
            /**
             * 修改PC数据
             */
            editPcInfo: function () {
                if (vm.pcInfo.id == 0){
                    return;
                }
                if (vm.pcInfo.amountleft < 0 || vm.pcInfo.amountright < 0 || vm.pcInfo.amountleft > vm.pcInfo.amountright) {
                    alert("请输入有效金额范围");
                    return;
                }
                vm.pcInfo.printmode = $('#pcedit-printmode').val();
                vm.pcInfo.printtype = $('#pcedit-printtype').val();
                mypost(params.pceditUrl, vm.pcInfo, function (data) {
                    if (data && data.code == Constant.SUCCESS) {
                        vm.closePcInfoMode();
                        refreshData();
                        noty({text: '修改成功', layout: 'topCenter', type: 'success', timeout: 2000});
                    } else {
                        noty({text: '修改失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '修改失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                });
            },
            /**
             * 删除PC
             * @param id
             */
            pcDelete: function (id) {
                commonSwal("是否删除该PC?", '', function () {
                    mypost(params.pcdeleteUrl, {"id": id}, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            refreshData();
                            noty({text: '删除成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        } else {
                            noty({text: '删除失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '删除失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                });
            },
            /**
             * 添加PC
             */
            pcInsert: function () {
                var str = $("#addpc-num").val();
                if (str == "") {
                    return;
                }
                var num = Number(str);
                if (num <= 0 || num > 999) {
                    alert("请输入有效数字");
                    $("#addpc-num").val("");
                    return;
                }
                commonSwal("是否添加PC?", '', function () {
                    mypost(params.pcinsertUrl, {"num": num}, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            refreshData();
                            noty({text: '添加成功', layout: 'topCenter', type: 'success', timeout: 2000});
                            $("#addpc-num").val(num+1);
                        } else {
                            noty({text: '添加失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                            $("#addpc-num").val("");
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '添加失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                });
            }
        }
    });

    vm.initStyle();
    vm.initConditions();
    $(".panel-refresh").on("click",function(){
        refreshData();
    });


    function refreshData(){
        post(params.pclistUrl, {}, function (d) {
            vm.pcl = d.pcl;
            vm.lotteryClass = d.lotteryClass;
        })
    }
});

