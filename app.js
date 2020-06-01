//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sanju:Test123@cluster0-hnfxh.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todolist!!"
});

const item2 = new Item({
  name: "Hit + button to add Item"
});

const item3 = new Item({
  name: "- Hit this to delete  item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema] 
};

const List = mongoose.model("List", listSchema); 



app.get("/", function(req, res) {

   Item.find({}, function(err, foundItems){

      if(foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Successfully saved defaultitems to DB");  
          }
        });
        res.redirect("/"); 
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
       
   });

});

app.get("/:customListName", function(req,res){
  customListname = _.capitalize(req.params.customListName);
   
  List.findOne({ name: customListname},function(err, foundList){
    if(!err){
      if(!foundList){
        //Create New List
        const list = new List({
          name: customListname,
          items: defaultItems
        });
        list.save(); 
        res.redirect("/" + customListname);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        
      }
    }
  });

  
});

app.post("/", function(req, res){

    const itemName = _.capitalize(req.body.newItem);
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      
    }
    
});

app.post("/delete", function(req, res){
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;

   if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("deleted successfully");
        res.redirect("/");
      }
    });
   } else{
     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
       if (!err) {
         res.redirect("/" + listName);
       }
     });
   }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
