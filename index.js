"use strict";

const express = require('express');
const path = require('path');
const logger = require('morgan');

const app = express();

// static files
const clientPath = path.join(__dirname,'./www/');

app.use(express.static(clientPath));
app.use(logger('dev'));

app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath,'index.html'))
});

const server = app.listen(1024, () => {
  console.log('** express started on port 1024. **');
});