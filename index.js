require('dotenv').config();
const express = require("express");
const bodyparser = require("body-parser");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));

// database connection and task
console.log(process.env.MONGO_PASS)
async function connectToDB(){
try {
 await mongoose.connect(process.env.MONGO_PASS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log('Connected to atlas');
}
catch (err){
 console.log('There is an error in connecting');
}
}
connectToDB()

const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "BreakFast",
});

const item2 = new Item({
  name: "Trading",
});

const item3 = new Item({
  name: "Book reading",
});
const itemArray = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("list", listSchema);

// database task end
app.get("/", function (req, res) {
  const day = date.getDay();

  Item.find({})
    .exec()
    .then((result) => {
      if (result.length === 0) {
        Item.insertMany(itemArray)
          .then((result) => {
            console.log("Task done successfully");
            res.redirect("/");
          })
          .catch((err) => {
            console.log("error encountered");
          });

      } else {
        res.render("index", { dayis: day, newitem: result });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/", function (req, res) {
const newitem = req.body.newitem
const listitem = req.body.plusbutton
  const item = new Item({
    name: newitem
  });

  if(listitem === 'Tuesday'){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name : listitem}).exec()
    .then(data => {
      data.items.push(item)
      data.save();
      res.redirect('/lists/' + listitem)
      console.log(`added to ${listitem}`) })
    .catch(err => {
       console.log('Error occurred');
    })

  }

});

app.post("/delete", function (req, res) {

  const listitem = req.body.submit
  const listname = req.body.listname
  List.findOne({ name : listname })
    .exec()
    .then((result) => {
      if(listname == 'Tuesday'){
        Item.deleteOne({}).exec().then(result => {console.log('Successfully done');}).catch(err => {console.log('NOt done');})

        res.redirect('/')
      }
      else {
        List.findOneAndUpdate({name : listname}, {$pull : {items : { _id : listitem}}}).exec().then(result => {console.log('updated');})
        .catch(err => {console.log('error 404');})
        res.redirect('/lists/'+listname)
      }

    // res.redirect('/' + listitem)


    })
    .catch((err) => {
      console.log("Error occurred while deleting");
    });

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/lists/:customlist", function (req, res) {
  const customlistname = _.lowerCase(req.params.customlist);

  List.findOne({ name: customlistname }).exec()
    .then(result => {

      if (!result) {

        const list = new List({
          name: customlistname,
          items: itemArray,
        });
        list.save();
        res.redirect('/lists/'+ customlistname)

      }
      else {
        res.render("index", { dayis: customlistname, newitem: result.items });
      }
    })
    .catch(err => {
      console.log("doesnot exits");
    });

});

app.listen(port, function () {
  console.log("File is running on this port" + port);
});
