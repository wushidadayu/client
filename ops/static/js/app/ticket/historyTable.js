
function taday() {
    return new Date().format("%Y-%m-%d %T");
}

$(document).ready(function () {
    document.title = "历史票查询";
    var statesInfo={1000:'已初始化',1001:'分票到PC',1002:'PC分票到彩机',1003:'彩机出票中',
                1004:'异常',1005:'出票成功',1006:'对比失败',1007:'解析到票面乱码内容',
                102:'推送成功票',103:'推送返回失败',104:'推送失败票',105:'推送限号票'}
    var statesMap={
        0:[1000,1001,1002,1003,1004,1005,1006,1007,102,103,104,105],
        1:[102],
        2:[105],
        3:[1000,1001,1002,1003,1004,1005,1006,1007,103,104],
    };
    var states={
        0:'全部',
        1:'成功',
        2:'限号',
        3:'失败',
    }
    var vm = new Vue({
        el: '#webApp',
        data: {
            statesInfo:statesInfo,
            startStr:taday(),
            endStr:taday(),
            stateSelected:[],
            numSelected:[],
            quntity:0,
            pageNum:1,
            page:15,
            states:states,
            lotteryNums:{},
            orderid:null,
            sts:[],
            proviou:false,
            next:false,
            pageArray:[]
        },
        methods: {
            init:function () {
                get(params.getLotteryNumsUrl,{},function (data) {
                    if (data && typeof data=='object' && Array==data.constructor){
                        vm.lotteryNums=data;
                        setTimeout(function () {
                            $('#states').selectpicker('deselectAll');
                            $("#states").selectpicker("refresh");
                            $('#lotteryNums').selectpicker('deselectAll');
                            $("#lotteryNums").selectpicker("refresh");
                        },100)
                    }else{
                        noty({text: '初始化加载失败', layout: 'topCenter', type: 'error', timeout: 2000});
                    }
                },function () {
                    noty({text: '初始化加载失败', layout: 'topCenter', type: 'error', timeout: 2000});
                })
            },
            getContent:function (orderid) {
                mypost(params.getTicketContent,{"orderid":orderid},function (data) {
                    if (data && data.code == 10001) {
                        noty({text: '查询失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }else {
                       $("#spContext").html(data.Ac.replace(/\n/ig,"<br/>"));
                        $("#modalPcEdit").modal('show');
                    }
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '查询失败', layout: 'topCenter', type: 'error', timeout: 2000});
                });
            },
            closeContent:function () {
                $("#spContext").html('');
                $("#modalPcEdit").modal('hide');
            },
            search:function () {
                if (this.orderid!=null && this.orderid!='' && this.orderid.length<=50){
                    mypost(params.getHistoryList,{"orderid":this.orderid},function (data) {
                        if (data && data.code == 10001) {
                            noty({text: '查询失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }else {
                            vm.sts=data;
                            vm.quntity=data.length;
                            vm.pageNum=1;
                            refresh();
                            noty({text: '查询成功！', layout: 'topCenter', type: 'success', timeout: 2000});
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '查询失败', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                }else{
                    vm.stateSelected=statesMap[$("#states").selectpicker("val")];
                    vm.numSelected=$("#lotteryNums").selectpicker("val");
                    vm.startTime=$("#startTime").val();
                    vm.endTime=$("#endTime").val();
                    mypost(params.getHistoryCount,{"states":vm.stateSelected,"lotteryNums":vm.numSelected,"startTime":vm.startTime,"endTime":vm.endTime},function (data) {
                        if (data && data.code == 10001) {
                            noty({text: '查询失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }else {
                            vm.quntity=data.Num;
                            vm.pageNum=1;
                            noty({text: '统计数量获取成功！', layout: 'topCenter', type: 'success', timeout: 2000});
                            vm.getSTList();
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '查询失败', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                };

            },
            choice:function (pageNum) {
                vm.pageNum=pageNum;
                vm.getSTList();
            },
            provious:function () {
                vm.pageNum-=1;
                vm.getSTList();
            },
            nexts:function () {
                vm.pageNum+=1;
                vm.getSTList();
            },
            getSTList:function () {
                mypost(params.getHistoryList,{"states":vm.stateSelected,
                                            "lotteryNums":vm.numSelected,
                                            "startTime":vm.startTime,
                                            "endTime":vm.endTime,
                                            "startNum":(vm.pageNum-1)*vm.page,
                                            "endNum":vm.pageNum*vm.page},
                    function (data) {
                    if (data && data.code == 10001) {
                        noty({text: '查询失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }else {
                        if(data && typeof data =="object" && data.constructor==Array){
                            vm.sts=data;
                            refresh();
                            noty({text: '查询成功！', layout: 'topCenter', type: 'success', timeout: 2000});
                        }else{
                            vm.sts=data;
                            refresh();
                            noty({text: '查询数据为空！', layout: 'topCenter', type: 'success', timeout: 2000});
                        }

                    }
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '查询失败', layout: 'topCenter', type: 'error', timeout: 2000});
                });
            },
            refreshPage:function () {
                if(vm.pageNum<=3){
                    vm.proviou=false;
                }else{
                    vm.proviou=true;
                };

                var maxpage=((vm.quntity%vm.page)==0) ? (vm.quntity/vm.page):(vm.quntity/vm.page+1);
                if((maxpage-3)<=vm.pageNum){
                    vm.next=false;
                }else{
                    vm.next=true;
                };
                var arr=new Array();
                var i=vm.pageNum-2;
                if (vm.pageNum<3){
                    i=1
                }
                var j=((i+4)<maxpage)?(i+4):maxpage;
                for (;i<=j;i++){
                    arr.push(i);
                }
                vm.pageArray=arr;

            }
        },
        filters:{
            dateFormat:function (dateStr) {
                var dateStr=new Date(dateStr).format("%Y-%m-%d %T");
                if(dateStr=="1-01-01 08:00:00"){
                    return "无";
                }
                return dateStr;

            },
            getLotteryName:function (num) {
                for(var i=0;i<vm.lotteryNums;i++){
                    if(vm.lotteryNums[i].Lotterynum==num){
                        return vm.lotteryNums[i];
                    }
                }
                return "无";
            }
        }
    });

    vm.init();



    var start=$("#startTime").datetimepicker({
        format: "yyyy-mm-dd hh:ii:ss",
        autoclose: true,
        todayHighlight: true,
        showMeridian: true,
        pickerPosition: "bottom-left",
        language: 'zh-CN',//中文，需要引用zh-CN.js包
        startView: 2,//月视图
        minView: 0,//日期时间选择器所能够提供的最精确的时间选择视图
    });
    var end=$("#endTime").datetimepicker({
        format: "yyyy-mm-dd hh:ii:ss",
        autoclose: true,
        todayHighlight: true,
        showMeridian: true,
        pickerPosition: "bottom-left",
        language: 'zh-CN',//中文，需要引用zh-CN.js包
        startView: 2,//月视图
        minView: 0,//日期时间选择器所能够提供的最精确的时间选择视图
    });

    var now =new Date();
    var sStr=new Date(now.getTime()-1000*60*60).format("%Y-%m-%d %T");
    var eStr=now.format("%Y-%m-%d %T");
    $("#startTime").val(sStr);
    $("#endTime").val(eStr);
    start.datetimepicker('setEndDate',eStr);
    end.datetimepicker('setStartDate',sStr);
    end.datetimepicker('setEndDate',eStr);

    start.on("changeDate",function (event) {
        end.datetimepicker('setStartDate',event.date.format("%Y-%m-%d %T"));
    });

    end.on("changeDate",function (event) {
        start.datetimepicker('setEndDate',event.date.format("%Y-%m-%d %T"));
        end.datetimepicker('setEndDate',new Date().format("%Y-%m-%d %T"));
    });



    $("#states").change(function () {
        vm.stateSelected=$(this).selectpicker("val");
    });
    $('#lotteryNums').change(function () {
        vm.numSelected=$(this).selectpicker("val");
    });

    function refresh() {
        vm.refreshPage();
    }


});


