const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    app.listen(8000);
    app.use(bodyParser.urlencoded({ extended: false }));
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

    // delete all user with no username
    User.deleteMany({ username: undefined }, (err, data) => {
        if (err) return console.log(err);
        console.log('deleteMany success:', data.n, 'data deleted');
    });

    // new user
    app.post('/api/exercise/new-user', (req, res) => {
        const username = req.body.username === undefined ? 'defaultUsername' : req.body.username;
        User.create([{
            username,
            exercises: []
        }], (err, data) => {
            if (err) return res.json({ err });
            res.json({ _id: data[0]._id, username: data[0].username });
        });
    });

    // get all user
    app.get('/api/exercise/users', (req, res) => {
        User.find()
            .select('_id username')
            .exec((err, data) => {
                if (err) return res.json({ err });
                res.json(data);
            });
    });

    // new exercise
    app.post('/api/exercise/add', (req, res) => {
        if (!Boolean(req.body.userId)
            || !Boolean(req.body.description)
            || !Boolean(req.body.duration)) {
            return res.json({ err: 'userId, description, and duration is required' })
        }
        User.findById(req.body.userId, (err, data) => {
            if (err) return console.log(err);
            let newExercise = {};
            if (!(Boolean(req.body.date))) {
                newExercise = {
                    description: req.body.description,
                    duration: Number(req.body.duration),
                    date: new Date().getTime()
                };
            } else {
                newExercise = {
                    description: req.body.description,
                    duration: Number(req.body.duration),
                    date: new Date(req.body.date).getTime()
                };
            }
            data.exercises.push(newExercise);
            const user = new User(data);
            user.save((err, data) => {
                if (err) return res.json({ err });
                let resData = {
                    _id: data._id,
                    username: data.username,
                    date: formatDate(newExercise.date),
                    duration: newExercise.duration,
                    description: newExercise.description
                };
                res.json(resData);
            });
        });
    });

    // get exercises
    app.get('/api/exercise/log', (req, res) => {
        if (req.query.userId === undefined) return res.json({ err: 'userId query parameter is required' });
        User.findById(req.query.userId, (err, data) => {
            if (err) return res.json({ err });
            let exercises = data.exercises;
            const from = req.query.from === undefined ? -100000000000000 : new Date(req.query.from).getTime();
            const to = req.query.to === undefined ? new Date('4000-01-01').getTime() : new Date(req.query.to).getTime();
            const limit = req.query.limit === undefined ? exercises.length : req.query.limit;
            exercises = exercises.filter(exercise => exercise.date >= from && exercise.date <= to);
            exercises = exercises.slice(0, limit);
            const log = exercises.map(exercise => {
                let modifiedExercise = {
                    _id: exercise.id,
                    date: formatDate(exercise.date),
                    duration: exercise.duration,
                    description: exercise.description
                };
                return modifiedExercise;
            });
            let resData = {
                _id: data._id,
                username: data.username,
                count: exercises.length,
                log
            };
            res.json(resData);
        });
    });
});

function formatDate(date) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var d = new Date(date),
        monthName = monthNames[d.getMonth()].substr(0, 3),
        day = d.getDate().toString(),
        year = d.getFullYear(),
        dayName = d.toString().split(' ')[0];

    if (day.length < 2)
        day = '0' + day;

    return `${dayName} ${monthName} ${day} ${year}`;
}