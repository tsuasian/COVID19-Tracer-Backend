const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const fs = require('fs');
const cors = require('cors')
const mongoose = require('mongoose');
// const passport = require('passport');
// const LocalStrategy = require('passport-local')
const session = require('express-session')
// const authRouter = require('./auth.js').authRouter
const MongoStore = require('connect-mongo').default
const User = require('./models').User;
const Contact = require('./models').Contact
const Event = require('./models').Event
const Notification = require('./models').Notification

//mongoose
if (! fs.existsSync('./env.sh')) {
  throw new Error('env.sh file is missing');
}
if (! process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not in the environmental variables. Try running 'source env.sh'");
}
mongoose.connection.on('connected', function() {
  console.log('Success: connected to MongoDb!');
});
mongoose.connection.on('error', function() {
  console.log('Error connecting to MongoDb. Check MONGODB_URI in env.sh');
  process.exit(1);
});
mongoose.connect(process.env.MONGODB_URI);

app.use(cors())
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json({extended: false}))
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60},
  httpOnly: false,
  store: MongoStore.create({mongoUrl: process.env.MONGODB_URI})
}))

//routes
app.get('/', (req, res) => {
  console.log("Hit /")
  console.log(req.session)
});
//
app.post('/registration', function(req, res) {
  console.log(req.body)
  let user = {};
  user.firstName = req.body.firstName
  user.lastName = req.body.lastName
  user.email = req.body.email
  user.password = req.body.password
  let newUser = new User(user)
  newUser.save()
    .then((saved) => {
      console.log("User saved in DB", saved)
      res.json({success: true})
    })
    .catch((err) => { console.log("Error occured in saving", err)})
});

app.post('/login', (req, res) => {
  console.log(req.body)
  User.findOne({
    email: req.body.email,
    password: req.body.password
  })
  .then((user) => {
    console.log("Found", user)
    req.session.email = user.email
    console.log(req.session)
    res.json({
              success: true,
              user: user.email,
              name: `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName,
              password: user.password,
              session: req.session
            })
  })
  .catch((err) => {
    console.log("Error in finding user", err)
  })
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err) {
      console.log("Error logging out", err)
    }
  res.json({logout: true})
  })
});

app.post('/contact/add', (req, res) => {
  // Contact.find
  let contact = {};
  console.log(req.body)
  contact.firstName = req.body.firstName,
  contact.lastName = req.body.lastName,
  contact.phone = req.body.phone,
  contact.email = req.body.email,
  contact.rel = req.body.rel
  let newContact = new Contact(contact)
  newContact.save()
  .then((contact) => {
    console.log("Contact saved", contact)
    res.json({success: true})
  })
  .catch((err) => { console.log("Error in saving contact", err)})
});

app.post('/contacts/edit', function(req, res) {
  console.log("req body", req.body)
  Contact.findOneAndUpdate({
    firstName: req.body.ogfname,
    lastName: req.body.oglname
  }, {
    firstName: (req.body.firstName || req.body.ogfname),
    lastName: (req.body.lastName || req.body.oglname),
    phone: (req.body.phone || req.body.ogphone),
    email: (req.body.email || req.body.ogEmail),
  },
  {new: true},
  function(err, contact) {
     if (contact) {
       console.log("contact found and updated", contact)
       res.json({contact: contact})
     } else {
       console.log("error contact not updated")
     }
  })
});

app.post('/contacts/retrieve', (req, res) => {
  console.log("contacts req body", req.body.user)
  Contact.find({rel: req.body.user}, (err, docs) => {
    if (docs) {
      console.log("pulled contacts", docs)
      res.json({contacts: docs})
    } else {
      console.log("error pulling contacts", err)
    }
  })
})

app.post('/profile/update', (req, res) => {
  console.log("hit prof update", req.body)
  User.findOneAndUpdate({email: req.body.ogEmail}, {
    firstName: (req.body.firstName || req.body.ogfname),
    lastName: (req.body.lastName || req.body.oglname),
    email: (req.body.email || req.body.ogEmail),
    password: (req.body.password || req.body.ogpwd)
  },
  {new: true},
  function(err, profile) {
    if (profile) {
      console.log("profile updated", profile)
      // res.json({profile: profile})
    } else {
      console.log("err updating profile", err)
    }
  })
})

app.post('/contacts/delete', (req, res) => {
  console.log("delete req body", req.body)
  Contact.findOneAndDelete({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  }, function(err, doc) {
    if (doc) {
      console.log("delete successful", doc)
      res.json({doc: doc})
    } else {
      console.log("delet failed", err)
    }
  })
})

app.post('/event/add', (req, res) => {
  console.log("reqbody event add", req.body)
  let nEvent = {};
  nEvent.location = req.body.location
  nEvent.contacts = req.body.contacts
  nEvent.rel = req.body.user
  let newEvent = new Event(nEvent)
  newEvent.save()
  .then((event) => {
    console.log("saved event", event)
    res.json({event: event})
  })
  .catch((err) => {
    console.log("Error saving event", err)
  })
});

app.post('/event/edit', (req, res) => {
  console.log("event edit reqbody", req.body)
  Event.findOneAndUpdate({
    location: req.body.ogLocation,
  }, {
    location: (req.body.location || req.body.ogLocation),
    contacts: req.body.contacts
  },
  {new: true},
  function(err, event) {
    if (event) {
      console.log("event found and updated", event)
      res.json({event: event})
    } else {
      console.log("error contact not updated")
    }
  })
});

app.post('/event/retrieve', (req, res) => {
  console.log("events req body", req.body.user)
  Event.find({rel: req.body.user}, (err, docs) => {
    if (docs) {
      console.log("pulled events", docs)
      res.json({events: docs})
    } else {
      console.log("error pulling events", err)
    }
  })
});

app.post('/event/delete', (req, res) => {
  console.log("delete event req body", req.body)
  Event.findOneAndDelete({
    location: req.body.location
  }, function(err, doc) {
    if (doc) {
      console.log("delete successful in event", doc)
      res.json({doc: doc})
    } else {
      console.log("delet failed", err)
    }
  })
})

app.post('/notification/send', (req, res) => {
  console.log('req body notif send', req.body)
  let notif = {};
  notif.location = req.body.locations
  notif.from = req.body.from
  notif.to = req.body.to
  let newNotif = new Notification(notif)
  newNotif.save()
  .then((notif) => {
    console.log("notif saved", notif)
    res.json({success: true})
  })
  .catch((err) => { console.log("notif fail saved", notif)})
})

app.post('/notification/retrieve', (req, res) => {
  console.log("contacts req body", req.body.user)
  Notification.find({to: req.body.user}, (err, docs) => {
    if (docs) {
      console.log("pulled contacts", docs)
      res.json({notifs: docs})
    } else {
      console.log("error pulling contacts", err)
    }
  })
})








app.listen(process.env.PORT || 1337);
