requirejs.config({
    baseUrl: '../js/lib',
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    }
});

requirejs(['jquery', 'hue/hue', 'underscore', 'backbone', 'i-color'], function($, Hue, _, Backbone) {

    var hue = new Hue();

    window.hue = hue;

    var BridgeView = Backbone.View.extend({
        tagName: "li",
        template: _.template($('#bridge-template').html()),
        events: {
            "click .all-on": "allOn",
            "click .all-off": "allOff",
            "click .toggleOnOff": "toggleOnOff",
            "change .color": "setHSV"
        },
        allOn: function() {
            this.model.setGroupState(0, {on: true});
        },
        allOff: function() {
            this.model.setGroupState(0, {on: false});
        },
        toggleOnOff: function(e) {
            var lightId = $(e.target).parents('.light').attr('data-id');
            this.model.setLightState(lightId, {on: !this.model.get('data').lights[lightId].state.on});
        },
        setHSV: function(e) {
            var lightId = $(e.target).parents('.light').attr('data-id');
            var hex = $(e.target).val();
            var hsv = Color.convert(hex, 'hsv');
            console.log(hsv);
            this.model.setLightState(lightId, { hue: Math.round(hsv.h/359*65534), bri: Math.round(hsv.v*2.55), sat: Math.round(hsv.s*2.55)});
        },
        initialize: function() {
            this.listenTo(this.model, 'requestlinkbutton', this.requestLinkbutton);
            this.listenTo(this.model, 'connect', this.render);
            this.listenTo(this.model, 'change:data', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        requestLinkbutton: function() {
            alert('Please press linkbutton');
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    var AppView = Backbone.View.extend({
        el: $("#app"),
        initialize: function() {
            this.listenTo(hue.get('bridges'), 'connect', this.addOne);
            this.listenTo(hue.get('bridges'), 'all', this.render);
            this.bridges = $("#bridges");
        },
        render: function() {

        },
        addOne: function(bridge) {
            var view = new BridgeView({model: bridge});
            this.bridges.append(view.render().el);
        }
    });

    var app = new AppView();

    $("#hue-connect").on("submit", function(e) {
        hue.addBridge($(this).find("input").val());
        e.preventDefault();
    });

});