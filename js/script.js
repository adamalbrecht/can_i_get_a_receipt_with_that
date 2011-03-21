$(function(){ 
  var controller = CONTROLLER.init();
  controller.update_receipt();
});

var CONTROLLER = new function() {
  var view = null;
  var model = null;
  this.init = function() {
    view = VIEW.init();
    model = MODEL.init();
    return this;
  };

  this.update_receipt = function() {
    model.query({}, function(data) {
      var results = model.parse_query_results(data);
      view.update_receipt(results);
    });
  };
};

var VIEW = new function() {
  var receipt_item_list = $("#line_items");

  this.init = function() {
    return this;
  };

  this.update_receipt = function(items) {
    $("#line_item_template").tmpl(items).appendTo("#line_items");
  };

};

var MODEL = new function() {
  this.base_url = "http://www.whatwepayfor.com/api/";

  this.init = function() {
    return this;
  };

  this.spending_type_values = ["all", "mandatory", "discretionary", "net_interest"];
  this.filing_values = ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"];
  this.group_by_values = ["agency", "bureau", "function", "subfunction"];

  this.query = function(params, success_callback) {
    var params = $.extend({
        base_url: this.base_url,
        method: "getBudgetAggregate",
        expanded: '',
        year: 2010,     // 1984 - 2015
        spending_type: 0,        // 0 - 3 // See values above
        sortdir: 0, // 0 or 1
        income: 50000,
        filing: 0,      // 0 - 3 // See values above
        group_by: "subfunction",    // See values above
        showChange: false,
        showExtra: false
      },params);

    var url = generate_url(params);

    Ajax.get(url, success_callback);

  };

  this.parse_query_results = function(xml_data) {
    var line_items = [];
    $(xml_data).find("item").each(function () {
      line_items.push(parse_line_item_xml($(this)));
    });
    return line_items;
  };

  var parse_line_item_xml = function(item_node) {
    var line_item = {};
    line_item.category = $(item_node).attr("dimensionname");
    line_item.total_amount = $(item_node).attr("amounti");
    line_item.my_amount = $(item_node).attr("mycosti");
    return line_item;
  };

  var generate_url = function(params) {
    var url = [];
    url.push(params.base_url);
    url.push(params.method + "/");
    url.push("?year=" + params.year);
    url.push("&type=" + params.spending_type);
    url.push("&sortdir=" + params.sortdir);
    url.push("&income=" + params.income);
    url.push("&filing=" + params.filing);
    url.push("&group=" + params.group_by);
    url.push("&showChange=" + (params.showChange * 1));
    url.push("&showExtra=" + (params.showExtra * 1));
    return url.join('');
  };
};

