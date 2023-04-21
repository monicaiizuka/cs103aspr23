
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var transactionItemSchema = Schema( {
  description: String,
  amount: Number,
  date: Date,
  createdAt: Date,
  category: String,
  userId: {type:ObjectId, ref:'user' }
} );

module.exports = mongoose.model( 'transactionItem', transactionItemSchema );
