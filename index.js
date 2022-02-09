require("dotenv").config();
// en itse kirjoittanut mutta jostain ilmestyi
// ja tässä kohtaa pelottaa liikaa poistaa se
const { json, response } = require('express');

const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require("./models/person.js");

// pari tuntia debugattiin ja lopulta olikin express.json'()' 
// mikä puuttui...........
// tekisi mieli lyödä jotain...
// (se jättää localhostin lataamaan ikuisesti)
app.use(express.json());
// Morgan mutta POST tyyppiset pyynnöt skipataan
app.use(morgan('tiny', {
    skip: (req, res) => { return req.method === 'POST' }
}));
// tämä logaa aiemmin skipatut POST tyyppiset pyynnöt custom
// muodossa tehtävän mukaan
app.use(morgan(':method :url :status :res[content-length] - response-time ms :body', {
    skip: (req, res) => { return req.method !== 'POST'}
}));

// uusi morgan token joka palauttaa json muodosssa pyynnön (POST) bodyn
morgan.token('body', (req, res) => { return JSON.stringify(req.body) })

// ottaa käyttöön frontendin backendin kautta
app.use(express.static('build'));
app.use(cors());





// kaikki ihmiset
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    })
})

// info sivu
app.get('/info', (req, res) => {
    // vähän ruma ratkaisu mutta se toimii, mur muuttuvat arvot backendissä
    var i = 0;
    Person.find({}).then(persons => {
        persons.forEach(person => {
            i++;
        })
        
        res.send(
            `<p>Phonebook has info of ${i}</p>${Date()}`
        )   
    })
    
})

// yksittäinen ihminen
app.get('/api/persons/:id', (req, res, next) => {
    Person.find({ id: req.params.id })
        .then(person => {
            if (person) {
                res.json(person);
            } else {
                res.status(404).send({ "error": "no person found" });
            }
        })
        .catch(error => next(error));
})

// poista ihminen
app.delete('/api/persons/:id', (req, res, next) => {
    // etsitään ihminen joka halutaan poistaa
    Person.findByIdAndDelete(req.params.id)
        .then(person => {
            if (person) {
                console.log("deleted:", person);
            res.json(person);
            } else {
                res.status(404).end();
            }
        })
        .catch(error => next(error));

})

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    console.log('Body:', body)

    // jos ei ole nimeä tai numeroa
    if (!body.name || !body.number) {
        return res.status(400).json({'error': 'name or number missing'})
    } 

    const person = new Person({
        name: body.name,
        number: body.number,
    })
    
    // katsotaan onko olemassa jo samanniminen
    Person.find({ name: body.name })
        .then(persons => {
            console.log("Result:", persons)
            if (persons.length === 0) {
                // jos ei ole samannimistä, tallennetaan db:hen
                person
                    .save().
                        then(savedPerson => {
                            res.json(savedPerson);
                        })
                        .catch(error => next(error));

            } else {
                return res.status(404).json({'error': 'name must be unique'})
            }
        })
        .catch(error => next(error));
});



// error handler... duh
const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ "error": "wrong id format" });
    }

    next(error);
}

app.use(errorHandler);

    
PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});