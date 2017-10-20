/**
 * Created by sunconglin on 2017-6-15.
 */
var vm;
$(document).ready(function () {

    jQuery.ajaxSettings.traditional = true;

    vm = new Vue({
        el: '#webApp',
        data: {
            brands: [],
            cjlist: [],
            isLoading: 0,
            cjmodes: CjModeMap,
            cjvalids: CjValidMap,
            cjinfo: {},
        },
        methods: {
            initConditions: function () {
                refreshData()
            },
            /**
             * 初始化 radio checkbox 点击事件
             */
            initStyle: function () {
                if ($(".iradio").length > 0) {
                    $(".iradio").iCheck({
                        radioClass: 'iradio_minimal-grey'
                    });
                }

                //全选CheckBox初始化
                $("input[type='checkbox'].master[value='全选']").on('ifChecked ifUnchecked', function (event) {
                    var cbs = $("input[type='checkbox'].slave[name='"+this.name+"']");
                    if(event.type == 'ifChecked'){
                        cbs.iCheck('check');
                    }else{
                        cbs.iCheck('uncheck');
                    }
                });

                //批量模式更改select控件初始化
                $("#cjBatchCtlModeSelect").change(function () {
                    var selected = $('#cjBatchCtlModeSelect').val();
                    if(selected == '-1') {
                        return;
                    }
                    vm.setCjMode(1, selected, '');
                    $('#cjBatchCtlModeSelect').selectpicker('val', '-1');
                });
               //单个模式更改select控件初始化
                $("table").on("click",".cjCtlModeSelect li",function () {
                    //获取当前彩机模式td元素
                    var currMode=$(this).parents("td").siblings(":eq(3)");
                    //判断更改模式是否需要更改，如与当前模式相同或选择模式为“模式”，则停止模式修改操作
                    if(currMode.html()==$(this).text()||$(this).text()=="模式"){
                        return ;
                    };
                    //获取彩机当前名称
                    var cjName=$(this).parents("td").siblings(":eq(2)").html();
                    if($(this).text()=="出票"){//如果更改模式为“出票”，则模式值为1
                        vm.setCjMode(0, 1,cjName );
                    }else{//如果为兑奖，则模式值为2
                        vm.setCjMode(0, 2, cjName);
                    }

                });
                //批量操作select控件初始s化
                $("#cjBatchCtlOperatorSelect").change(function () {
                    var selected = $('#cjBatchCtlOperatorSelect').val();
                    if(selected == '-1') {
                        return;
                    }

                    if (selected == '1' || selected == '2'){
                        vm.setCjValid(1, selected=='1'?1:0, '');
                    }else if (selected == '3' || selected == '4'){
                        vm.setCjCtl(1, selected=='3'?1:0, '');
                    }else if (selected == '5'){
                        vm.setCjLogin(1, '');
                    }else if (selected == '6'){
                        vm.setCjOff(1, '');
                    }else if (selected == '7'){
                        vm.setCjDel(1, '');
                    }
                    $('#cjBatchCtlOperatorSelect').selectpicker('val', '-1');
                });

                //单个操作更改select控件初始化
                $("table").on("click",".cjCtlOperatorSelect li",function () {
                    //获取当前彩机模式td元素
                    var optCont=$(this).text();
                    if(optCont=="操作"){
                        return;
                    }

                    //获取彩机当前名称
                    var cjName=$(this).parents("td").siblings(":eq(2)").html();
                    if (optCont == '启用' || optCont == '禁用'){
                        vm.setCjValid(0, optCont=='启用'?1:0, cjName);
                    }else if (optCont == '控制外设' || optCont == '复原外设'){
                        vm.setCjCtl(0, optCont=='控制外设'?1:0, cjName);
                    }else if (optCont == '登录'){
                        vm.setCjLogin(0, cjName);
                    }else if (optCont == '关机'){
                        vm.setCjOff(0, cjName);
                    }else if (optCont == '删除'){
                        vm.setCjDel(0, cjName);
                    }
                });

            },
            /**
             * 加载彩机修改模态框
             */
            loadCjInfoMode: function (cjname, opt) {
                if (opt == 1) {//添加
                    $('#cjedit-brand').selectpicker('deselectAll');
                    $('#cjedit-brand').selectpicker('refresh');//重绘下拉框
                    vm.cjinfo = {"id":-100};
                    $('#myModalLabel').text("【添加】")
                    $("#modalCjEdit").modal('show');
                }else { //修改
                    mypost(params.cjmanagerGetcjinfoUrl, {"cjname": cjname}, function (data) {
                        $('#cjedit-brand').selectpicker('deselectAll');
                        $('#cjedit-brand').selectpicker('refresh');//重绘下拉框
                        vm.cjinfo = data;
                        $('#myModalLabel').text("【修改】"+vm.cjinfo.cjname)
                        $('#cjedit-brand').selectpicker('val', vm.cjinfo.brand);
                        $("#modalCjEdit").modal('show');
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '加载失败', layout: 'topCenter', type: 'error', timeout: 2000});
                        vm.closeCjInfoMode()
                    });
                }
            },
            /**
             * 关闭彩机修改模态框
             */
            closeCjInfoMode: function () {
                vm.cjinfo = {};
                $('#myModalLabel').text("");
                $("#modalCjEdit").modal('hide');
            },
            /**
             * 修改和添加彩机数据
             */
            editCjInfo: function () {
                vm.cjinfo.brand = $('#cjedit-brand').val();
                if(vm.cjinfo.id == -100) {//添加
                    mypost(params.cjmanagerCjinsertUrl, vm.cjinfo, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            vm.closeCjInfoMode();
                            refreshData();
                            noty({text: '添加成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        } else {
                            noty({text: '添加失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '添加失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                }else {//修改
                    mypost(params.cjmanagerCjeditUrl, vm.cjinfo, function (data) {
                        if (data && data.code == Constant.SUCCESS) {
                            vm.closeCjInfoMode();
                            refreshData();
                            noty({text: '修改成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        } else {
                            noty({text: '修改失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                        }
                    }, function(XMLHttpRequest, textStatus, errorThrown) {
                        noty({text: '修改失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                    });
                }
            },
            setCjMode: function (opt, val, cjname) {
                var infostr = "";
                var cjlist = [];
                var all = false;
                if (opt == 0){
                    infostr = "是否更改模式为"+vm.cjmodes[val]+"？";
                    cjlist = [cjname];
                }else if (opt == 1){
                    infostr = "是否批量更改模式为"+vm.cjmodes[val]+"？";
                    cjlist = getchecklist();
                    if (cjlist.length == 0) {
                        return
                    }
                }else { return }
                commonSwal(infostr, '', function () {
                    vm.sendOperator(0, cjlist, val, all);
                });
            },
            setCjValid: function (opt, val, cjname) {
                var infostr = "";
                var cjlist = [];
                var all = false;
                if (opt == 0){
                    infostr = "是否设置"+vm.cjvalids[val]+"？";
                    cjlist = [cjname];
                }else if (opt == 1){
                    infostr = "是否批量设置"+vm.cjvalids[val]+"？";
                    cjlist = getchecklist();
                    if (cjlist.length == 0) {
                        return
                    }
                }else if (opt == 2){
                    infostr = "是否一键设置"+vm.cjvalids[val]+"？";
                    all = true;
                    cjlist = [cjname];
                }else { return }
                commonSwal(infostr, '', function () {
                    vm.sendOperator(1, cjlist, val, all);
                });
            },
            setCjCtl: function (opt, val, cjname) {
                var infostr = "";
                var cjlist = [];
                var all = false;
                if (opt == 0){
                    infostr = "是否设置外设控制？";
                    cjlist = [cjname];
                }else if (opt == 1){
                    infostr = "是否批量设置外设控制？";
                    cjlist = getchecklist();
                    if (cjlist.length == 0) {
                        return
                    }
                }else if (opt == 2){
                    infostr = "是否一键设置外设控制？";
                    all = true;
                    cjlist = [cjname];
                }else { return }

                commonSwal(infostr, '', function () {
                    vm.sendOperator(3, cjlist, val, all);
                });
            },
            setCjDel: function (opt, cjname) {
                var infostr = "";
                var cjlist = [];
                var all = false;
                if (opt == 0){
                    infostr = "是否删除彩机？";
                    cjlist = [cjname];
                }else if (opt == 1){
                    infostr = "是否批量删除彩机？";
                    cjlist = getchecklist();
                    if (cjlist.length == 0) {
                        return
                    }
                }else { return }
                commonSwal(infostr, '', function () {
                    vm.sendOperator(2, cjlist, -1, all);
                });
            },
            setCjLogin: function (opt, cjname) {
                var infostr = "";
                var cjlist = [];
                var all = false;
                if (opt == 0){
                    infostr = "是否设置登录？";
                    cjlist = [cjname];
                }else if (opt == 1){
                    infostr = "是否设置批量登录？";
                    cjlist = getchecklist();
                    if (cjlist.length == 0) {
                        return;
                    }
                }else if (opt == 2){
                    infostr = "是否设置一键登录？";
                    all = true;
                    cjlist = [cjname];
                }else { return }
                commonSwal(infostr, '', function () {
                    vm.sendOperator(4, cjlist, -1, all);
                });
            },
            setCjOff: function (opt, cjname) {
                var infostr = "";
                var cjlist = [];
                var all = false;
                if (opt == 0){
                    infostr = "是否设置关机？";
                    cjlist = [cjname];
                }else if (opt == 1){
                    infostr = "是否设置批量关机？";
                    cjlist = getchecklist();
                    if (cjlist.length == 0) {
                        return;
                    }
                }else if (opt == 2){
                    infostr = "是否设置一键关机？";
                    all = true;
                    cjlist = [cjname];
                }else { return }
                commonSwal(infostr, '', function () {
                    vm.sendOperator(5, cjlist, -1, all);
                });
            },
            /**
             * 设置
             * @param opt 0:修改模式，1:设置停启用，2:删除，3:外设控制，4:登录，5:关机，6:报表
             * @param cjs
             */
            sendOperator: function (opt, cjs, val, all) {
                var typeStr = typeof cjs
                if (typeStr != "object") {
                    cjs = [cjs]
                }
                if (cjs.length < 1) {
                    return;
                }
                mypost(params.cjmanagerOperatorUrl, {
                    "option": opt,
                    "cjlist": cjs,
                    "val": val,
                    "all": all
                }, function (data) {
                    if (data && data.code == Constant.SUCCESS) {
                        noty({text: '设置成功', layout: 'topCenter', type: 'success', timeout: 2000});
                        refreshData();
                    } else {
                        noty({text: '设置失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '设置失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                });
            },

        }
    });

    vm.initStyle();
    vm.initConditions();
    $(".panel-refresh").on("click",function(){
        refreshData();
    });


    function refreshData(){
        post(params.cjmanagerdataUrl, {}, function (d) {
            vm.brands = d.brands;
            vm.cjlist = d.cjs;
            setTimeout(function () {
                if ($("input[type='checkbox'].slave").length > 0){
                    $("input[type='checkbox'].slave").iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                }

            },100);
        })
    }
    
    function getchecklist() {
        var checkboxs = $("input[type='checkbox'].slave[name='cjselect']:checked");
        var arr = [];
        for (var i=0; i<checkboxs.length; i++){
            arr.push(checkboxs[i].value);
        }
        return arr
    }
});

