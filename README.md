# My CRUD Middleware

A simple Express middleware to handle CRUD operations for your mongo models.

## Installation

You can install the package via npm:

```bash
npm install mongo-crud-middleware


```
//Server Setup Example

//Here’s an example of how to set up your Express server with the `mongo-crud-middleware`:

const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse incoming JSON requests

app.use('/api/products', (req, res, next) => {
    const { filterField, fieldValues } = req.body;

    // Validate required fields
    if (!filterField || !fieldValues) {
        return res.status(400).json({ error: 'filterField and fieldValues are required' });
    }

    req.body = {
        requestType: req.method,           // HTTP method (GET, POST, PUT, DELETE)
        model: Product,                    // Your Mongoose model instance
        filterField,                       // Field to filter by
        fieldValues                        // Data to create or update
    };

    next(); // Proceed to CRUD middleware
}, crudMiddleware);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

//GET Request Example

fetch('/api/products', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        filterField: 'id',  // Field to filter by (e.g., 'id')
        fieldValues: [12345] // The value to filter by (e.g., product id)
    })
})
.then(response => response.json())
.then(data => console.log('Fetched Product:', data))
.catch(error => console.error('Error:', error)); 

//POST Request

fetch('/api/products', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        filterField: 'name',  // This field is optional in POST request 
        fieldValues: [        // Values for creating a new product
            { name: 'New Product' },
            { price: 100 },
            { description: 'This is a new product.' },
            { category: 'Electronics' }
        ]
    })
})
.then(response => response.json())
.then(data => console.log('Created Product:', data))
.catch(error => console.error('Error:', error));

//PUT Request
fetch('/api/products', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        filterField: 'id',   // Field basis for update (e.g., 'id')
        fieldValues: [       // Data to update (e.g., product fields)
            { name: 'Updated Product' },
            { price: 150 },
            { description: 'Updated product description' }
        ]
    })
})
.then(response => response.json())
.then(data => console.log('Updated Product:', data))
.catch(error => console.error('Error:', error));

//DELETE Request

fetch('/api/products', {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        filterField: 'id',   // Field type(e.g., 'id')
        fieldValues: [12345] // The fieldValue  to delete  (e.g., product id)
    })
})
.then(response => response.json())```






