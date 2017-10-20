var vm;
$(document).ready(function () {

    jQuery.ajaxSettings.traditional = true;


    var defaultTime = "5000";
    vm = new Vue({
        el: '#webApp',
        data: {
            flashTime: defaultTime,
            flashOnOrOff: true,
            timerIsOpen: true,
            isLoading: 0,
            lengths: 15,
            stateMap: {
                "0": "待兑奖",
                "1": "兑奖中",
                "2": "已兑奖"
            },
            typeMap: {
                "1": "福彩",
                "2": "体彩",
                "3": "竞彩",
                "4": "单场",
                "5": "高频"
            },
            prizeStateMap: {
                "0": "已分票待兑奖",
                "1": "兑奖中"
            },
            cjs: []
        },
        methods: {
            fetchDashboard: function () {
                dataRefresh()
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

                $("input#get-prizes").on('click', function (event) {
                    if($(this).prop("checked")) {
                        $("#get-prizes-label").text("开");
                    }else {
                        $("#get-prizes-label").text("关");
                    }
                    post(params.prizeSwitchUrl, {
                        "option": 1,
                        "flag": $(this).prop("checked")
                    }, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                            //swal("");
                        } else {
                            noty({text: '设置失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    });
                })
            },
            getStatus: function (state) {
                return vm.statusMap[state];
            },
            getPushState: function (state) {
                return vm.pushStates[state];
            },
            prizeOver: function () {
                commonSwal("是否确认兑奖结束操作?", '', function () {
                    post(params.prizeSwitchUrl, {
                        "option": 2
                    }, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                            //swal("");
                        } else {
                            noty({text: '设置失败：' + data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    });
                });
            },
            refreshPrize: function () {
                commonSwal("是否确认重新兑奖操作?", '', function () {
                    post(params.prizeSwitchUrl, {
                        "option": 3
                    }, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                            //swal("");
                        } else {
                            noty({text: '设置失败：' + data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    });
                });
            },
            /**
             * 标记已兑奖
             * @param cj
             * @param pc
             */
            setPrizeOk: function (cj, pc, ispost) {
                commonSwal(cj+"上的兑奖票是否设置已兑奖?", '', function () {
                    post(params.cjPrizeSetUrl, {
                        "option": 1,
                        "cjnum":   cj,
                        "pcnum":   pc,
                        "ispost":   ispost
                    }, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                            //swal("");
                        } else {
                            noty({text: '设置失败：' + data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    });
                });
            },
            /**
             * 兑奖票重新分发
             * @param cj
             * @param pc
             */
            setPrizeAssign: function (cj, pc, ispost) {
                commonSwal(cj+"上的兑奖票是否重新分发?", '', function () {
                    post(params.cjPrizeSetUrl, {
                        "option": 2,
                        "cjnum":   cj,
                        "pcnum":   pc,
                        "ispost":   ispost
                    }, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                            //swal("");
                        } else {
                            noty({text: '设置失败：' + data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    });
                });
            }
        }
    });

    vm.initStyle();
    vm.fetchDashboard();

    try {
        var table = $('#prizeTableList').DataTable({
            "paging": true,
            "processing": false,
            "serverSide": true,
            "autoWidth": true,
            "searching": false,
            "ordering": false,
            "lengthChange": false,
            "pageLength": vm.lengths,
            "language": {
                "url": "/static/js/plugins/datatables/Chinese.json"
            },
            "dataSrc": "data",
            "ajax": {
                url: params.prizeTableUrl,
                dataType: "json",
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                type: "post",
                data: function (d) {
                    var str = $("input[type='search']#search-ticketid").val();
                    d["sticketid"] = str;
                }
            },
            "columns": [
                {"data": "ticketid"},
                {"data": "state"},
                {"data": "receivetime"},
                {"data": "amount"},
                {"data": "printno"},
                {"data": "typeid"},
                {"data": "pcid"},
                {"data": "cjid"},
                null
            ],
            // 自定义操作列 -1 表示从后往前算
            "columnDefs": [{
                "targets": 1,
                "data": "state",
                "render": function (data, type, row) {
                    return '<span class="label label-success">'+vm.stateMap[data]+'</span>';
                }
            }, {
                "targets": 5,
                "data": "typeid",
                "render": function (data, type, row) {
                    return vm.typeMap[data];
                }
            }, {
                "targets": 8,
                "data": null,
                "defaultContent": '<div class="form-group">'+
                    '<button class="btn btn-default btn-rounded btn-sm edit-refresh" data-placement="top" data-toggle="tooltip" title="" data-original-title="重新兑奖">'+
                    '<span class="fa fa-repeat"></span></button></div>'
            }]
        });
        // 自定义事件, 用于最后一列
        table.on('click', '.edit-success', function () {
            var data = table.row($(this).parents('tr')).data();
        });
        // 加载
        table.on('draw', function () {
        });
        table.on('xhr', function () {
            var panel = $(this).parents(".panel");
        });
        table.on('preXhr.dt',function(){
        });
    } catch (e) {
        alert(e);
    }

    $("input[type='search']#search-ticketid").keydown(function (e) {
        if (e.keyCode != 13) {
            return;
        }
        table.draw();
    });

    /**
     * 定时刷新数据
     */
    function dataRefresh() {
        // 如果跳转到其他页面,则停止此系统
        if (!params.prizeMonitorListUrl) {
            vm.flashOnOrOff = false;
            vm.timerIsOpen = false;
            return;
        }
        vm.timerIsOpen = true;
        mypost(params.prizeMonitorListUrl, {}, function (data) {
            vm.cjs = data.cjs;
            $("span#surplus-count").text(data.surplusCount);
            $("span#surplus-prize").text(data.surplusPrizes);
            $("span#total-count").text(data.sumcount);
            $("span#total-prize").text(data.sumprize);
            if (data.prizeswitch) {
                $("input[type='checkbox']#get-prizes").attr("checked", "true");
                $("#get-prizes-label").text("开");
            }else{
                $("input[type='checkbox']#get-prizes").removeAttr("checked");
                $("#get-prizes-label").text("关");
            }

            if (data) {
                setTimeout(function () {
                    if (vm.flashOnOrOff) {
                        vm.fetchDashboard();
                    }else{
                        vm.timerIsOpen = false
                    }
                }, vm.flashTime);
            }
        }, function(XMLHttpRequest, textStatus, errorThrown) {
            noty({text: '刷新数据失败，可能连接断开了，刷新页面试试', layout: 'topLeft', type: 'warning'});
        });
    }

});