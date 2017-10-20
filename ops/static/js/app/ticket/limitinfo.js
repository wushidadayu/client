/**
 * Created by sunconglin on 2017-6-15.
 */
var vm;
$(document).ready(function () {

    document.title = "限制操作";
    jQuery.ajaxSettings.traditional = true;

    vm = new Vue({
        el: '#webApp',
        data: {
            Endtime:'',
            limits:[],
            typeMap:{
                "1":"福彩",
                "2":"体彩",
                "3":"竞彩",
                "4":"单场",
                "5":"高频"
            },
            isJC:false,
            lotteryNums:[],
            vendors:{},
            typeid:"",
            changeNums:[]
        },
        filters:{
            getLotName:function (data) {
                for(var i=0;i<vm.lotteryNums.length;i++){
                    if(vm.lotteryNums[i].Lotterynum==data){
                        return vm.lotteryNums[i].Lotterybname;
                    }
                }
                return "空"
            },
            dateFormat:function (data) {
                return new Date(data).format("%Y-%m-%d %H:%m:%S");
            }
        },
        methods: {
            initData:function () {
                get(params.getLimitAddInfoUrl, {}, function (data) {
                    vm.lotteryNums=data.infos;
                    vm.vendors=data.VendMap;
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '加载失败', layout: 'topCenter', type: 'error', timeout: 2000});

                });
            },
                setTypeid:function (typeid) {
                if(vm.typeid==typeid){
                    return
                }
                vm.typeid=typeid;
                var larr = new Array();
                for (var i = 0; i < vm.lotteryNums.length; i++) {
                    if (vm.lotteryNums[i].Typeid == vm.typeid) {
                        larr.push(vm.lotteryNums[i]);
                    }
                }
                vm.changeNums=larr;
            },
            /**
             * 设置是否竞彩flag
             */
            setIsJC: function (data) {
                if(data=="3"){
                    vm.isJC=true;
                }else{
                    vm.isJC=false;
                }
            },
            setLotterynums:function () {
                
            },
            /**
             * 加载limit添加模态框
             * @param id
             */
            loadLimitInfoMode: function () {
                $('#type').selectpicker('deselectAll');
                $('#type').selectpicker('refresh');

                var typeid=$("#type").selectpicker("val")
                vm.setIsJC(typeid);
                vm.setTypeid(typeid)

                vm.Endtime=new Date().format("%Y-%m-%d %H:%m:%S");

                $('#lname').selectpicker('deselectAll');
                $('#lname').selectpicker('refresh');

                $('#vendors').selectpicker('deselectAll');
                $('#vendors').selectpicker('refresh');

                $("#modalPcEdit").modal('show');


            },
            /**
             * 关闭添加限制操作模态框
             */
            closelimitInfoMode: function () {
                $("#modalPcEdit").modal('hide');
            },
            /**
             * 添加限制
             */
            addLimitInfo: function () {

                commonSwal("是否添加该限制?", '', function () {
                    var postData=null;
                    if(vm.typeid=='3'){
                        postData={"Typeid":vm.typeid,"Endtime":vm.Endtime,"Schemacode":vm.Schemacode,"Limittype":1};
                    }else{

                        postData={"Typeid":vm.typeid,"Endtime":vm.Endtime,"Limittype":1,"Lotterynum":$("#lname").selectpicker("val"),"Vendorid":$("#vendors").selectpicker("val"),"Period":vm.Period};
                    }
                    mypost(params.addLimitInfoUrl, postData, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            vm.loadAllLims();
                            vm.closelimitInfoMode();
                            noty({text: '添加成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        } else {
                            noty({text: '添加失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                            $("#addpc-num").val("");
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '添加失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                });
            },
            //加载列表数据
            loadAllLims:function () {
                get(params.findLimitInfoAllUrl,{},function (data) {

                    if (data && typeof data =='object' && data.constructor==Array) {
                       vm.limits=data;
                    } else {
                        noty({text: '添加失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '添加失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                });
            },
            //删除限制记录
            removeLims:function(Id){
                commonSwal("是否取消该限制?", '',function () {
                    get(params.rmLimitInfoUrl,{"Id":Id},function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            vm.loadAllLims();
                            noty({text: '修改成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        } else {
                            noty({text: '修改失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '添加失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                });
            }
        }
    });



    $("#type").on("change",function () {
        var typeid=$("#type").selectpicker("val")
        vm.setIsJC(typeid);
        $('#lname').selectpicker('deselectAll');
        vm.setTypeid(typeid)
        setTimeout(function () {
            $('#lname').selectpicker('refresh');
        },100);
    })

    $(".mydatepicker").datetimepicker({
        format: "yyyy-mm-dd hh:ii:ss",
        autoclose: true,
        todayHighlight: true,
        showMeridian: true,
        pickerPosition: "bottom-left",
        language: 'zh-CN',//中文，需要引用zh-CN.js包
        startView: 2,//月视图
        minView: 0,//日期时间选择器所能够提供的最精确的时间选择视图
    });
    vm.initData();
    vm.loadAllLims();




});

