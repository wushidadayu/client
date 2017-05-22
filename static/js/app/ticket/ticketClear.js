$(document).ready(function () {
    document.title = "清算列表";

    var vm = new Vue({
        el: '#webApp',
        data: {
            codes: []
        },
        methods: {
            init: function () {
                post(params.getLotteryCodesUrl, params.dataType, function (data) {
                    vm.codes = data.data;
                });
            }
        }
    });

    vm.init();


    try {
        var table = $('#clear-list').DataTable({
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
                url: params.clearListUrl,
                dataType: params.dataType,
                contentType: params.contentType,
                type: params.type,
                data: function (d) {
                    // 负责表单的值到Datatable里面
                    setParams("searchForm", d);
                }
            },
            "columns": [
                {"data": "drawSeq"},
                {"data": "lotteryType"},
                {"data": "action"},
                {"data": "detail"},
                {"data": "createTime"}
            ],
            "columnDefs": [{
                "targets": -1,
                "data": "createTime",
                "render": function (data, type, row) {
                    return new Date(data).format("%Y-%m-%d %H:%M:%S");
                }
            }]
        });
        // 加载
        table.on('draw', function () {
            var panel = $(this).parents(".panel");
            unloading();
        });
        table.on('xhr', function () {
            var panel = $(this).parents(".panel");
            panel_refresh(panel);
        });
        table.on('preXhr.dt',function(){
            loading();
        });
        // 搜索表单提交
        $('#clearSearchButton').click(function () {
            table.draw();
        });
    } catch (e) {
        alert(e);
    }
});