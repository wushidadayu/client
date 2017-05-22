$(document).ready(function () {

    document.title = "票务兑奖查询";
    var defaultValue = "--";
    var siteMap = {};
    var vendorMap = {};
    var codeMap = {};
    var gameMap = {};

    var pkSid = {};
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
                prizeCount: {
                    totalCount : 0,
                    price : 0,
                    deservePrize : 0,
                    actualPrize : 0
                },
                msg: "",
                count: "0",
                selectedCount: "0",
                statusMap: [
                    {"key": "0", "value": "未处理", "style": "warning"},
                    {"key": "1", "value": "兑奖中", "style": "default"},
                    {"key": "2", "value": "已兑奖", "style": "success"}
                ],
                errorMap: [
                    {"key": "0", "value": "正常", "style": "success"},
                    {"key": "1", "value": "多出票", "style": "danger"},
                    {"key": "2", "value": "错票", "style": "danger"}
                ]
            },
            methods: {
                initList: function (fun) {
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

                        fun();

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

        vm.initList(initTable);

    } catch (e) {
        alert(e);
    }

    function initTable() {

        table = $('#query-list').DataTable({
            "paging": true,
            "processing": false,
            "serverSide": true,
            "autoWidth": true,
            "searching": false,
            "ordering": false,
            "lengthChange": false,
            "pageLength": 15,
            "deferLoading": 0,
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
                // null,
                {"data": "orderId", "defaultContent": defaultValue},
                null,
                {"data": "ticketId", "defaultContent": defaultValue},
                null,
                null,
                {"data": "drawSeq", "defaultContent": defaultValue},
                null,
                {"data": "price", "defaultContent": defaultValue},
                {"data": "deservePrize", "defaultContent": defaultValue},
                {"data": "deserve", "defaultContent": defaultValue},
                {"data": "Prize", "defaultContent": defaultValue},
                null,
                null,
                null,
                // null
            ],
            // 自定义操作列 -1 表示从后往前算
            "columnDefs": [
                /*{
                    "targets": 0,
                    "data": "pkSid",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return '<input type="checkbox" class="icheckbox " name="myPkSid" value="' + data + '">';
                    }
                 },*/
                {
                    "targets": 1,
                    "data": "vendorId",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return vendorMap[data];
                    }
                },
                {
                    "targets": 3,
                    "data": "siteId",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return siteMap[data];
                    }
                },
                {
                    "targets": 4,
                    "data": "lotteryType",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return codeMap[data];
                    }
                },
                {
                    "targets": 6,
                    "data": "gameTypeId",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        return gameMap[data];
                    }
                },
                {
                    "targets": -3,
                    "data": "isDuplicate",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        var style = vm.errorMap[data].style;
                        var value = vm.errorMap[data].value;
                        return '<span class="label label-' + style + '">' + value + '</span>';
                    }
                },
                {
                    "targets": -2,
                    "data": "isJackPot",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        if (data == 1) {
                            return '<span class="label label-success">是</span>';
                        } else if (data == 0) {
                            return '<span class="label label-danger">否</span>';
                        }
                    }
                },
                {
                    "targets": -1,
                    "data": "claimStatus",
                    "defaultContent": defaultValue,
                    "render": function (data, type, row) {
                        var style = vm.statusMap[data].style;
                        var value = vm.statusMap[data].value;
                        return '<span class="label label-' + style + '">' + value + '</span>';
                    }
                }/*,
                {
                    "targets": -1,
                    "data": null,
                    "defaultContent": '' +
                    '<button type="button" class="btn btn-default btn-sm print-big-ticket"><span class="fa fa-pencil"></span> 大奖票兑奖</button> '
                 }*/]
        });


        // 自定义事件, 用于最后一列
        table.on('click', '.print-big-ticket', function () {
            var data = table.row($(this).parents('tr')).data();
            // TODO: 暂无实现
            alert('暂无实现');
        });
        // 加载
        table.on('draw', function () {
            if(table.ajax.json()){
                unloading();
                checkboxEnableStyle();
                // 总票数
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
        table.draw();
    });

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


