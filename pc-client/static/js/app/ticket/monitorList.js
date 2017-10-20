var vm;
$(document).ready(function () {

    jQuery.ajaxSettings.traditional = true;


    var defaultTime = "5000";
    vm = new Vue({
        el: '#webApp',
        data: {
            msg: "",
            flashTime: defaultTime,
            flashOnOrOff: true,
            timerIsOpen: true,
            isLoading: 0,
            modeMap: {
                "0": "不操作",
                "1": "出票",
                "2": "兑奖",
            },
            stateMap: {
                "0": "停止",
                "1": "启动",
            },
            cjinfo: {
                printflag: false,
                cjs: [],
                typecount: {},
            },
            keycjname: ""
        },
        methods: {
            fetchDashboard: function () {
                dataRefresh(true)
            },
            //按typeIds批量重出彩票
            rePrintTicket: function(typeIds){
                var ticketName=null;
                var tNum=0;
                if(typeIds.length==1){
                    if(typeIds[0]==1 && this.cjinfo.typecount.fucai!=0){
                        ticketName="福彩";
                        tNum=this.cjinfo.typecount.fucai;
                    }else if(typeIds[0]==2 && this.cjinfo.typecount.ticai!=0){
                        ticketName="体彩";
                        tNum=this.cjinfo.typecount.ticai;
                    }else if(typeIds[0]==3 && this.cjinfo.typecount.jincai!=0){
                        ticketName="福彩";
                        tNum=this.cjinfo.typecount.jincai;
                    }else if(typeIds[0]==4 && this.cjinfo.typecount.danchang!=0){
                        ticketName="单场";
                        tNum=this.cjinfo.typecount.danchang;
                    }else if(typeIds[0]==5 && this.cjinfo.typecount.gaoping!=0){
                        ticketName="高频";
                        tNum=this.cjinfo.typecount.gaoping;
                    }else{
                        return;
                    }

                }else if(typeIds.length==5){
                    ticketName="全部";
                }else{
                    return;
                }

                commonSwal("待出票"+ticketName+"是否重新出票?", '', function () {
                    mypost(params.rePrintTicketUrl,{"TypeIds":typeIds},function(data){
                        if (data && data.code == Constant.SUCCESS) {
                            noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        } else {
                            noty({text: '设置失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    })
                });

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

                //设置 radio 刷新频率
                $('input.reflash').on('ifChecked', function (event) {
                    if (parseInt(this.value) > 0) {
                        //clearInterval(monitor);
                        if (this.value == '10000') {
                            $('#noflash,#flash5').iCheck('uncheck');
                        } else {
                            $('#noflash,#flash10').iCheck('uncheck');
                        }
                        vm.flashTime = this.value;
                        vm.flashOnOrOff = true;
                        if (!vm.timerIsOpen) {
                            dataRefresh(true);
                        }
                    } else {
                        $('#flash5,#flash10').iCheck('uncheck');
                        vm.flashTime = defaultTime;
                        vm.flashOnOrOff = false;
                    }
                });
                
                //取票推送开关事件绑定
                $("input[type='checkbox'].tickets-flag").on('click', function (event) {
                    var opt;
                    if(this.id == 'print-tickets') {
                        opt = 1;
                        if($(this).prop("checked")){
                            $("#print-tickets-label").text("开");
                        }else {
                            $("#print-tickets-label").text("关");
                        }
                    }else{
                        return
                    }
                    post(params.cjprintflagUrl, {
                        "option": opt,
                        "flag": $(this).prop("checked")
                    }, function (data) {
                        //showResult(vm, data);
                        if (data && data.code == Constant.SUCCESS) {
                            noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                            //swal("");
                        } else {
                            noty({text: '设置失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    });
                });
            },
            /**
             * 彩机列表操作
             * opt: 1.启动停止开关  2.回送
             */
            cjOperate: function (cjname, opt, ticketid) {
                post(params.cjoperateUrl, {
                    "cjname": cjname,
                    "opt": opt,
                    "ticketid": ticketid
                }, function (data) {
                    if (data && data.code == Constant.SUCCESS) {
                        noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        //swal("");
                    } else {
                        noty({text: '设置失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }
                });
            },
            batchSet: function (opt) {
                var cjnames = [];
                for(var i = 0; i < vm.cjinfo.cjs.length; i++) {
                    cjnames.push(vm.cjinfo.cjs[i].name);
                }
                if (cjnames.length == 0) {
                    return;
                }
                if (opt == 0) {
                    commonSwal("是否全部停止?", '', function () {
                        vm.cjswitch(cjnames, 0);
                    });
                }else if (opt == 1) {
                    commonSwal("是否全部启动?", '', function () {
                        vm.cjswitch(cjnames, 1);
                    });
                }
            },
            /**
             * 设置彩机状态
             * @param cjnames
             * @param opt
             */
            cjswitch: function(cjnames, opt) {
                var typeStr = typeof cjnames
                if (typeStr != "object") {
                    cjnames = [cjnames]
                }
                if (cjnames.length < 1) {
                    return
                }
                post(params.cjswitchUrl, {
                    "cjname": cjnames,
                    "opt": opt
                }, function (data) {
                    if (data && data.code == Constant.SUCCESS) {
                        noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                    } else {
                        noty({text: '设置失败：' + data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }
                })
            },
            modalLoad: function (cjname) {
                vm.keycjname = cjname
                $("#keyboard-info").attr("class", "alert")
                $("#keyboard-info-text").text(" ")
            },
            sendKeyBoard: function(cjname, key) {
                post(params.cjsendkeyboardUrl, {
                    "cjname": cjname,
                    "key": key
                }, function (data) {
                    if (data && data.code == Constant.SUCCESS) {
                        $("#keyboard-info").attr("class", "alert alert-success")
                        $("#keyboard-info-text").text("发送成功")
                        //swal("");
                    } else {
                        $("#keyboard-info").attr("class", "alert alert-danger")
                        $("#keyboard-info-text").text("发送失败")
                    }
                })
            }
        }
    });

    vm.initStyle();
    vm.fetchDashboard();

    /**
     * 定时刷新数据
     * @param b false:单次执行定时刷新 true:定时刷新执行
     */
    function dataRefresh(b) {
        // 如果跳转到其他页面,则停止此系统
        if (!params.cjlistUrl) {
            vm.flashOnOrOff = false;
            vm.timerIsOpen = false;
            return;
        }
        vm.timerIsOpen = true;
        mypost(params.cjlistUrl, {}, function (data) {
            vm.cjinfo = data

            // //设置报警声音
            // var audio = document.getElementById("audio");
            // if (vm.yct != null && audio.paused) {
            //     audio.play();
            // }
            // if (vm.yct == null && !audio.paused) {
            //     audio.pause();
            // }

            //取票开关标志
            if (data.printflag){
                $("input[type='checkbox']#print-tickets").attr("checked");
                $("#get-tickets-label").text("开");
            }else{
                $("input[type='checkbox']#print-tickets").removeAttr("checked");
                $("#get-tickets-label").text("关");
            }

            if (data && b) {
                setTimeout(function () {
                    if (vm.flashOnOrOff) {
                        vm.fetchDashboard(b);
                    }else{
                        vm.timerIsOpen = false
                    }
                }, vm.flashTime);
            }
        }, function(XMLHttpRequest, textStatus, errorThrown) {
            noty({text: '刷新数据失败，可能连接断开了，刷新页面试试', layout: 'topLeft', type: 'warning'});
        });
    }

    /**
     * 显示面板
     *
     * @param value
     */
    function showPanel(value) {
        $("#monitor-" + value).css("display", "inline");
    }

    /**
     * 隐藏面板
     * @param value
     */
    function hidePanel(value) {
        $("#monitor-" + value).css("display", "none");
    }

    $(".panel-collapse").on("click", function () {
        $(this).parents(".dropdown").removeClass("open");
        return false;
    });

});

