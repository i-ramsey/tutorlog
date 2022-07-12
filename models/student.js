const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const StudentSchema = new Schema({
    firstName: String,
    lastName: String,
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    visits: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Visit'
        }
    ]
});




module.exports = mongoose.model('Student', StudentSchema);