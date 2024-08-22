const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;
console.log("Mongo db u ri is"+mongoURI)
mongoose.connect(mongoURI, {
  connectTimeoutMS: 30000, 
  socketTimeoutMS: 45000,  
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log(err));



const productSchema = mongoose.Schema({
  shoeName: {
    type: String,
    required: true
  },
  shoePrice: {
    type: Number,
    require: true
  },
  shoeCategory: {
    type: String,
    require: true
  },
  shoeDescription: {
    type: String,
    require: true
  },
  shoeImage: {
    type: String,
    require: true
  },
  shoeColor: {
    type: String,
    require: true
  },
  shoeType: {
    type: String,
    require: true
  },
  shoeSize: {
    type: String,
    require: true
  }
})

module.exports = mongoose.model('product',productSchema)