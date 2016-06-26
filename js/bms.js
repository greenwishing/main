(function () {

    $.bms = $.extend({}, {
        version: '0.0.1',
        defaults: {
            categories: [
                {
                    type: 'EXPEND',
                    name: '行车交通',
                    subcategories: [{name: '自行车维护费'}, {name: '电子钱包'}, {name: '打的'}, {name: '公交车'}, {name: '自行车停车费'}, {name: '回家'}, {name: '地铁'}, {name: '火车票'}, {name: '汽车票'}, {name: '充次数'}]
                }, {
                    type: 'EXPEND', name: '交流通讯', subcategories: [{name: '手机话费'}, {name: '宽带网费'}]}, {
                    type: 'EXPEND',
                    name: '衣服饰品',
                    subcategories: [{name: '护理饰品'}, {name: '衣服裤子'}, {name: '鞋帽包包'}]
                }, {
                    type: 'EXPEND',
                    name: '食品酒水',
                    subcategories: [{name: '早餐'}, {name: '午餐'}, {name: '水果零食'}, {name: '买菜'}, {name: '酒水饮料'}, {name: '晚餐'}, {name: '柴米油盐酱醋茶'}, {name: '牛奶'}]
                }, {
                    type: 'EXPEND',
                    name: '居家物业',
                    subcategories: [{name: '物业管理'}, {name: '家居家俱'}, {name: '花草'}, {name: '电费'}, {name: '装修装饰'}, {name: '家用电器'}, {name: '日常用品'}, {name: '水费'}, {name: '天然气费'}, {name: '房租'}]
                }, {
                    type: 'EXPEND',
                    name: '人情往来',
                    subcategories: [{name: '请客'}, {name: '送礼'}, {name: '孝敬家长'}, {name: '还人钱物'}, {name: '慈善捐助'}, {name: '发红包'}, {name: '兄弟情谊'}]
                }, {
                    type: 'EXPEND',
                    name: '休闲娱乐',
                    subcategories: [{name: '休闲玩乐'}, {name: '旅游度假'}, {name: '看电影'}, {name: '运动健身'}, {name: '腐败聚会'}, {name: '骑行'}]
                }, {
                    type: 'EXPEND',
                    name: '金融保险',
                    subcategories: [{name: '银行手续'}, {name: 'iPhone6'}, {name: 'D90'}, {name: '赔偿罚款'}, {name: '云玺'}, {name: '转出'}]
                }, {
                    type: 'EXPEND',
                    name: '其它杂项',
                    subcategories: [{name: '其它支出'}, {name: '意外丢失'}, {name: '烂账损失'}, {name: '迟到发红包'}]
                }, {
                    type: 'EXPEND',
                    name: '医疗保险',
                    subcategories: [{name: '治疗费'}, {name: '药品费'}, {name: '保健费'}]
                }, {
                    type: 'EXPEND',
                    name: '学习进修',
                    subcategories: [{name: '报刊杂志'}, {name: '培训进修'}, {name: '数码装备'}]
                }, {type: 'BALANCE', name: '余额', subcategories: [{name: '余额'}]}, {
                    type: 'INCOME',
                    name: '收入',
                    subcategories: [{name: '年终奖'}, {name: '过节费'}, {name: '红包'}, {name: '转入'}, {name: '工资'}, {name: '兼职'}, {name: '项目奖金'}]
                }, {
                    type: 'EXPEND',
                    name: '数码产品',
                    subcategories: [{name: '其它'}, {name: '手机相关'}, {name: '电脑相关'}, {name: '冲洗照片'}, {name: '相机相关'}]
                }, {
                    type: 'EXPEND',
                    name: '个人护理',
                    subcategories: [{name: '理发'}, {name: '护理饰品'}]
                }
            ]
        }
    }, $.bms || {});


    // model
    var Billing = Backbone.Model.extend({

    });


    // collection
    var BillingList = Backbone.Collection.extend({
        model: Billing,
        localStorage: new Backbone.LocalStorage("billings")
    });

    var billings = new BillingList;

    // view
    var BillingListView = Backbone.View.extend({
        tagName: 'section',
        empty: $('#tpl-empty').html(),
        initialize: function() {
            billings.fetch();
            this.listenTo(billings, 'add', this.addBilling);
            this.listenTo(billings, 'all', this.render);
        },
        render: function() {
            this.$el.empty();
            this.$list = $('<div class="cells"></div>');
            this.$el.append(this.$list);

            if (billings.length) {
                billings.each(this.addBilling, this);
            } else {
                this.$el.html(this.empty);
            }
            return this;
        },
        addBilling: function(billing) {
            var view = new BillingView({model: billing});
            this.$list.append(view.render().el);
        }
    });
    var TotalView = Backbone.View.extend({
        tagName: 'section',
        template: _.template($('#tpl-billing-total').html()),
        initialize: function() {
            this.listenTo(billings, 'all', this.render);
        },
        render: function() {
            this.$el.html(this.template({total: this.calculate()}));
            this.$el.toggleClass('hide', billings.length == 0);
            return this;
        },
        calculate: function() {
            var total = 0;
            billings.each(function(billing){
                total += parseFloat(billing.get('amount')) || 0;
            });
            return total;
        }
    });
    var BillingView = Backbone.View.extend({
        tagName: 'div',
        className: 'cell',
        template: _.template($('#tpl-billing-item').html()),
        events: {
            'click .item-remove': 'clear'
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        clear: function() {
            this.model.destroy();
        }
    });
    var BillingFormView = Backbone.View.extend({
        tagName: 'section',
        template: _.template($('#tpl-billing-form').html()),
        render: function() {
            this.$el.append(this.template({}));
            var $category = this.$('#category');
            $category.empty();
            var $empty = $('<option value="">请选择</option>');
            $category.append($empty);
            _.forEach($.bms.defaults.categories, function(category){
                var $group = $('<optgroup></optgroup>').attr({label: category.name});
                _.forEach(category.subcategories, function(subcategory) {
                    var $option = $('<option></option>').attr({value: subcategory.name}).html(subcategory.name);
                    $group.append($option);
                });
                $category.append($group)
            });
            return this;
        }
    });
    var FunctionsView = Backbone.View.extend({
        initialize: function(context) {
            this.btns = context.btns;
            this.$el = $('#functions');
        },
        render: function() {
            this.$el.empty();
            _.forEach(this.btns, this.addBtn, this);
            return this;
        },
        addBtn: function(btn) {
            var view = new BtnView({btn: btn});
            this.$el.append(view.render().el);
        }
    });
    var BtnView = Backbone.View.extend({
        tagName: 'a',
        className: 'btn',
        initialize: function(context) {
            this.btn = $.extend({}, {className: '', href: 'javascript:void(0)', label: '按钮'}, context.btn || {});
        },
        render: function() {
            this.$el.addClass(this.btn.className);
            this.$el.html(this.btn.label);
            this.$el.attr({href: this.btn.href});
            return this;
        }
    });


    // app
    var BillingApp = Backbone.Router.extend({
        routes: {
            '': 'list',
            'billing/list': 'list',
            'billing/add': 'add',
            'billing/save': 'save'
        },
        initialize: function(){
            this.$el = $('#page');
        },
        list: function() {
            var view = new BillingListView();
            this.$el.html(view.render().el);
            var totalView = new TotalView();
            this.$el.append(totalView.render().el);
            new FunctionsView({btns: [
                {label: '创建', href: '#billing/add', className: 'btn'}
            ]}).render();
        },
        add: function() {
            var view = new BillingFormView();
            this.$el.html(view.render().el);
            new FunctionsView({parentView: this, btns: [
                {label: '保存', href: '#billing/save', className: 'btn btn-primary'},
                {label: '取消', href: '#billing/list', className: 'btn btn-warning'}
            ]}).render();
            this.formInited = true;
        },
        save: function() {
            if (!this.formInited) {
                this.navigate('billing/add', {trigger: true});
                return;
            }
            var $category = $('#category');
            if (_.isEmpty($category.val())) {
                alert('请选择分类');
                $category.focus();
                return;
            }
            var $date = $('#date');
            if (_.isEmpty($date.val())) {
                alert('请选择日期');
                $date.focus();
                return;
            }
            var $amount = $('#amount');
            if (_.isEmpty($amount.val())) {
                alert('请输入金额');
                $amount.focus();
                return;
            } else if (_.isNaN(parseFloat($amount.val()))) {
                alert('请输入正确的金额');
                $amount.focus();
                return;
            }
            billings.create({name: $category.val(), date: $date.val(), amount: $amount.val()});
            this.navigate('billing/list', {trigger: true});
        }
    });

    new BillingApp();
    Backbone.history.start();
})();