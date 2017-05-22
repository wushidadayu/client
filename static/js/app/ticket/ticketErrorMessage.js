$(document).ready(function () {

    jQuery.ajaxSettings.traditional = true;
    document.title = "错误票信息";
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
    var siteMap = {};
    var vendorMap = {};
    var codeMap = {};
    var gameMap = {};
    var pkSid = {};
    var defaultValue = "--";

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
                msg: ""
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

    function initTable() {
        try {
            table = $('#query-list').DataTable({
                "paging": true,
                "processing": false,
                "serverSide": true,
                "autoWidth": true,
                "searching": false,
                "ordering": false,
                "lengthChange": false,
                "pageLength": 15,
                "language": {
                    "url": "/assets/js/plugins/datatables/Chinese.json"
                },
                "dataSrc": "data.pager",
                "ajax": {
                    url: params.listUrl,
                    dataType: params.dataType,
                    contentType: params.contentType,
                    type: params.type,
                    data: function (d) {
                        // 负责表单的值到Datatable里面
                        setParams("queryForm", d);
                    }
                },
                "columns": [
                    null,
                    {"data": "ticketId"},
                    null,
                    null,
                    {"data": "drawSeq"},
                    null,
                    {"data": "price"},
                    {"data": "errorMessage"},
                    {"data": "orderId"},
                    null

                ],
                // 自定义操作列 -1 表示从后往前算
                "columnDefs": [
                    {
                        "targets": 0,
                        "data": "vendorId",
                        "defaultContent": defaultValue,
                        "render": function (data, type, row) {
                            return vendorMap[data];
                        }
                    },
                    {
                        "targets": 2,
                        "data": "siteId",
                        "defaultContent": defaultValue,
                        "render": function (data, type, row) {
                            return siteMap[data];
                        }
                    },
                    {
                        "targets": 3,
                        "data": "lotteryType",
                        "defaultContent": defaultValue,
                        "render": function (data, type, row) {
                            return codeMap[data];
                        }
                    },
                    {
                        "targets": 5,
                        "data": "gameTypeId",
                        "defaultContent": defaultValue,
                        "render": function (data, type, row) {
                            return gameMap[data];
                        }
                    },{
                        "targets": -1,
                        "data": "createTime",
                        "render": function (data, type, row) {
                            return new Date(data).format("%Y-%m-%d %H:%M:%S");
                        }
                    }]
            });

            // 加载
            table.on('draw', function () {
                unloading();

            });
            table.on('preXhr.dt', function () {
                loading();
            });

        } catch (e) {
            alert(e);
        }
    }

    // 表单提交
    $('#ticketSearchBtn').click(function () {
        initTable();
        table.draw();
    });
});