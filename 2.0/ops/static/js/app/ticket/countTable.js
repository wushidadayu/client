$(document).ready(function () {
    document.title = "票务统计查询";


    var vm = new Vue({
        el: '#webApp',
        data: {
            cjCount:null,
            stateDate:null,
            endDate:null
        },
        methods: {
            init:function () {
                vm.stateDate=yesterday();
                vm.endDate=yesterday();
            },
            getQueryCount: function () {
                if (vm.stateDate>vm.endDate || vm.endDate>taday()) {
                    noty({text: '日期选择有误', layout: 'topCenter', type: 'error', timeout: 2000});
                    return
                }
                get(params.getYesterdayUrl,{stateDate:vm.stateDate,endDate:vm.endDate},function(data){
                    if (data.lengths==0){
                        noty({text: '查询失败', layout: 'topCenter', type: 'error', timeout: 2000});
                    }else{
                        vm.cjCount=data;
                        noty({text: '查询成功', layout: 'topCenter', type: 'success', timeout: 2000});
                    }
                },function () {
                    noty({text: '查询失败', layout: 'topCenter', type: 'error', timeout: 2000});
                })

            }
        }
    });

    vm.init();

    function taday() {
        return new Date().format("%Y-%m-%d");
    }

    function yesterday() {
        return new Date(new Date().getTime()-24*60*60*1000).format("%Y-%m-%d")
    }


});
