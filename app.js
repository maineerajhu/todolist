const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

const items = [];
const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://maineerajhu:iAmn33r%40j@cluster0.ljbzd.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema)

const item1 = new Item ({
  name: "Plan Your Day!"
});

const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

  Item.find({}, function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItem: foundItems});
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
      list.save();
      res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
      }
    }
  });

});

app.post("/work", function(req, res){
  const item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.post("/", function(req, res){
   const itemName = req.body.newItem;
   const listName = req.body.list;
   const item = new Item ({
     name: itemName
   });

   if(listName==="Today"){
     item.save();

     res.redirect("/");
   } else {
     List.findOne({name: listName}, function(err, foundList){
       foundList.items.push(item);
       foundList.save();
       res.redirect("/" + listName);
     });
   }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("Successfully deleted");
      res.redirect("/");
    }
  });
} else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}

});

const port = (process.env.PORT || 3000);

app.listen(port, function(){
  console.log("Server started successfully");
});
