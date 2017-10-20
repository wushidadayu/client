/**
 * 导航栏组件
 * @type {void|*}
 */
var Breadcrumb = Vue.extend({
    template: '{{{ breadcrumb }}}',
    props: {
        href: "void(0)",
        title: "主页"
    },
    computed: {
        // a computed getter
        breadcrumb: function () {
            var hrefArr = this.href.split("|");
            var titleArr = this.title.split("|");
            var str = '<ul class="breadcrumb">';
            for (var k = 0; k < titleArr.length; k++) {
                var hrefStr = hrefArr[k];
                var titleStr = titleArr[k];
                if (k == titleArr.length - 1) {
                    str += "<li class='active'>" + titleStr + "</li>";
                } else {
                    str += "<li><a href='" + hrefStr + "'>" + titleStr + "</a></li>";
                }
            }
            str += "</url>";
            return str;
        }
    }
});

Vue.component('breadcrumb', Breadcrumb);