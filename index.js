require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

// logging
morgan.token('body', (req, res) => {
    return JSON.stringify(req.body) 
})
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        response.writeHead(200, { 'Content-type': 'text/html' })

        response.write(`<p>Phonebook has info for ${people.length}</p>`)
        response.write(`<p>${new Date().toString()}</p>`)
        response.end()
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person
        .findById(id)
        .then(person => {
            if (!person) {
                response.status(404).end()
            } else {
                response.json(person)
            }
        })
        .catch(err => {
            console.log(err)
            response.status(400).send({error: 'malformatted id'})
        })
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    // if (persons.find(p => p.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    // persons = persons.filter(p => p.id !== id)
    // response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`http://localhost:${PORT}`)
})
