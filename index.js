require('dotenv').config();
const express = require('express'),
      cors = require('cors');
      bodyParser = require('body-parser');

const auth = require('./routes/auth'),
      pictures = require('./routes/pictures'),
      errorHandler = require('./handlers');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', auth);
app.use('/api/user', pictures);

app.use(function (req, res, next) {
  let err = new Error('Not found!');
  err.status = 404;
  next(err);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`)
})
