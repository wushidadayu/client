$(document).ready(function () {

    document.title = "反打票";

    // 初始化校验引擎
    var form = $("#printForm");
    enableValidation("#printForm");

    var vm = new Vue({
        el: '#webApp',
        data: {
            msg: "",
            sites: [],
            sitesMap: {},
            ticket: {},
            lotteryTypeList: [],
            lotteryTypeMap: {}
        },
        methods: {
            init: function () {
                post(params.listInitUrl, {}, function (data) {
                    vm.sites = data.sites;
                    vm.lotteryTypeList = data.lotteryTypeList;
                    for (var i = 0; i < data.sites.length; i++) {
                        var site = data.sites[i];
                        vm.sitesMap[site.siteId] = site.siteName;
                    }
                    for (var i = 0; i < data.lotteryTypeList.length; i++) {
                        var type = data.lotteryTypeList[i];
                        vm.lotteryTypeMap[type.lotteryCode] = type.value;
                    }
                // 初始化Terminal
                  if(params.ticketNumber){
                        post(params.getByNumberUrl, {"ticketNumber":params.ticketNumber}, function (data) {
                            vm.ticket = data;
                            $("#ticketNumber").prop("readonly", true);
                            $("#printTerminal").prop("readonly", true);
                            $("#terminalMode").prop("readonly", true);

                        });
                    }
                });

            },
            returnList: function () {
                reload(params.backUrl);
            },

            commit: function () {
                if (form.validationEngine('validate')) {
                    post(params.printTicketUrl,
                        form.serializeArray()
                        , function (data) {
                            showResult(vm, data);
                        });
                }
            }
        }
    });

    vm.init();

});
