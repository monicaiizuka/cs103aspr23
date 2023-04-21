/*
  todo.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const TransactionItem = require('../models/TransactionItem')
const User = require('../models/User')


/*
this is a very simple server which maintains a key/value
store using an object where the keys and values are lists of strings
*/

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/transactions/',
  isLoggedIn,
  async (req, res, next) => {
    const sortBy = req.query.sortBy
    const categorySort = sortBy== 'category'
    const amountSort = sortBy=='amount'
    const descriptionSort = sortBy=='description'
    const dateSort = sortBy=='date'
    let items=[]

    if(sortBy) {
      if (categorySort) {
        items = await TransactionItem.find({userId:req.user._id})
            .sort({category:1,date:1})
      } 
      else if (amountSort) {
        items = await TransactionItem.find({userId:req.user._id})
            .sort({amount:-1,date:1})
      } else if (descriptionSort) {
        items = await TransactionItem.find({userId:req.user._id})
            .sort({description:1,date:1})
      } else if (dateSort) {
        items = await TransactionItem.find({userId:req.user._id})
            .sort({date:-1})
      }
    }
      else {
        items = await TransactionItem.find({userId:req.user._id})
            .sort({date:-1})
    }   
     res.render('transactionList',{items})
});


/* add the value in the body to the list associated to the key */
router.post('/transactions',
  isLoggedIn,
  async (req, res, next) => {
      const transaction = new TransactionItem(
        {description: req.body.description,
         amount: parseFloat(req.body.amount),
         category: req.body.category,
         date: req.body.date,
         createdAt: new Date(),
         userId: req.user._id
        })
      await transaction.save();
      res.redirect('/transactions')
});

router.get('/transactions/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transactions/remove/:itemId")
      await TransactionItem.deleteOne({_id:req.params.itemId});
      res.redirect('/transactions')
});


router.get('/transactions/edit/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transactions/edit/:itemId")
      const item = 
       await TransactionItem.findById(req.params.itemId);
      //res.render('edit', { item });
      res.locals.item = item
      res.render('editTr')
      //res.json(item)
});

router.post('/transactions/updateTransactionItem',
  isLoggedIn,
  async (req, res, next) => {
      const {itemId,description,amount,category,date} = req.body;
      console.log("inside /transactions/:itemId");
      await TransactionItem.findOneAndUpdate(
        {_id:itemId},
        {$set: {description,amount,category,date}} );
      res.redirect('/transactions')
});

router.get('/transactions/groupBy',
  isLoggedIn,
  async (req, res, next) => {
      let results =
            await TransactionItem.aggregate(
                [ 
                  {$group:{
                    _id:'$category',
                    total:{$sum:'$amount'}
                    }},
                  {$sort:{total:-1}},              
                ])
              
        results = 
           await User.populate(results,
                   {path:'category',
                   select:['category','amount']})

        //res.json(results)
        res.render('groupByCategory',{results})
});


module.exports = router;
