const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['imran khan', 'shehbaz shareef', 'bilawal bhutto', 'khalid maqbool', 'fazl ur rahman', 'hafiz naeem ur rehman', 'Shujaat Hussain', 'Aimal Wali Khan'],
        required: true,
        unique: true
    },
    party: {
        type: String,
        enum: ['PTI', 'PML-N', 'PPP', 'MQM-P', 'JUI-F', 'JI', 'PML-Q', 'ANP'],
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    votes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    voteCount: {
        type: Number,
        default: 0
    }
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
