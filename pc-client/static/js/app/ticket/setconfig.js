/**
 * Created by sunconglin on 2017-6-24.
 */
var vm;
$(document).ready(function () {

    vm = new Vue({
        el: "#webApp",
        data: {
            echoflagMap: {
                true: "开",
                false: "关"
            },
            isconnect: false,
            configinfo: {}

        },
        methods: {
            initLoad: function () {
                mypost(params.cjConfigLoadUrl, {}, function (data) {
                    vm.configinfo = data;
                    isconnect = true;
                    setTimeout(function () {
                        $('#def-pcname').selectpicker('refresh');
                        $('#date-equalspace').selectpicker('refresh');
                        $('#def-pcname').selectpicker('val', vm.configinfo.def_pcname);
                        $('#date-equalspace').selectpicker('val', vm.configinfo.date_equalkeyspace);
                    }, 500);
                }, function (XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '加载数据失败，连接可能断开', layout: 'topLeft', type: 'warning'});
                    isconnect = false;
                })
            },
            saveInfo: function () {
                vm.configinfo.def_pcname = $('#def-pcname').selectpicker('val');
                vm.configinfo.date_equalkeyspace = $('#date-equalspace').selectpicker('val');
                mypost(params.cjConfigSaveUrl, vm.configinfo, function (data) {
                    if (data && data.code == Constant.SUCCESS) {
                        noty({text: '修改成功', layout: 'topCenter', type: 'success', timeout: 2000});
                    } else {
                        noty({text: '修改失败：'+data.message, layout: 'topCenter', type: 'error', timeout: 2000});
                    }
                }, function(XMLHttpRequest, textStatus, errorThrown) {
                    noty({text: '修改失败：', layout: 'topCenter', type: 'error', timeout: 2000});
                });
            }
        }
    });
    vm.initLoad();
});