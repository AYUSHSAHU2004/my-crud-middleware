Mongo CRUD Middleware
A simple Express middleware to perform CRUD operations (Create, Read, Update, Delete) on MongoDB models. Designed to simplify database interactions by automating common CRUD operations with MongoDB using Mongoose.

You can install the package via npm:

`npm install mongo-crud-middleware`

GET Request Example - Fetch Products Based on Query

```router.get('/get', (req, res, next) => {
  req.body.model = Product; // Set your model name
  req.body.query = { "category": "Electronics" }; // Example query
  req.body.getNumberOfResults = "3"; // Limit the number of results or use "all"
  next(); // Proceed to the middleware
}, crudMiddleware);
```





POST Request Example - Create a New Product

```router.post('/create', (req, res, next) => {
  req.body.model = Product; // Set your model name
  next(); // Proceed to the middleware
}, crudMiddleware);
```




PUT Request Example - Update Product
You can update an existing product using a PUT request, specifying the query and form data.

```router.put('/update', (req, res, next) => {
  req.body.model = Product; // Set your model name
  req.body.query = { "_id": "67609050c1795e6009bb57de" }; // Query to update
  next(); // Proceed to the middleware
}, crudMiddleware);````





DELETE Request Example - Delete Product
Use the DELETE request to delete a product based on a query. You can also specify if you want to delete one or all matching records.

```router.delete('/delete', (req, res, next) => {
  req.body.model = Product; // Set your model name
  req.body.query = { "productName": "games" }; // Set query for deletion
  req.body.deleteType = "one"; // Use "one" to delete a single record, "all" to delete all matching
  next(); // Proceed to the middleware
}, crudMiddleware);```










