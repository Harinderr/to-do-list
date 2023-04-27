
module.exports.getDate = function getDate() {
const date = new Date();
var options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
 return date.toLocaleDateString("en-US", options);

}

module.exports.getDay = function getDay(){
    
const date = new Date();
var options = {
  weekday: "long",
  
};
return date.toLocaleDateString("en-US", options)


}
