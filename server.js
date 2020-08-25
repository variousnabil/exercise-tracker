const express = require('express');
const app = express();
const mongoose = require('mongoose');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    app.listen(8000);
    const Schema = mongoose.Schema;
    const userSchema = new Schema({
        username: String,
        exercises: [{
            description: { type: String, required: true },
            duration: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }]
    });
    const User = mongoose.model('User', userSchema);

    // new user
    app.post('/api/exercise/new-user', (req, res) => {
        User.create([{
            username: 'variousnabil',
            exercises: [{ description: 'read books', duration: 60 }]
        }], (err, data) => {
            if (err) return res.json({ err });
            res.json({ data });
        })
    });

    // new exercise
    app.post('/api/exercise/add', (req, res) => {

    });

    // get exercises
    app.get('api/exercise/log', (req, res) => {

    });
});

