$(document).ready(function () {
    document.title = "大奖票";
    var siteMap = {};
    var codeMap = {};
    //加载时间
    jeDate({
        dateCell: ".datepicker",
        format: "YYYY-MM-DD",
        isinitVal: false, //显示时间
        isTime: true,
        festival: true,//显示节日
        okfun: function (val) {
            $(this.dateCell).trigger('change');
        },
        choosefun: function (val) {
            $(this.dateCell).trigger('change');
        }
    });

    var table = null;
    var vm = new Vue({
        el: '#webApp',
        data: {
            allName: {},
            sites: [],
            sitesMap: {},
            lotteryTypeList: [],
            lotteryTypeMap: {},
            prizeStatusMap: [
                {"key": "0", "value": "未处理", "style": "warning"},
                {"key": "1", "value": "兑奖中", "style": "default"},
                {"key": "2", "value": "已兑奖", "style": "success"}
            ],
            printStatusMap: [
                {"key": "0", "value": "未处理", "style": "warning"},
                {"key": "1", "value": "已打印", "style": "success"}
            ],
            vendorMap: {"9999": "国信", "10000": "国信", "10001": "必赢", "10002": "159", "10002": "易彩乐"},
            priceSum: 0,
            deservePrizeSum: 0,
            actualPrizeSum: 0,
            bigprize: [],
            Sum: 0,
            boxes: [],
            count: "0",
            selectedCount: "0"
        },
        methods: {
            init: function () {
                post(params.listInitUrl, {}, function (data) {
                    vm.allName = data;
                    $.each(vm.allName.siteList, function (index, item) {
                        siteMap[item["siteId"]] = item["siteName"];
                    });
                    $.each(vm.allName.codeList, function (index, item) {
                        codeMap[item["lotteryCode"]] = item["value"];
                    });
                    initTable();
                });
            },
            query: function () {
                table.draw();
            },
            add: function () {
                var postArr = getSelectedIds();
                reload(params.printUrl + "/" + postArr);
            }
        }
    });

    vm.init();

    //获取ids
    function getSelectedIds() {
        var postArr = [];
        var boxes = $('input[name="myPkSid"]:checked');
        boxes.each(function () {
            var element = $(this).val();
            var arr = element.split(",");
            if (arr[0] != null) {
                postArr.push(arr[0]);
            }

        });
        return postArr.join();
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
                    url: params.listBigPrizeUrl,
                    dataType: params.dataType,
                    contentType: params.contentType,
                    type: params.type,
                    data: function (d) {
                        // 负责表单的值到Datatable里面
                        setParams("queryForm", d);
                    }
                },
                "columns": [
                    {"data": "pkSid"},
                    {"data": "orderId"},
                    {"data": null},
                    {"data": "ticketId"},
                    {"data": null},
                    {"data": null},
                    {"data": "drawSeq"},
                    {"data": "gameTypeId"},
                    {"data": "price"},
                    {"data": "deservePrize"},
                    {"data": null},
                    {"data": "printUser"},
                    {"data": "takeTicketUser"},
                    {"data": "actualPrize"},
                    {"data": null},
                    {"data": "prizeUser"},
                    null
                ],
                // 自定义操作列 -1 表示从后往前算
                "columnDefs": [{
                    "targets": 0,
                    "data": "pkSid",
                    "render": function (data, type, row) {
                        return '<input type="checkbox" class="icheckbox " name="myPkSid" value="' + row.ticketNumber + '">';
                    }
                }, {
                    "targets": 2,
                    "data": "vendorId",
                    "render": function (data, type, row) {
                        return vm.vendorMap[data.vendorId];
                    }
                }, {
                    "targets": 4,
                    "data": "siteId",
                    "render": function (data, type, row) {
                        return siteMap[data.siteId];
                    }
                }, {
                    "targets": 5,
                    "data": "lotteryType",
                    "render": function (data, type, row) {
                        return codeMap[data.lotteryType];
                    }
                }, {
                    "targets": 10,
                    "data": "printStatus",
                    "render": function (data, type, row) {
                        var style = vm.printStatusMap[data.printStatus].style;
                        var value = vm.printStatusMap[data.printStatus].value;
                        return '<span class="label label-' + style + '">' + value + '</span>';

                    }
                }, {
                    "targets": -3,
                    "data": "prizeStatus",
                    "render": function (data, type, row) {
                        var style = vm.prizeStatusMap[data.prizeStatus].style;
                        var value = vm.prizeStatusMap[data.prizeStatus].value;
                        return '<span class="label label-' + style + '">' + value + '</span>';

                    }
                }, {
                    "targets": -1,
                    "data": null,
                    "defaultContent": '' +
                    '<button type="button" class="btn btn-default btn-sm print"><span class="fa fa-pencil"></span> 反打票</button> ' +
                    '<button  type="button" class="btn btn-default btn-sm prize"><span class="fa fa-pencil"></span> 标记兑奖</button> '
                }]
            });

            // 加载
            table.on('draw', function () {
                unloading();
                if (table.ajax.json()) {
                    vm.bigprize = table.ajax.json().data;
                    vm.priceSum = 0;
                    vm.deservePrizeSum = 0;
                    vm.actualPrizeSum = 0;
                    for (var i = 0; i < vm.bigprize.length; i++) {
                        vm.priceSum += vm.bigprize[i].price;
                    }

                    for (var i = 0; i < vm.bigprize.length; i++) {
                        vm.deservePrizeSum += vm.bigprize[i].deservePrize;
                    }

                    for (var i = 0; i < vm.bigprize.length; i++) {
                        vm.actualPrizeSum += vm.bigprize[i].actualPrize;
                    }
                }
                checkboxEnableStyle();
            });
            table.on('preXhr.dt', function () {
                loading();
            });
            //反打
            table.on('click', '.print', function () {
                var data = table.row($(this).parents('tr')).data();
                reload(params.printUrl + "/" + data.ticketNumber);
            });
            //标记兑奖
            table.on('click', '.prize', function () {
                var data = table.row($(this).parents('tr')).data();
                reload(params.prizeUrl + "/" + data.ticketNumber);
            });
        } catch (e) {
            alert(e);
        }
    }

    /**
     * 初始化 radio checkbox 点击事件
     * 对按钮样式进行设置
     */
    function checkboxEnableStyle() {
        if ($(".icheckbox").length > 0) {
            $(".iradio,.icheckbox").iCheck({
                radioClass: 'iradio_minimal-grey',
                checkboxClass: 'icheckbox_minimal-grey'
            });
        }
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


});
