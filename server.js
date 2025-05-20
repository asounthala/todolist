const express = require('express');     
const favicon = require('serve-favicon');
const path = require('path');
const app = express();                  
const port = 4138;                      

/* ---------------------------- Route Imports ---------------------------- */
const indexRoutes = require('./routes/index');
const errorRoutes = require('./routes/errors');

/* ---------------------------- SET-UP ---------------------------- */
// Set Pug as the view engine
app.set("view engine", "pug");
app.set("views", "views");

// Middleware for static files (CSS, JS, Images)
app.use("/css", express.static("public/css"));
app.use("/images", express.static("public/images"));
app.use("/js", express.static("public/js"));
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));

// Middleware to parse JSON 
app.use(express.json());

/* ---------------------------- Routes ---------------------------- */
app.use('/', indexRoutes);  // Main Page 
app.use(errorRoutes);       // Errors


/* ---------------------------- Start Server ---------------------------- */
app.listen(port, () => {
    console.log(`Server is listening on port ${port}: http://localhost:${port}`)
});