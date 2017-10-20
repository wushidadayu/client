$(document).ready(function () {
    document.title = "失败票";

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
        try {
            table = $('#query-list').DataTable({
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
                        setParams("queryForm", d);
                    }
                },
                "columns": [
                    {"data": "terminalId"},
                    {"data": "ticketId"},
                    {"data": "createTime"},
                    {"data": "detail"}
                ],
                "columnDefs": [{
                    "targets": 2,
                    "data": "createTime",
                    "render": function (data, type, row) {
                        return new Date(data).format("%y-%m-%d  %H:%M:%S");
                    }
                }]
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
