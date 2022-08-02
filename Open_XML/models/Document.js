const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new Schema({
    filename: String,
    ext: String,
    path: String,
    pages: Number,
});

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;