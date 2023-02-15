if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();

}

const mongoose = require('mongoose');
const { firstNames, lastNames } = require('./names');
const Student = require('../models/student');
const Visit = require('../models/visit');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/tutor-log';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
})


const sample = array => array[Math.floor(Math.random() * array.length)];

const getRandInRange = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const generateId = (firstName, lastName) => {
    const firstName3Char = firstName.slice(0, 3);
    const lastName3Char = lastName.slice(0, 3);
    const randNum = Math.floor(Math.random() * 1000);

    return firstName3Char.concat(lastName3Char).concat(randNum.toString());
}

const getRandomMeetingTime = () => {
    let meetingTime = new Date(Date.now());
    meetingTime.setMinutes(0);
    meetingTime.setSeconds(0);
    meetingTime.setHours(8 + getRandInRange(0, 10));//set hour of time to random hour between 8 am and 6 pm
    meetingTime.setMonth(meetingTime.getMonth() + getRandInRange(-3, 3));//set month to random month within 3 months of today
    meetingTime.setDate(meetingTime.getDate() + getRandInRange(-15, 15));//set day of month to value within 15 of current date

    return meetingTime;
}



const subjects = ["Math", "English", "Spanish", "Composition", "Programming",
    "Reading", "Mandarin", "Arabic", "Music Engineering", "History",
    "Sociology", "Comparative Religion", "Economics"];





const seedDB = async () => {
    await Student.deleteMany({});
    await Visit.deleteMany({});
    let students
    for (let i = 0; i < 50; i++) {

        const currFirstName = sample(firstNames);
        const currLastName = sample(lastNames);

        const currStudent = new Student({
            firstName: currFirstName,
            lastName: currLastName,
            studentId: generateId(currFirstName, currLastName),
            visits: []

        })

        const currStartTime = getRandomMeetingTime();
        const currEndTime = new Date(currStartTime.getTime() + 3600000);
        currSubject = sample(subjects);

        const currVisit = new Visit({
            startTime: currStartTime,
            endTime: currEndTime,
            subject: currSubject,
            studentName: currStudent.firstName + " " + currStudent.lastName,
            studentId: currStudent.studentId,
            student: currStudent._id
        });

        currStudent.visits.push(currVisit);
        await currVisit.save();
        await currStudent.save();


    }






}




seedDB().then(() => mongoose.connection.close());
