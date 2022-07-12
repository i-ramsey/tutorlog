const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Student = require('./models/student');
const Visit = require('./models/visit');
const student = require('./models/student');

const visitRoutes = require('./routes/visits');




mongoose.connect('mongodb://localhost:27017/tutor-log', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
})


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
        console.log("setting returnTO to ", req.session.returnTo);
    }
    console.log("returnTo is ", req.session.returnTo);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

//quick student sign-in for app run in kiosk mode
app.post('/signin', catchAsync(async (req, res) => {
    const { studentId } = req.body;
    const student = await Student.findOne({ studentId: studentId })
    if (student) {
        const latestVisit = await Visit.findById(student.visits.at(-1));
        if (latestVisit && !latestVisit.endTime) {
            latestVisit.endTime = Date.now();
            await latestVisit.save();
        } else {
            const visit = new Visit({
                studentName: student.firstName + " " + student.lastName,
                startTime: Date.now(),
                student: student._id,
                subject: "N/A",
                studentId: studentId
            });
            student.visits.push(visit);
            await visit.save();
        }
        console.log(latestVisit);
        await student.save();
        req.flash('success', 'Thanks! you\'re signed in.')
    }
    else {
        req.flash('error', 'Sorry, we couldn\'t find a student with that ID.');
    }
    res.redirect('/');
}))


app.get('/tutor', (req, res) => {
    res.render('tutor');
})


app.use('/visits', visitRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Could not find a page at that address', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Unspecified error occured';
    }
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log("serving on port 3000");
})