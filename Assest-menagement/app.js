const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { sequelize } = require('./config/database');
const routes = require('./routes');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/datatables.net/js')));

app.use('/', routes);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});



const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Database connection verified');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log(' Database models synchronized');
    }

    app.listen(process.env.APP_PORT, () => {
      console.log(` Server running on port ${process.env.APP_PORT}`);
    });
  } catch (err) {
    console.error(' Fatal startup error:', err);
    process.exit(1);
  }
};


startServer();

module.exports = app;