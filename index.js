// en itse kirjoittanut mutta jostain ilmestyi
// ja tässä kohtaa pelottaa liikaa poistaa se
const { json } = require('express');

const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

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

// ottaa käyttöön frontendin backendin kautta
app.use(express.static('build'));
app.use(cors());

// uusi morgan token joka palauttaa json muodosssa pyynnön (POST) bodyn
morgan.token('body', (req, res) => { return JSON.stringify(req.body) })

// uusien yhteystietojen id:n laskemista varten
const generateId = () => {
    const max = 1000000000
    newId = Math.floor(Math.random() * max)
    return newId
}

// kovakoodatut ihmiset testausta varten
let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-53235323"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    },
]

// kaikki ihmiset
app.get('/api/persons', (req, res) => {
    res.json(persons)
})

// info sivu
app.get('/info', (req, res) => {
    res.send(
        `<p>Phonebook has info of ${persons.length}</p>${Date()}`
    )
})

// yksittäinen ihminen
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);

    // etsitään ihminen pyynnön id:n avulla ja palautetaan jsonissa jos löytyy
    // jos ei niin virhekoodia pukkaa
    const person = persons.find(person => person.id === id);
    if (person) {
        res.json(person);
    } else {
        return res.status(404).end();
    }
})

// poista ihminen
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)

    // etsitään ihminen joka halutaan poistaa
    const person = persons.find(person => person.id === id)
    
    // jos ihminen löytyy filteröidään id:n avulla se ihminen pois
    if (person) {
        persons.filter(person => person.id !== id)

        // jos ylempi ei toimi niin:
        // persons = persons.filter(person => person.id !== id)

        res.status(204).end()
        console.log('Person deleted')
    } else {
        return res.status(404).end()
    }
})

// lisää ihminen
app.post('/api/persons', (req, res) => {
    const body = req.body
    console.log('Body:', body)

    // jos ei ole nimeä tai numeroa
    if (!body.name || !body.number) {
        // virhekoodin palautus
        return res.status(404).json({'error': 'name or number missing'})
    } 

    // funktio joka tarkistaa löytyykö nimi jo yhteystiedoista 
    const nameExists = (name) => {
        return persons.find(person => person.name === name)
    }

    // jos nimi löytyy niin virhekoodia
    if (nameExists(body.name)) {
        return res.status(404).json({'error': 'name must be unique'})
    }

    // jos meni läpi yllä olevista "testeistä" niin luodaan uusi yhteystieto
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    // lisätään yt. 
    persons = persons.concat(person)
    console.log('New persons:', persons)

    res.status(200).json(person)
})
    
PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})