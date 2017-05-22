$(document).ready(function () {

    document.title = "票务统计汇总";
    var codeMap = {};
    var form = $("#countForm");

    //加载时间
    jeDate({
        dateCell: ".datepicker",
        format: "YYYY-MM-DD",
        isinitVal: true, //显示时间
        isTime: false,
        festival: true,//显示节日
        okfun: function (val) {
            $(this.dateCell).trigger('change');
        },
        choosefun: function (val) {
            $(this.dateCell).trigger('change');
        }
    });

    try {
        var vm = new Vue({
            el: '#webApp',
            data: {
                allName: {},
                countName: {},
                msg: "",
                on: 0,
                totalCount: {
                    "detailTotal": 0,
                    "detailPrice": 0,
                    "detailDeservePrize": 0,
                    "printTaskTotal": 0,
                    "printTaskPrice": 0,
                    "printTaskDeservePrize": 0,
                    "failedTicket": 0,
                    "duplicateTicket": 0,
                    "errorTicket": 0,
                    "duplicateTicketPrize": 0,
                    "errorTicketPrize": 0
                }
            },
            methods: {
                initList: function (data) {
                    $.ajaxSetup({
                        async: false
                    });

                    if (vm.on == 0) {
                        post(params.allListUrl, {}, function (data) {
                            vm.allName = data;
                            $.each(vm.allName.codeList, function (index, item) {
                                codeMap[item["lotteryCode"]] = item["value"];
                            });
                        });
                        vm.on = 1;
                    }

                    post(params.countListUrl, data.serializeArray(), function (data) {
                        vm.countName = data.data;
                        vm.totalCount = {
                            "detailTotal": 0,
                            "detailPrice": 0,
                            "detailDeservePrize": 0,
                            "printTaskTotal": 0,
                            "printTaskPrice": 0,
                            "printTaskDeservePrize": 0,
                            "failedTicket": 0,
                            "duplicateTicket": 0,
                            "errorTicket": 0,
                            "duplicateTicketPrize": 0,
                            "errorTicketPrize": 0
                        };

                        $.each(vm.countName, function (index, item) {

                            vm.totalCount.detailTotal += item.detailTotal;
                            vm.totalCount.detailPrice += item.detailPrice;
                            vm.totalCount.detailDeservePrize += item.detailDeservePrize;

                            vm.totalCount.printTaskTotal += item.printTaskTotal;
                            vm.totalCount.printTaskPrice += item.printTaskPrice;
                            vm.totalCount.printTaskDeservePrize += item.printTaskDeservePrize;

                            vm.totalCount.failedTicket += item.failedTicket;
                            vm.totalCount.duplicateTicket += item.duplicateTicket;
                            vm.totalCount.errorTicket += item.errorTicket;

                            vm.totalCount.duplicateTicketPrize += item.duplicateTicketPrize;
                            vm.totalCount.errorTicketPrize += item.errorTicketPrize;
                        })
                    });

                    $.ajaxSetup({
                        async: true
                    });

                },
                getCodeName: function (gameCode) {
                    return codeMap[gameCode];
                },
                querySuccess: function (w, on) {
                    var data;

                    if(on == 0){
                        data = {
                            "lotteryType": w.lotteryType,
                            "ticketStartTime": $("#ticketStartTime").val(),
                            "ticketEndTime": $("#ticketEndTime").val(),
                            "statusType":2
                        };
                    }
                    else if(on == 1) {
                        data = {
                            "lotteryType": w.lotteryType,
                            "ticketStartTime": $("#ticketStartTime").val(),
                            "ticketEndTime": $("#ticketEndTime").val(),
                            "winStatusType":2
                        };
                    }
                    else if(on == 2) {
                        data = {
                            "lotteryType": w.lotteryType,
                            "ticketStartTime": $("#ticketStartTime").val(),
                            "ticketEndTime": $("#ticketEndTime").val(),
                            "statusType":3
                        };
                    }
                    else if(on == 3) {
                        data = {
                            "lotteryType": w.lotteryType,
                            "ticketStartTime": $("#ticketStartTime").val(),
                            "ticketEndTime": $("#ticketEndTime").val(),
                            "statusType":4
                        };
                    }

                    forward(params.queryUrl, data);
                }

            }
        });

        vm.initList(form);

        //按钮事件
        $("#ticketSearchBtn").click(function () {
            vm.initList(form);
        });


    } catch (e) {
        alert(e);
    }

});


