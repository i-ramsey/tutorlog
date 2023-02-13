const express = require('express');
const router = express.Router({ mergeParams: true });
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const Student = require('../models/student');
const Visit = require('../models/visit');



const getLocalISOString = (utcTime) => {
    const localTimezoneOffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date((utcTime.getTime()) - localTimezoneOffset)).toISOString().slice(0, -1);

    return localISOTime;
}



router.get('/', catchAsync(async (req, res) => {
    let visits = await Visit.find({}).sort({ startTime: -1 });
    for (let visit of visits) {
        try {
            visit.displayDate = visit.startTime.toDateString();
        }
        catch {
            console.dir(visit);
        }
    }
    res.render('visits/index', { visits });
}))

router.post('/', catchAsync(async (req, res) => {

    const visit = new Visit(req.body.visit);
    const student = await Student.findOne({ studentId: visit.studentId });
    if (student) {
        visit.student = student._id;
        student.visits.push(visit);
        student.save();
    }

    await visit.save();
    req.flash('success', 'Visit created Successfully')
    res.redirect('/visits');
}))

router.get('/new', catchAsync(async (req, res) => {
    res.render('visits/new');
}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    let visit = await Visit.findById(id);
    visit.displayStart = visit.startTime.toLocaleString();
    if (visit.endTime) visit.displayEnd = visit.endTime.toLocaleString();
    res.render(`visits/details`, { visit });
}))


router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const visit = await Visit.findById(id);
    await Student.findByIdAndUpdate(visit.student, { $pull: { visits: id } });
    await Visit.findByIdAndDelete(id);
    req.flash('success', 'Your visit was successfully deleted!')
    res.redirect(`/visits`);
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    let visit = await Visit.findById(id);
    console.log('annoying time value is ', getLocalISOString(visit.startTime));
    visit.originalStart = getLocalISOString(visit.startTime);
    if (visit.endTime) visit.originalEnd = getLocalISOString(visit.endTime);
    res.render(`visits/edit`, { visit });
}))


router.patch('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedVisit = req.body.visit;
    let visit = await Visit.findById(id);

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