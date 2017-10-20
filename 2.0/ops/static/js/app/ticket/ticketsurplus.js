/**
 * Created by sunconglin on 2017-6-15.
 */
var vm;
$(document).ready(function () {

    document.title = "多余票";
    jQuery.ajaxSettings.traditional = true;

    vm = new Vue({
        el: '#webApp',
        data: {
            tsl: [],
        },
        methods: {
            initConditions: function () {//初始化函数
                refreshData()
            },
            downloadSource:function(orderId){
                window.location.href = params.tsDownloadSourceUrl+"OrderId="+orderId+"&times="+new Date().getTime();
            },
            /*
            查看彩票内容
             */
            scanContext:function (ts) {
                post(params.tsContextUrl, {"id": ts.Id}, function (data) {
                    $("#tsContext").html(data);
                    $("#modalPcEdit").modal('show');
                }, function (XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '加载失败', layout: 'topCenter', type: 'error', timeout: 2000});

                });
            },
            //关闭彩票内容浏览弹框
            closeContext:function(){
                $("#modalPcEdit").modal('hide');
                $("#tsContext").html("");
            },
            tsDelete:function (id) {
                commonSwal("是否删除该多余票记录?", '', function () {
                    post(params.rmTsUrl, {"id": id}, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            refreshData();
                            noty({text: '删除成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        } else {
                            noty({text: '删除失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '删除失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                });
            }
        },
        filters:{
            /**
             * 日期格式化过滤函数 格式为：%Y-%m-%d %H:%M:%S
             * @param dateStr 日期字符串
             */
            dateFormat:function (dateStr) {
                var date=new Date(dateStr);
                var d=date.format("%Y-%m-%d %H:%M:%S");
                return  d;
            }
        }
    });

   // vm.initStyle();
    vm.initConditions();

   //请求获取ts列表数据函数
    function refreshData(){
        get(params.tsListUrl, {}, function (d) {
            vm.tsl = d;
        })
    }
});

