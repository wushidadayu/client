$(document).ready(function () {
    document.title = "工具方法";

    var vm = new Vue({
        el: '#webApp',
        data: {
            msg: "",
            draw: {},
            codes: [],
            calcTicketId: "",
            redisTicketId:"",
            resetTicketId: "",
            pushTicketId: "",
            tickets: []
        },
        methods: {
            init: function () {
                post(params.getLotteryCodesUrl, params.dataType, function (data) {
                    vm.codes = data.data;
                });

                post(params.getReceiveStatusUrl,{},function (data) {
                    if(data.receiveStatus == "1"){
                        $("#receiveStatus").val("开启");
                    }else{
                        $("#receiveStatus").val("关闭");
                    }
                });
            },
            sendCalcPrizeMessage: function () {
                post(params.sendCalcPrizeMessageUrl, vm.draw, function (data) {
                    showResult(vm,data);
                });
            },
            recoveryCalculationList: function () {
                commonSwal('你确定要恢复 [' + vm.lotteryType + ' -> ' + vm.draw.drawSeqOrSequenceNo + '] 吗?', '', function () {
                    // 把场次号赋值过来
                    vm.draw.sequenceNo = vm.draw.drawSeqOrSequenceNo;
                    post(params.recoveryCalculationListUrl, vm.draw, function (data) {
                        showResult(vm,data);
                    });
                });
            },
            restart: function () {
                commonSwal("是否真的要重置?", '', function () {
                    post(params.resetUrl, {}, function (data) {
                        showResult(vm, data)
                    })
                });
            },
            singleTicketCalcPrizeUrl: function () {
                post(params.singleTicketCalcPrizeUrl, {ticketId: vm.calcTicketId}, function (data) {
                    vm.tickets = data.data;
                    $("#myModal").modal("show");
                });
            },
            putTicketInRedis : function () {
                post(params.putTicketInRedisUrl,{ticketId:vm.redisTicketId},function (data) {
                    showResult(vm,data);
                });
            },
            resetToPool : function () {
                commonSwal("是否真的要重出吗?", '', function () {
                    post(params.resetToPoolUrl, {ticketId: vm.resetTicketId}, function (data) {
                        showResult(vm, data);
                    });
                });
            },
            loadReceiveStatus : function () {
                post(params.getReceiveStatusUrl)
            },
            pushTicketInfo : function () {
                post(params.pushTicketInfoUrl,{ticketId:vm.pushTicketId},function (data) {
                    showResult(vm,data);
                });
            }
        }
    });

    vm.init();
    //修改接票状态
    $('#receiveOrderSwitch').click(function (){
        var receiveStatus;
        if($("#receiveStatus").val()=="开启"){
            receiveStatus = "0";
        }else{
            receiveStatus = "1";
        }

        commonSwal('你确定要更改接票状态吗?', '', function () {
            post(params.changeReceiveStatusUrl, {
                receiveStatus:receiveStatus
            }, function (data) {
                if(data.receiveStatus == "1"){
                    $("#receiveStatus").val("开启");
                }else{
                    $("#receiveStatus").val("关闭");
                }
                showResult(vm, data);
            });
        });
    });

    $('#fileupload').fileupload({
        url: params.uploadUrl,
        dataType: 'json',
        change: function (e, data) {
        },
        add: function (e, data) {
            data.submit();
        },
        done: function (e, data) {
            showResult(vm, data._response.result)
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');

});