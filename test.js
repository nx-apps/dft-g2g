  var async = require('async');
  var companys=[{name:"xx"},{name:"yy"}];
     async.each(companys, function (company, next) {
        company.name="aa";
        next();
     },function(error){
         console.log(companys);
     });