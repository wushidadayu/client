var vm;
$(document).ready(function () {

    document.title = "票务监控";
    jQuery.ajaxSettings.traditional = true;


    var defaultTime = "5000";
    vm = new Vue({
        el: '#webApp',
        data: {
            msg: "",
            count: 0,
            yct: [],
            cpt: [],
            tst: [],
            yctLen: 0,
            cptLen: 0,
            tstLen: 0,
            flashTime: defaultTime,
            flashOnOrOff: true,
            timerIsOpen: true,
            isLoading: 0,
            statusMap: {
                "1000": "未分票",
                "1001": "分到PC",
                "1002": "分到彩机",
                "1003": "出票中",
                "1004": "异常",
                "1005": "已出票",
                "1006": "对比失败",
                "102": "成功",
                "104": "失败",
                "105": "限号"
            },
            pclist: [],
            ycFlash: true,
            cpFlash: true,
            tsFlash: true,
            ticketInfo: {}
        },
        methods: {
            initConditions: function () {
                //dataRefresh(false)
            },
            fetchDashboard: function () {
                dataRefresh(true)
            },
            /**
             * 设置票状态
             * @param opt 0:设置成功，1:设置失败，2:设置限号，3:设置重出， 5:重新对比
             * @param tickets 票ID，可传数组，可传单个字符串
             */
            setTicketState: function (opt, tickets) {
                var typeStr = typeof tickets
                if (typeStr != "object") {
                    tickets = [tickets]
                }
                if (tickets.length < 1) {
                    return
                }
                commonSwal("是否确认操作?", '', function () {
                    post(params.operateUrl, {
                        "option": opt,
                        "ticketList": tickets
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

                //全选CheckBox初始化
                $("input[type='checkbox'].master[value='全选']").on('ifChecked ifUnchecked', function (event) {
                    var cbs = $("input[type='checkbox'].slave[name='"+this.name+"']");
                    if(event.type == 'ifChecked'){
                        cbs.iCheck('check');
                    }else{
                        cbs.iCheck('uncheck');
                    }
                });

                //列表刷新按钮初始化
                $("input.refreshButton").on('click', function (event) {
                    if($(this).prop("checked")){
                        if (this.id == 'ycRefresh') {
                            $("#yc-refresh-label").text("开");
                            vm.ycFlash = true;
                        }else if (this.id == 'cpRefresh') {
                            $("#cp-refresh-label").text("开");
                            vm.cpFlash = true;
                        }else if (this.id == 'tsRefresh') {
                            $("#ts-refresh-label").text("开");
                            vm.tsFlash = true;
                        }
                    }else if($(this).prop("checked")==false){
                        if (this.id == 'ycRefresh') {
                            $("#yc-refresh-label").text("关");
                            vm.ycFlash = false;
                        }else if (this.id == 'cpRefresh') {
                            $("#cp-refresh-label").text("关");
                            vm.cpFlash = false;
                        }else if (this.id == 'tsRefresh') {
                            $("#ts-refresh-label").text("关");
                            vm.tsFlash = false;
                        }
                    }
                });
                
                //取票推送开关事件绑定
                $("input[type='checkbox'].tickets-flag").on('click', function (event) {
                    var opt;
                    if(this.id == 'get-tickets') {
                        opt = 1;
                        if($(this).prop("checked")){
                            $("#get-tickets-label").text("开");
                        }else {
                            $("#get-tickets-label").text("关");
                        }
                    }else if (this.id == 'push-tickets') {
                        opt = 2;
                        if($(this).prop("checked")){
                            $("#push-tickets-label").text("开");
                        }else {
                            $("#push-tickets-label").text("关");
                        }
                    }else{
                        return
                    }
                    post(params.getpushflagUrl, {
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

                $("#pc-refresh").change(function () {
                    var selected = $('#pc-refresh').val();
                    if(selected == '_没有选项') {
                        return;
                    }
                    var checkboxs = $("input[type='checkbox'].slave[name='ycTicketid']:checked");
                    var arrticket = [];
                    for (var i=0; i<checkboxs.length; i++){
                        arrticket.push(checkboxs[i].value);
                    }
                    if (arrticket.length == 0) {
                        return;
                    }
                    commonSwal("是否重出到"+selected+"?", '', function () {
                        post(params.refreshForPc, {
                            "pc": selected,
                            "ticketList": arrticket
                        }, function (data) {
                            if (data && data.code == Constant.SUCCESS) {
                                noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                            } else {
                                noty({text: '设置失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                            }
                        });
                    });
                });
            },
            /**
             * 批量操作
             * @param opt 0:设置成功，1:设置失败，2:设置限号，3:设置重出
             * @param str 要查找CheckBox的name属性值
             */
            BatchSetTicket: function (opt, str) {
                var checkboxs = $("input[type='checkbox'].slave[name='"+str+"']:checked");
                var arrticket = [];
                for (var i=0; i<checkboxs.length; i++){
                    arrticket.push(checkboxs[i].value);
                }
                vm.setTicketState(opt, arrticket)
            },
            getStatus: function (state) {
                return vm.statusMap[state];
            },
            getPushState: function (state) {
                return vm.statusMap[state];
            },
            modalLoad: function (orderid) {
                post(params.ticketinfoUrl, {
                    "orderid": orderid
                },function (data) {
                    vm.ticketInfo = data;
                });
            }
        }
    });

    vm.initStyle();
    vm.initConditions();
    vm.fetchDashboard();

    /**
     * 定时刷新数据
     * @param b false:单次执行定时刷新 true:定时刷新执行
     */
    function dataRefresh(b) {
        // 如果跳转到其他页面,则停止此系统
        if (!params.listUrl) {
            vm.flashOnOrOff = false;
            vm.timerIsOpen = false;
            return;
        }
        vm.timerIsOpen = true;
        mypost(params.listUrl, {}, function (data) {
            vm.count = data.count;
            vm.yctLen = data.yclen;
            vm.cptLen = data.cplen;
            vm.tstLen = data.tslen;

            vm.pclist = data.pclist;
            $('#pc-refresh').selectpicker('refresh');//重绘下拉框
            $('#pc-refresh').selectpicker('val', '_没有选项');


            if (vm.ycFlash){
                vm.yct = data.yct;
                $("input[type='checkbox']#ycSelectedAll").iCheck('uncheck')
            }
            if (vm.cpFlash){
                vm.cpt = data.cpt;
                $("input[type='checkbox']#cpSelectedAll").iCheck('uncheck')
            }
            if (vm.tsFlash){
                vm.tst = data.tst;
                $("input[type='checkbox']#tsSelectedAll").iCheck('uncheck')
            }

            //设置报警声音
            var audio = document.getElementById("audio");
            if (vm.yct != null && audio.paused) {
                audio.play();
            }
            if (vm.yct == null && !audio.paused) {
                audio.pause();
            }

            //取票开关标志
            if (data.get_ticket_flag){
                $("input[type='checkbox']#get-tickets").attr("checked");
                $("#get-tickets-label").text("开");
            }else{
                $("input[type='checkbox']#get-tickets").removeAttr("checked");
                $("#get-tickets-label").text("关");
            }

            //取票开关标志
            if (data.push_ticket_flag){
                $("input[type='checkbox']#push-tickets").attr("checked", "true");
                $("#push-tickets-label").text("开");
            }else{
                $("input[type='checkbox']#push-tickets").removeAttr("checked");
                $("#push-tickets-label").text("关");
            }
            setTimeout(function () {
                if ($("input[type='checkbox'].slave").length > 0){
                    $("input[type='checkbox'].slave").iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    })
                }
            },100);

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

