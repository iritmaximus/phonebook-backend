const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

mongoose.connect(url)
  .then(console.log("connected to mongodb:", url))
  .catch((error) => {
    console.log("failed to connect:", error.message);
  });


const personSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function(testNumber) {
        return /\d{2,3}-\d{7,}/.test(testNumber);
      },
      message: props => `${props.value} is not correctly formatted.`
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Person", personSchema);
