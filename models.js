var mongoose  = require('mongoose');
var Schema = mongoose.Schema;

//User Model
var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
});

var UserSchema =  mongoose.model('User', UserSchema)

var ContactSchema = new Schema({
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    rel: String,
});

var ContactSchema =  mongoose.model('Contact', ContactSchema)

var EventSchema = new Schema({
  location: String,
  contacts: Array,
  rel: String,
});

var EventSchema = mongoose.model('Event', EventSchema)

var NotificationSchema = new Schema({
  location: [String],
  from: String,
  to: [String]
})

var NotificationSchema = mongoose.model('Notification', NotificationSchema)

module.exports = {
  User: UserSchema,
  Contact: ContactSchema,
  Event: EventSchema,
  Notification: NotificationSchema
}
