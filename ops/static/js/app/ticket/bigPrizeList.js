$(document).ready(function () {
    document.title = "大奖票";

    var vm = new Vue({
        el: '#webApp',
        data: {
            bpl:[],
            statmap: {
                "102": "成功票",
                "104": "失败票",
                "105": "限号票"
            }
        },
        methods: {
            init: function () {
                checkboxEnableStyle();
            },
            /**
             * 查询大奖票
             */
            searchBigPrize: function () {
                var data = $("#search-tickets").val();
                if (data == ""){
                    return;
                }
                var tickets = data.split("\n");
                for(var i=0;i<tickets.length;i++) {
                    tickets[i].trim('\r');
                    if (tickets[i].length < 8) {
                        tickets.splice(i, 1);
                        i = i - 1;
                    }
                }
                if (tickets.length == 0) {
                    return
                }
                mypost(params.bigPrizeSearchUrl, {"tickets": tickets}, function (data) {
                    if ("code" in data && data.code == 10001) {
                        noty({text: '查询失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }else {
                        vm.bpl = data.bpl;
                        $("input[type='checkbox'].master[value='全选']").iCheck('uncheck');
                        setTimeout(function () {
                            if ($("input[type='checkbox'].slave").length > 0){
                                $("input[type='checkbox'].slave").iCheck({
                                    checkboxClass: 'icheckbox_minimal-grey'
                                })
                            }
                        },100);
                    }
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '查询失败', layout: 'topCenter', type: 'error', timeout: 2000});
                });
            },
            /**
             * 单张下载
             * @param name
             */
            infoDownload: function (name) {
                if (name.length < 10){
                    noty({text: '票ID长度过短，票ID：'+name, layout: 'topCenter', type: 'error', timeout: 2000});
                    return
                }
                window.location.href = params.oneDownloadUrl+name;
            },
            /**
             * 批量下载
             */
            BatchDownload: function () {
                var checkboxs = $("input[type='checkbox'].slave[name='bigprize']:checked");
                var arrticket = [];
                for (var i=0; i<checkboxs.length; i++){
                    if (checkboxs[i].value.length < 10) {
                        noty({text: '票ID长度过短，票ID:'+checkboxs[i].value, layout: 'topCenter', type: 'error', timeout: 2000});
                        return
                    }
                    arrticket.push(checkboxs[i].value);
                }

                if (arrticket.length == 0) {
                    return
                }

                if (arrticket.length == 1) {
                    vm.infoDownload(arrticket[0]);
                    return
                }

                post(params.batchDownUrl, {"tickets": arrticket}, function (data) {
                    if ("downKey" in data) {
                        window.location.href = params.DownloadUrl+data.downKey;
                    }else {
                        if ("code" in data) {
                            noty({text: '批量下载失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }else {
                            noty({text: '批量下载失败', layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    }
                });
            }
        }
    });

    vm.init();


    /**
     * 初始化 radio checkbox 点击事件
     * 对按钮样式进行设置
     */
    function checkboxEnableStyle() {
        //全选CheckBox初始化
        $("input[type='checkbox'].master[value='全选']").on('ifChecked ifUnchecked', function (event) {
            var cbs = $("input[type='checkbox'].slave[name='"+this.name+"']");
            if(event.type == 'ifChecked'){
                cbs.iCheck('check');
            }else{
                cbs.iCheck('uncheck');
            }
        });
    }
});
