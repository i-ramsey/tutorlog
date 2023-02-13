const express = require('express');
const router = express.Router({ mergeParams: true });
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const Student = require('../models/student');
const Visit = require('../models/visit');


const generateId = (firstName, lastName) => {
    const firstName3Char = firstName.slice(0, 3);
    const lastName3Char = lastName.slice(0, 3);
    const randNum = Math.floor(Math.random() * 1000);

    return firstName3Char.concat(lastName3Char).concat(randNum.toString());
}


router.get('/', catchAsync(async (req, res) => {
    let students = await Student.find({}).sort({ lastName: 1 });
    /* for (let visit of visits) {
        visit.displayDate = visit.startTime.toDateString();
    } */
    res.render('students/index', { students });
}))

router.post('/', catchAsync(async (req, res) => {
    console.dir(req.body);
    let { firstName, lastName } = req.body.student;
    console.log(firstName, lastName);
    firstName = firstName.charAt(0) + firstName.slice(1);
    lastName = lastName.charAt(0) + lastName.slice(1);
    console.log(firstName, lastName);
    let studentId = generateId(firstName, lastName);
    const student = new Student({ firstName, lastName, studentId });
    //generate student ID for new student


    await student.save();
    req.flash('success', 'Student added successfully')
    res.redirect('/students');
}))

router.get('/new', catchAsync(async (req, res) => {
    console.log("everything is fine : \)");
    res.render('students/new');
}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    let student = await Student.findById(id);
    /* student.displayStart = student.startTime.toLocaleString();
    if (student.endTime) student.displayEnd = student.endTime.toLocaleString(); */
    res.render(`students/details`, { student });
}))


router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const visit = await Visit.findById(id);
    await Student.findByIdAndUpdate(visit.student, { $pull: { visits: id } });
    await Visit.findByIdAndDelete(id);
    req.flash('success', 'The student was successfully deleted!')
    res.redirect(`/students`);
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    let student = await Student.findById(id);
    res.render(`students/edit`, { student });
}))


router.patch('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedStudentt = req.body.student;
    let student = await Student.findById(id);

    if (visit.studentId !== updatedVisit.studentId) {
        const student = await Student.findOne({ studentId: visit.studentId });
        const updatedStudent = await Student.findOne({ studentId: updatedVisit.studentId });
        if (student) {
            await student.updateOne({ $pull: { visits: id } });
        }
        if (updatedStudent) {
            updatedVisit.student = student._id;
            student.visits.push(updatedVisit);
            await student.save();
        }
    }
    await Visit.findByIdAndUpdate(id, { ...updatedVisit });
    req.flash('success', 'Your updates have been applied')
    res.redirect(`/visits/${id}`);
}))

module.exports = router;