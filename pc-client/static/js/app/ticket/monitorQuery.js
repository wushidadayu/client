$(document).ready(function () {

    jQuery.ajaxSettings.traditional = true;

    var siteMap = {};
    var vendorMap = {};
    var codeMap = {};
    var gameMap = {};
    var pkSid = {};
    var defaultValue = "--";

    //加载时间
    jeDate({
        dateCell: ".datepicker",
        format: "YYYY-MM-DD",
        isinitVal: false, //显示时间
        isTime: false,
        festival: true,//显示节日
        okfun: function (val) {
            $(this.dateCell).trigger('change');
        },
        choosefun: function (val) {
            $(this.dateCell).trigger('change');
        }
    });

    var table = null;
    var vm = null;
    try {

        vm = new Vue({
            el: '#webApp',
            data: {
                allName: {},
                selected: "",
                ticketStartTime: "",
                ticketEndTime: "",
                statusType: 0,
                winStatusType: 0,
                prizeCount: {
                    totalCount: 0,
                    price: 0,
                    deservePrize: 0,
                    actualPrize: 0
                },
                msg: "",
                count: "0",
                selectedCount: "0",
                statusMap: [
                    {"key": "0", "value": "未处理", "style": "default"},
                    {"key": "1", "value": "已入池", "style": "warning"},
                    {"key": "2", "value": "已送票", "style": "warning"},
                    {"key": "3", "value": "出票成功", "style": "success"},
                    {"key": "4", "value": "出票失败", "style": "danger"}
                ],
                winMap: [
                    {"key": "0", "value": "未处理", "style": "warning"},
                    {"key": "1", "value": "兑奖中", "style": "default"},
                    {"key": "2", "value": "已兑奖", "style": "success"}
                ],
                errorMap: [
                    {"key": "0", "value": "正常", "style": "success"},
                    {"key": "1", "value": "多出票", "style": "danger"},
                    {"key": "2", "value": "错票", "style": "danger"}
                ],
                winStatusMap: [
                    {"key": "0", "value": "未开奖", "style": "default"},
                    {"key": "1", "value": "未中奖", "style": "danger"},
                    {"key": "2", "value": "已中奖", "style": "success"}
                ]
            },
            methods: {
                // 初始所有参数
                initParams: function (fun) {
                    post(params.allListUrl, {}, function (data) {
                        vm.allName = data;
                        $.each(vm.allName.codeList, function (index, item) {
                            codeMap[item["lotteryCode"]] = item["value"];
                        });

                        $.each(vm.allName.vendorList, function (index, item) {
                            vendorMap[item["userId"]] = item["companyName"];

                        });

                        $.each(vm.allName.siteList, function (index, item) {
                            siteMap[item["siteId"]] = item["siteName"];
                        });

                        $.each(vm.allName.gameList, function (index, item) {
                            gameMap[item["lotteryCode"]] = item["value"];
                        });

                        // 初始化表格
                        // fun();
                        // queryData(vm, table);

                    });
                },
                // 高亮文字
                hightlightText: function (txt) {
                    if (!txt) {
                        txt = 0;
                    }
                    return '<span class="text-danger">' + txt + '</span>';
                }
            }
        });

        // 初始化参数后,加载表格,尽量不用setTimeout
        vm.initParams(initTable);

    } catch (e) {
        alert(e);
    }

    function queryData(vm, table) {
        if (params.lotteryType) {
            vm.selected = params.lotteryType;
        }

        if (params.statusType) {
            vm.statusType = vm.statusMap[params.statusType].key;
        }

        if (params.winStatusType) {
            vm.winStatusType = vm.winStatusMap[params.winStatusType].key;
        }

        if (params.ticketStartTime) {
            vm.ticketStartTime = params.ticketStartTime;
        }

        if (params.ticketEndTime) {
            vm.ticketEndTime = params.ticketEndTime;
        }
        table.draw();
    }


    function initTable() {
        table = $('#query-list').DataTable({
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ],
            "paging": true,
            "processing": false,
            "serverSide": true,
            "autoWidth": true,
            "searching": false,
            "ordering": false,
            "lengthChange": false,
            "pageLength": 15,
            "deferLoading": 0,
            "retrieve": true,
            "language": {
                "url": "/assets/js/plugins/datatables/Chinese.json"
            },
            "ajax": {
                url: params.listUrl,
                dataType: params.dataType,
                contentType: params.contentType,
                type: params.type,
                data: function (d) {
                    // 负责表单的值到Datatable里面
                    setParams("queryForm", d);
                    vm.count = "0";
                    vm.selectedCount = "0";
                }
            },
            "columns": [
                null,
                {"data": "orderId", "defaultContent": defaultValue},
                null,
                {"data": "ticketId", "defaultContent": defaultValue},
                null,
                null,
                {"data": "drawSeq", "defaultContent": defaultValue},
                null,
                {"data": "price", "defaultContent": defaultValue},
                null,
                {"data": "winStatus", "defaultContent": defaultValue},
                null,
                null,
                null
            ],
            // 自定义操作列 -1 表示从后往前算
            "columnDefs": [
                {
                    "targets": 0,
                    "data": "pkSid",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        var val = row.ticketId + "_" + row.printTerminal + "_" + row.ticketNumber;
                        return '<input type="checkbox" class="icheckbox " name="myPkSid" value="' + val + '">';
                    }
                },
                {
                    "targets": 2,
                    "data": "vendorId",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return vendorMap[data];
                    }
                },
                {
                    "targets": 4,
                    "data": "siteId",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return siteMap[data];
                    }
                },
                {
                    "targets": 5,
                    "data": "lotteryType",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return codeMap[data];
                    }
                },
                {
                    "targets": 7,
                    "data": "gameTypeId",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return gameMap[data];
                    }
                },
                {
                    "targets": 9,
                    "data": "ticketStatus",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        if (data != null) {
                            var style = vm.statusMap[data].style;
                            var value = vm.statusMap[data].value;
                            return '<span class="label label-' + style + '">' + value + '</span>';
                        }

                    }
                },
                {
                    "targets": 10,
                    "data": "winStatus",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        if (data != null) {
                            var style = vm.winStatusMap[data].style;
                            var value = vm.winStatusMap[data].value;
                            return '<span class="label label-' + style + '">' + value + '</span>';
                        }
                    }
                },
                {
                    "targets": -3,
                    "data": "isDuplicate",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        if (data != null) {
                            var style = vm.errorMap[data].style;
                            var value = vm.errorMap[data].value;
                            return '<span class="label label-' + style + '">' + value + '</span>';
                        }
                    }
                },
                {
                    "targets": -2,
                    "data": "claimStatus",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        if (data != null) {
                            var style = vm.winMap[data].style;
                            var value = vm.winMap[data].value;
                            return '<span class="label label-' + style + '">' + value + '</span>';
                        }
                    }
                },
                {
                    "targets": -1,
                    "data": null,
                    "defaultContent": '' +
                    '<button type="button" class="btn btn-default btn-sm print-ticket" title="打印票"><span class="fa fa-print"></span></button> ' +
                    '<button type="button" class="btn btn-default btn-sm print-failed" title="打印失败"><span class="fa fa-times"></span></button> ' +
                    '<button type="button" class="btn btn-default btn-sm restart-ticket" title="重新出票"><span class="fa fa-retweet"></span></button> ' +
                    '<button type="button" class="btn btn-default btn-sm marker-ticket" title="标记错票"><span class="fa fa-warning"></span></button>'
                }]
        });

        // 自定义事件, 用于最后一列
        // 打印票
        table.on('click', '.print-ticket', function () {
            var data = table.row($(this).parents('tr')).data();
            if (validated(data["printTerminal"])) {

                commonSwal("是否真的要打印吗?", '', function () {
                    post(params.printUrl, {
                        "terminalIds": [data["printTerminal"]],
                        "ticketNums": [data["ticketNumber"]]
                    }, function (data) {
                        showResult(vm, data);
                    });
                });


            } else {
                var feedback = {
                    code: Constant.ERROR,
                    message: "该票还未出成功,请选择其他票打印."
                };
                showResult(vm, feedback);
            }

        });

        // 打印失败
        table.on('click', '.print-failed', function () {
            var data = table.row($(this).parents('tr')).data();
            commonSwal("是否真的要置打印失败吗?", '', function () {
                post(params.updateStatusUrl, {
                    "ticketStatus": vm.statusMap[4].key,
                    "ticketError": vm.errorMap[0].key,
                    "ticketIds": [data["ticketId"]]
                }, function (data) {
                    reloadTable(data);
                });
            });
        });

        // 重新出票, 同时修改status和error
        table.on('click', '.restart-ticket', function () {
            var data = table.row($(this).parents('tr')).data();
            commonSwal("是否真的要置重新出票吗?", '', function () {
                post(params.updateStatusUrl, {
                    "ticketStatus": vm.statusMap[0].key,
                    "ticketError": vm.errorMap[0].key,
                    "ticketIds": [data["ticketId"]]
                }, function (data) {
                    reloadTable(data);
                });
            });

        });

        // 标记出错, 同时修改status和error
        table.on('click', '.marker-ticket', function () {
            var data = table.row($(this).parents('tr')).data();
            commonSwal("是否真的要标记错票吗?", '', function () {
                post(params.updateStatusUrl, {
                    "ticketStatus": vm.statusMap[4].key,
                    "ticketError": vm.errorMap[2].key,
                    "ticketIds": [data["ticketId"]]
                }, function (data) {
                    reloadTable(data);
                });
            });
        });

        // 加载
        table.on('draw', function () {
            if (table.ajax.json()) {
                // 渲染checkbox
                checkboxEnableStyle();
                // 总票数
                unloading();
                vm.prizeCount.totalCount = table.ajax.json().recordsTotal;
                vm.prizeCount.price = table.ajax.json().price;
                vm.prizeCount.deservePrize = table.ajax.json().deservePrize;
                vm.prizeCount.actualPrize = table.ajax.json().actualPrize;
            }
        });
        table.on('preXhr.dt', function () {
            loading();
        });
    }

    // 表单提交
    $('#ticketSearchBtn').click(function () {
        initTable();
        table.draw();
    });

    function batchUpdateStatus(msg, url, status, error) {
        var data = $("#query-list input[name='myPkSid']");
        var ids = [];
        if (data && data.length > 0) {
            data.each(function () {
                if ($(this).is(":checked")) {
                    var arr = $(this).val().split("_");
                    ids.push(arr[0]);
                }
            });
            if (ids.length > 0) {
                var postParam = {};
                postParam["ticketStatus"] = status;
                if (error && error >= 0) {
                    postParam["ticketError"] = error;
                }
                postParam["ticketIds"] = ids;
                commonSwal(msg, '', function () {
                    post(url, postParam, function (data) {
                        showResult(vm, data);
                    });
                });
            } else {
                errorMsg(".alert");
                vm.msg = "请选择一条以上的记录。";
            }
        }
    }

    // 批量打票
    $(".batch-print").click(function () {
        var data = $("#query-list input[name='myPkSid']");
        var terminalIds = [];
        var ticketNums = [];
        if (data && data.length > 0) {
            data.each(function () {
                if ($(this).is(":checked")) {
                    var arr = $(this).val().split("_");
                    if (arr.length == 3) {
                        if (validated(arr[1])) {
                            terminalIds.push(arr[1]);
                            ticketNums.push(arr[2]);
                        } else {
                            var feedback = {
                                code: Constant.ERROR,
                                message: "票 [" + arr + "] 还未出成功,请选择其他票打印."
                            }
                            showResult(vm, feedback);
                            return false;
                        }
                    }
                }
            });
            if (terminalIds.length > 0) {
                var postParam = {
                    "terminalIds": terminalIds,
                    "ticketNums": ticketNums
                };

                commonSwal("是否真的要打印这批票吗?", '', function () {
                    post(params.printUrl, postParam, function (data) {
                        reloadTable(data);
                    });
                });

            } else {
                errorMsg(".alert");
                vm.msg = "请选择一条以上的记录。";
            }
        }
    });

    $(".batch-print-failed").click(function () {
        batchUpdateStatus("是否真的要置这批打印失败吗?", params.updateStatusUrl, vm.statusMap[4].key, vm.errorMap[0].key);
    });

    $(".batch-restart-ticket").click(function () {
        batchUpdateStatus("是否真的要置这批重新出票吗?", params.updateStatusUrl, vm.statusMap[0].key, vm.errorMap[0].key);
    });

    $(".batch-marker-ticket").click(function () {
        batchUpdateStatus("是否真的要置这批标记错票吗?", params.updateStatusUrl, vm.statusMap[4].key, vm.errorMap[2].key);
    });

    $(".print-excel-report").click(function () {
        post("/monitor/report", $("#queryForm").serializeArray(), function (data) {
            loading();
            if (data.code == "10000") {
                window.location.href = '/monitor/download/' + data.message;
                unloading();
            }
        });

    });

    function reloadTable(data) {
        showResult(vm, data, function () {
            loading();
            table.ajax.reload(function () {
                unloading();
            }, false);
        });
    }

    function validated(terminal) {
        if (terminal && terminal != "0" && terminal != "--" && terminal != "-") {
            return true;
        }
        return false;
    }

    function checkboxEnableStyle() {
        // 重置总复选框
        $('#selectedAll').iCheck('uncheck');

        if ($(".icheckbox").length > 0) {
            // 增加样式
            $(".icheckbox,.iradio").iCheck({
                checkboxClass: 'icheckbox_minimal-grey',
                radioClass: 'iradio_minimal-grey'
            });

            $("#query-list input[name='myPkSid']").on('ifChecked', function (event) {
                vm.count++;
                vm.selectedCount = parseInt(vm.selectedCount) + parseInt($(this).parents("tr").find("td:eq(8)").text());
            });
            $("#query-list input[name='myPkSid']").on('ifUnchecked', function (event) {
                vm.count--;
                vm.selectedCount = parseInt(vm.selectedCount) - parseInt($(this).parents("tr").find("td:eq(8)").text());
            });

            $('#selectedAll').on('ifChecked', function (event) {
                $("#query-list input[name='myPkSid']").iCheck('check');
            });

            $('#selectedAll').on('ifUnchecked', function (event) {
                $("#query-list input[name='myPkSid']").iCheck('uncheck');
            });
        }
    };

});


