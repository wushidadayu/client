$(document).ready(function () {
    document.title = "商户管理列表";

    var table = null;
    var vm = new Vue({
        el: '#webApp',
        data: {
        },
        methods: {
            query: function () {
                table.draw();
            }
        }
    });

    initTable();

    function initTable() {
        //设置查询初值
        if(params.companyName){
            $("#companyName").val(params.companyName);
        }
        try {
            table = $('#vendor-list').DataTable({
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
                    url: params.listUrl,
                    dataType: params.dataType,
                    contentType: params.contentType,
                    type: params.type,
                    data: function (d) {
                        // 负责表单的值到Datatable里面
                        setParams("searchForm", d);
                    }
                },
                "columns": [
                    {"data": "userId"},
                    {"data": "companyName"},
                    {"data": "callbackPrintUrl"},
                    {"data": "callbackClaimUrl"},
                    {"data": "lastOrder"}
                ],
            });

            // 加载
            table.on('draw', function () {
                unloading();

            });
            table.on('preXhr.dt', function () {
                loading();
            });
        } catch (e) {
            alert(e);
        }
    }

});
