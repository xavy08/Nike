var express = require('express');
var router = express.Router();
const Product = require('./product')
const Orders = require('./order')
const path = require('path')
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const nodemailer = require('nodemailer');
var validator = require("email-validator");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Firebase setup
const { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID} =
  process.env;

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Multer setup
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

router.post('/addproduct', upload.single('shoeImage'), async function (req, res) {
  try {
    const { shoeName, shoePrice, shoeCategory, shoeDescription, shoeColor, shoeType, shoeSize } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      const dateTime = Date.now();
      const fileName = `shoes/${dateTime}-${req.file.originalname}`;
      const storageRef = ref(storage, fileName);
      const metadata = {
        contentType: req.file.mimetype,
      };
      
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, req.file.buffer, metadata);
      
      // Get the public URL of the uploaded file
      imageUrl = await getDownloadURL(storageRef);
    }

    const product = new Product({
      shoeName,
      shoePrice,
      shoeCategory,
      shoeDescription,
      shoeImage: imageUrl,
      shoeColor,
      shoeType,
      shoeSize
    });
    await product.save();
    res.status(201).json({ message: 'Product Uploaded Successfully', product });
  } catch (err) {
    console.log('Error in POST /addproduct:', err);
    console.log('Error message:', err.message);
    console.log('Error stack:', err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});


router.get('/allproducts', (req, res) => {
  Product.find()
      .then((products) => {
          res.json(products); 
      })
      .catch((err) => {
          res.status(500).send(err);
      });
});

router.post('/delete/:id', async (req, res) => {
  try {
      const doc = await Product.findOneAndDelete({ _id: req.params.id });
      if (!doc) {
          res.status(404).json({ message: "Document not found" });
      } else {
          res.status(200).json({ message: "Document deleted successfully" });
      }
  } catch (err) {
      console.log(`Error: ${err}`);
      res.status(500).json({ error: err.message });
  }
});


router.get('/allOrders', (req, res) => {
  Orders.find()
      .then((order) => {
          res.json(order); 
      })
      .catch((err) => {
          res.status(500).send(err);
      });
});

router.post('/deleteOrder/:id', async (req, res) => {
  try {
      const doc = await Orders.findOneAndDelete({ _id: req.params.id });
      if (!doc) {
          res.status(404).json({ message: "Document not found" });
      } else {
          res.status(200).json({ message: "Document deleted successfully" });
      }
  } catch (err) {
      console.log(`Error: ${err}`);
      res.status(500).json({ error: err.message });
  }
});

router.get('/shoe/:type', (req, res) => {
  try {
    const { type } = req.params;
    if (type === 'Collection') {
      Product.find()
        .then(products => {
          if (products.length === 0) {
            console.log("No products found");
            return res.status(404).json({ message: "No items found" });
          }
          res.json(products);
          console.log("Data sent successfully");
        })
        .catch(err => {
          console.error("Error finding products:", err);
          res.status(500).json({ message: "Error retrieving products" });
        });
    } else {
      Product.find({ shoeCategory: type })
        .then(products => {
          if (products.length === 0) {
            console.log("No products found for category:", type);
            return res.status(404).json({ message: "No items found" });
          }
          res.json(products);
          console.log("Data sent successfully for category:", type);
        })
        .catch(err => {
          console.error("Error finding products:", err);
          res.status(500).json({ message: "Error retrieving products" });
        });
    }
  } catch(err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "zainjamshaid55@gmail.com",
    pass: "uvub lwma rpec wwqu",
  },
});

async function confirmOrder(email, firstName, lastName, address, apartmentSuite, city, postalCode, phoneNumber, ordered) { 
  const check =  validator.validate(email);
  if(check){
    console.log("Email is valid")
    }else{
      console.log("Email is invalid")
      return 
    }

  const htmlContent = `
    <p>Dear ${firstName} ${lastName},</p>
    <p>Thank you for your recent order with Nike!</p>
    <p>We're excited to fulfill your request and get your items on the way.</p>
    <h2>Your Order Details</h2>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Image</th>
          <th>Shoe Size</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${ordered && ordered.length > 0 ? ordered.map(item => `
          <tr>
            <td>${item.shoeName}</td>
            <td><img src="http://localhost:5000/images/${item.shoeImage}" alt="${item.shoeName}" width="100"></td>
            <td>${item.shoeSize}</td>
            <td>$${item.shoePrice}</td>
          </tr>
        `).join('') : ''}
      </tbody>
    </table>
    <p>Your order will be shipped to:</p>
    <p>${address}<br>${apartmentSuite}<br>${city}, ${postalCode}</p>
    <p>If you have any questions or concerns, please feel free to reach out to us at zainjamshaid55@gmail.com.</p>
    <p>Thank you again for choosing Nike!</p>
    <p>Sincerely,<br>Zain Jamshaid</p>
  `;

  const text = `
    Dear ${firstName} ${lastName},

    Thank you for your recent order with Nike!

    We're excited to fulfill your request and get your items on the way.

    Your Order Details:
    ${ordered && ordered.length > 0 ? ordered.map(item => `
      - ${item.shoeName} (Qty: ${item.shoeSize}, Price: $${item.shoePrice.toFixed(2)})`).join('\n') : ''}

    Your order will be shipped to:
    ${address}
    ${apartmentSuite}
    ${city}, ${postalCode}

    If you have any questions or concerns, please feel free to reach out to us at zainjamshaid55@gmail.com.

    Thank you again for choosing Nike!

    Sincerely,
    Zain Jamshaid
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Nike" <zainjamshaid55@gmail.com>',
      to: email,
      subject: "Thank You for Your Order with Nike!",
      text: text,
      html: htmlContent
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

router.post('/order', async (req, res) => {
  try {
    const { email, firstName, lastName, address, apartmentSuite, city, postalCode, phoneNumber, ordered } = req.body;
    const order = await new Orders({
      email, firstName, lastName, address, apartmentSuite, city, postalCode, phoneNumber, ordered
    });
    await order.save()
    await confirmOrder(email, firstName, lastName, address, apartmentSuite, city, postalCode, phoneNumber, ordered);

    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
});


module.exports = router;
