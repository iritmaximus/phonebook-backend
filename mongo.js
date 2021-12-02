const mongoose = require('mongoose');

if (process.argv.length<3) {
    console.log('give password as an argument');
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://martti:${password}@cluster1.517m8.mongodb.net/phonebook-persons?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema= new mongoose.Schema({
    name: String,
    number: Number,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 5) {
    const newPerson  = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    newPerson.save().then(response => {
        console.log(`${newPerson.name} (${newPerson.number}) was added to the phonebook.`)
        mongoose.connection.close()
    })
} else {

    Person.find({}).then(result => {
        console.log('Phonebook:')
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })  
}
