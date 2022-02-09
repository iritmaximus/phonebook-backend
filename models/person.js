const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

mongoose.connect(url)
    .then(res => {
        console.log("connected to mongodb:", url);
    })
    .catch((error) => {
        console.log("failed to connect:", error.message);
    })

const personSchema = mongoose.Schema({
    name: String,
    number: Number,
});

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model("Person", personSchema);