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
            balanceMap: {},
            flashTime: defaultTime,
            flashOnOrOff: true,
            isLoading: 0,
            statusMap: {
                "0": "未处理",
                "1": "已入池",
                "2": "已送票",
                "3": "出票成功",
                "4": "出票失败"
            }
        },
        methods: {
            initConditions: function () {

                 post(params.listUrl, {}, function (data) {
                     // vm.lotteryName = data.categoryList;
                     // vm.sites = data.data;
                     vm.count = data.count;
                     vm.yct = data.yct;
                     vm.cpt = data.cpt;
                     vm.tst = data.tst;
                 });
            },
            fetchDashboard: function () {
                // 如果跳转到其他页面,则停止此系统
                debugger;
                if (!params.listUrl) {
                    vm.flashOnOrOff = false;
                    return;
                }
                post(params.listUrl, {}, function (data) {
                    /*vm.formatData(data);
                    vm.missingTicketCountMap = data.missingTicketCountMap;
                    vm.balanceMap = data.balanceMap;
                    for (var val in vm.missingTicketCountMap) {
                        vm.labels[val] = vm.getValue(val);
                    }*/
                    debugger;
                    vm.count = data.count;
                    vm.yct = data.yct;
                    vm.cpt = data.cpt;
                    vm.tst = data.tst;
                    if (data) {
                        setTimeout(function () {
                            if (vm.flashOnOrOff) {
                                vm.fetchDashboard();
                            }
                        }, vm.flashTime);
                    }
                });
            },
            formatData: function (data) {
                vm.monitorDatas2 = vm.pushData(UTC2Time(data.gpData));
                vm.monitorDatas3 = vm.pushData(UTC2Time(data.jcData));
                vm.monitorDatas4 = vm.pushData(UTC2Time(data.tcData));
                vm.monitorDatas5 = vm.pushData(UTC2Time(data.fcData));
                setTimeout(function () {
                    if (data.gpPendingData) {
                        vm.pendingTicket(data.gpPendingData, '#monitorDatas2_');
                    }
                    if (data.jcPendingData) {
                        vm.pendingTicket(data.jcPendingData, '#monitorDatas3_');
                    }
                    if (data.tcPendingData) {
                        vm.pendingTicket(data.tcPendingData, '#monitorDatas4_');
                    }
                    if (data.fcPendingData) {
                        vm.pendingTicket(data.fcPendingData, '#monitorDatas5_');
                    }
                }, 500);
            },
            pendingTicket: function (pendingData, id) {
                if (pendingData) {
                    var content = "以下是该站点的积压票的情况: (目前最多显示5条) <br /><br />";
                    var resultMap = {};
                    var resultNum = {};
                    $.each(pendingData, function (index, item) {
                        if (!resultMap[item.siteId]) {
                            resultMap[item.siteId] = [content];
                            resultNum[item.siteId] = 1;
                        }
                        var str = resultNum[item.siteId] + ".[票号]:<span style='color:red'>" + item.ticketId + "</span>, ";
                        str += "[彩种]:<span style='color:red'>" + item.lotteryType + "</span>, ";
                        str += "[当前状态]:<span style='color:red'>" + vm.statusMap[item.ticketStatus] + "</span>, ";
                        str += "[终端号]:<span style='color:red'>" + (!item.printTerminal ? "-" : item.printTerminal) + "</span>, ";
                        var seconds = (new Date().getTime() - item.updateTime) / (1000);
                        var minutes = seconds / 60;
                        str += "[等待]:<span style='color:red'>" + Math.round(minutes) + "分钟 (" + Math.round(seconds) + "秒)</span>, ";
                        str += "[创建时间:" + new Date(item.createTime).format("%H:%M:%S") + ", ";
                        str += "入池时间:" + new Date(item.poolTime).format("%H:%M:%S") + ", ";
                        str += "更新时间:" + new Date(item.updateTime).format("%H:%M:%S") + "]";
                        str += "<a href=\"javascript:trackBack('" + item.printTaskId + "')\" style=\"margin-left: 5px\"><i class=\"fa fa-wrench\"></i>反查</a>";
                        str += "<a href=\"javascript:redelivery('" + item.ticketId + "')\" style=\"margin-left: 5px\"><i class=\"fa fa-wrench\"></i>重出</a><br />";
                        resultMap[item.siteId].push(str);
                        resultNum[item.siteId]++;
                    });
                    for (var siteId in resultMap) {
                        $(id + siteId).webuiPopover({content: resultMap[siteId].join(" ")});
                    }
                    for (var siteId in resultMap) {
                        $(id + siteId + "_terminal").webuiPopover({
                            type: 'async',
                            url: params.getUpdateTimeUrl + "?siteId=" + siteId,
                            content: function (result) {
                                var content = "";
                                if (result) {
                                    content = "以下是该站点终端的出票情况: (离线的不在列表中显示) <br /><br />";
                                    $.each(result.data, function (index, item) {
                                        content += (index + 1) + ".[终端号]:<span style='color:#ff8d55'>" + item.terminalId + "</span>, ";
                                        content += "[终端余额]:<span style='color:red'>" + item.balance + "</span>, ";
                                        content += "[终端IP]:<span style='color:red'>" + item.ipAddress + "</span>, ";
                                        if (item.updateTime) {
                                            var seconds = (new Date().getTime() - item.updateTime) / (1000);
                                            var minutes = seconds / 60;
                                            content += "[距离上次出票]:<span style='color:red'>" + Math.round(minutes) + "分钟 (" + Math.round(seconds) + "秒)</span>, ";
                                            content += "[最后送票时间]:<span style='color:red'>" + new Date(item.createTime).format("%H:%M:%S") + "</span>, ";
                                            content += "[最后更新时间]:<span style='color:red'>" + new Date(item.updateTime).format("%H:%M:%S") + "</span><br />";
                                        } else {
                                            content += "[该彩机3个小时之内没有出过票]<br />";
                                        }

                                    });
                                }
                                return content;
                            }
                        });
                    }
                }
            },
            pushData: function (data) {
                var value = [];
                if (data) {
                    $.each(data, function (index, item) {
                        if ($("#searchForm input[value='" + item.siteId + "'] ").is(':checked')) {
                            var key = item["siteId"];
                            // 如果当前站点隐藏了，就不显示出来
                            if (key && key != "") {
                                item["balance"] = vm.balanceMap[key];
                                value.push(item);
                            }

                        }
                    });
                }
                return value;
            },
            getValue: function (lotteryType) {
                var returnHtml = "未入池票数: ";
                if (vm.missingTicketCountMap[lotteryType].count > 0) {
                    returnHtml += "<span style='color: red'>" + vm.missingTicketCountMap[lotteryType].count + "</span>";
                } else {
                    returnHtml += "0";
                }
                returnHtml += "&nbsp;金额: ";
                if (vm.missingTicketCountMap[lotteryType].price > 0) {
                    returnHtml += "<span  style='color: red'>" + vm.missingTicketCountMap[lotteryType].price + "</span>";
                } else {
                    returnHtml += "0";
                }
                return returnHtml;
            }
        }
    });

    vm.initConditions();
    //监听加载样式和列表
    //vm.$watch('sites', function () {
        checkboxEnableStyle();
        vm.fetchDashboard();
    //});

    /**
     * 设置 radio 刷新频率
     */
    $('input.reflash').on('ifChecked', function (event) {
        if (parseInt(this.value) > 0) {
            // clearInterval(monitor);
            if (this.value == '10000') {
                $('#noflash, #flash5').iCheck('uncheck');
            } else {
                $('#noflash, #flash10').iCheck('uncheck');
            }

            vm.flashTime = this.value;
            vm.flashOnOrOff = true;
        } else {
            $('#flash5, #flash10').iCheck('uncheck');
            vm.flashTime = defaultTime;
            vm.flashOnOrOff = false;
        }
    });

    /**
     * 初始化 radio checkbox 点击事件
     */
    function checkboxEnableStyle() {
        if ($(".iradio").length > 0) {
            $(".iradio").iCheck({
                checkboxClass: 'icheckbox_minimal-grey',
                radioClass: 'iradio_minimal-grey'
            });
        }
    };

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


    /**
     * 查找需要ajax发送的数据
     *
     */
    function getMonitorParams() {
        var dataSelected = {};
        var siteIds = [];
        var lotteryIds = [];
        $("#searchForm input[name='siteIds']:checked").each(function () {
            siteIds.push($(this).val());
        });
        dataSelected["siteIds"] = siteIds;

        $("#searchForm input[name='lotteryIds']:checked").each(function () {
            lotteryIds.push($(this).val());
        });
        dataSelected["lotteryIds"] = lotteryIds;
        return dataSelected;
    };

});
/**
 * 反查
 * @returns
 */
function trackBack(pkSid) {
    commonSwal("是否确定要反查?", '', function () {
        post(params.updateTimeUrl, {
            "pkSid": pkSid
        }, function (data) {
            showResult(vm, data);
            if (data && data.code == Constant.SUCCESS) {
                swal("反查成功。");
            } else {
                swal("反查失败, 错误消息: " + data.message);
            }
        });
    });
}

function redelivery(ticketId) {
    commonSwal("是否确定要重新出票?", '', function () {
        post(params.redeliveryUrl, {
            "ticketId": ticketId
        }, function (data) {
            showResult(vm, data);
            if (data && data.code == Constant.SUCCESS) {
                swal("重出成功。");
            } else {
                swal("重出失败, 错误消息: " + data.message);
            }
        });
     });
}




