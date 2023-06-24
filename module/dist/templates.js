this["FRIGHT9E"] = this["FRIGHT9E"] || {};
this["FRIGHT9E"]["templates"] = this["FRIGHT9E"]["templates"] || {};
this["FRIGHT9E"]["templates"]["abilities"] = Handlebars.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
this["FRIGHT9E"]["templates"]["attributes"] = Handlebars.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
this["FRIGHT9E"]["templates"]["condition-list"] = Handlebars.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
this["FRIGHT9E"]["templates"]["drawback-list"] = Handlebars.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
this["FRIGHT9E"]["templates"]["skill-list"] = Handlebars.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
this["FRIGHT9E"]["templates"]["specialization-list"] = Handlebars.template({
    "compiler": [8, ">= 4.3.0"],
    "main": function(container, depth0, helpers, partials, data) {
      return `
      <select>
      {{#each specializationTypes}}
        <option value="{{@key}}">{{this}}</option>
      {{/each}}
      </select>
      `;
    },
    "useData":true
});