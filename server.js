const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    app.listen(8000);
    app.use(bodyParser.json());
    const Schema = mongoose.Schema;

    const userSchema = new Schema({
        username: String,
        exercises: [{
            description: { type: String, required: true },
            duration: { type: Number, required: true },
            date: { type: Number, default: Date.getTime }
        }]
    });
    const User = mongoose.model('User', userSchema);

    // new user
    app.post('/api/exercise/new-user', (req, res) => {
        const username = req.body.username;
        User.create([{
            username,
            exercises: []
        }], (err, data) => {
            if (err) return res.json({ err });
            res.json({ data });
        });
    });

    // new exercise
    app.post('/api/exercise/add', (req, res) => {
        User.findById(req.body.userId, (err, data) => {
            if (err) return console.log(err);
            let newExercise = {};
            if (req.body.date === undefined) {
                newExercise = {
                    description: req.body.description,
                    duration: req.body.duration,
                    date: new Date().getTime()
                };
            } else {
                newExercise = {
                    description: req.body.description,
                    duration: req.body.duration,
                    date: new Date(req.body.date).getTime()
                };
            }
            data.exercises.push(newExercise);
            const user = new User(data);
            user.save((err, data) => {
                if (err) return res.json({ err });
                res.json(data);
            });
        });
    });

    // get exercises
    app.get('api/exercise/log', (req, res) => {

    });
});

