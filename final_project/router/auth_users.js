const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = 
[
  {
    "username": "user100",
    "password": "pwd1"
  },
  {
    "username": "user2",
    "password": "pwd2"
  }
];

const isValid = (username)=>{
  let user = users.filter((i) => i.username === username);
  if(user.length === 0) return false;
  return true;
}

const authenticatedUser = (username,password)=>{
  let user = users.filter((i) => i.username === username && i.password === password);
  if(user.length === 0) return false;
  return true;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let pwd = req.body.password;

  if (!username || !pwd)
    return res.status(400).send("username or Password missing");
  if(!authenticatedUser(username,pwd)) return res.status(400).send("Incorrect username/Password");
  let token = jwt.sign({data: pwd}, 'access', {expiresIn : 60 * 60});
  req.session.authorization = {token, username};

  res.status(200).send("Login Successful");
});

// Add a book review
regd_users.post("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let review = req.body;
  if (!isbn || !review)
    return res.status(400).send("ISBN or review missing");
  if (!books[isbn])
    return res.status(400).send("Book not found");
  let username = req.session.authorization['username'];
  books[isbn].reviews[username] = review;
  res.status(200).send("Review added successfully");
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let username = req.session.authorization['username'];

  if (!isbn)
    return res.status(400).send("ISBN missing");
  if (!books[isbn])
    return res.status(400).send("Book not found");
  if (!books[isbn].reviews[username])
    return res.status(400).send("Review not found");
  delete books[isbn].reviews[username];
  res.status(200).send("Review deleted successfully");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
