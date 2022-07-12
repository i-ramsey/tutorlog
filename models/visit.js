const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visitSchema = new Schema({
    startTime: Date,
    endTime: Date,
    subject: String,
    studentName: String,
    studentId: String,
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }
});


module.exports = mongoose.model("Visit", visitSchema);