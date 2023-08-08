const express = require('express');
const axios = require("axios");
const path = require('path');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let username = req.body.username;

  if (!username)
    return res.status(400).send("Username is required");

  if (isValid(username))
    return res.status(400).send("User already exists");
  
  users.push(req.body);
  return res.status(200).send("User registered successfully");
});

// Get the book list available in the shop
public_users.get('/',async (req, res) => {
  try {
    let response = await axios.get('https://db-books.onrender.com/books');
    res.send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    console.log(error);
    throw error; // or handle it here!
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    axios.get('https://db-books.onrender.com/books')
    .then((response) => {
      const book = response.data[req.params.isbn - 1];
      if(!book) return res.status(404).send("Book not found");
      res.send(book);
    })
    .catch((error) => {
      console.log(error);
      res.status(401).send(error);
    });
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  axios.get('https://db-books.onrender.com/books')
  .then((response) =>
  {
    const book = response.data.filter((i) => i.author === req.params.author);
    if(book.length === 0) return res.status(404).send("Book not found");
    res.send(book);
  })
  .catch((error) => {
    console.log(error);
    res.status(401).send(error);
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  axios.get('https://db-books.onrender.com/books')
  .then((response) =>
  {
    const book = response.data.filter((i) => i.title === req.params.title);
    if(book.length === 0) return res.status(404).send("Book not found");
    res.send(book);
  })
  .catch((error) => {
    console.log(error);
    res.status(401).send(error);
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const reviews = Object.entries(books).find(([key,value])=> key === req.params.isbn);
  if(!reviews) return res.status(404).send("Book not found");
  res.send(reviews[1].reviews);
});

module.exports.general = public_users;
