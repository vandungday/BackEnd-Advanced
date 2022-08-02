const mongoose = require("mongoose");
const { Schema } = mongoose;

const segmentSchema = new Schema({
    document_id: {
        type: mongoose.ObjectId,
        ref: "Document",
    },
    text: {
        type: String,
    },

    bold: {
        type: Boolean,
        default: false,
    },
    underline: {
        type: Boolean,
        default: false,
    },
    strike: {
        type: Boolean,
        default: false,
    },
    italic: {
        type: Boolean,
        default: false,
    },
});

const Segment = mongoose.model("Segment", segmentSchema);
module.exports = Segment;