crud middleware package
A simple Express middleware to perform CRUD operations (Create, Read, Update, Delete) on MongoDB and mysql databases.
Unified Syntax: No need to memorize different commands for MongoDB and MySQL.
Faster Development: Skip writing different controllers—save time and focus on building amazing features.
Flexibility: Seamlessly switch between databases without rewriting code

You can install the package via npm:

`npm install crud-middleware-package`

YouTube Tutorial To use it is given

for post request and introduction

`https://youtu.be/_xZECW0Kbqo`

for post request in mysql

`router.post('/', (req, res, next) => {
    req.body.DatabaseName='mysql'
    req.body.Table_Name = "employees"; //your table name
    req.body.model = db;//your mysql pool instance
     next(); 
}, crudMiddleware);`


for post request in mongo

`router.post('/', (req, res, next) => {
    req.body.DatabaseName='mongo'
    req.body.model = testModel; //your mongo model instance
     next();
}, crudMiddleware);`


for get request

`https://youtu.be/MK9hIo-Nl-0`



for get request in mysql

`
router.get('/', (req, res, next) => {
    req.body.DatabaseName='mysql'
    req.body.Table_Name = "employees"; //your table name
    req.body.model = db;//your mysql pool instance
    
    //take query from frontend and find on the basis of that
    const givenName = req.query.name;
    const givenSalary = req.query.salary;

    //TempKeys and CompulsoryKeys are taught in the vedio
    req.body.TempKeys={"salary":givenSalary};
    req.body.CompulsoryKeys={"saray":givenSalary,"name":givenName}


    req.body.getNumberOfResults="all";  // number of result eg : 2
    next(); 
}, crudMiddleware);

`

for get request in mongo 
`
    router.get('/', (req, res, next) => {
    req.body.DatabaseName='mongo'
    req.body.model = testModel; //your mongo model instance
    
    //take query from frontend and find on the basis of that
    const givenName = req.query.name;
    const givenSalary = req.query.salary;

    //TempKeys and CompulsoryKeys are taught in the vedio
    req.body.TempKeys={"salary":givenSalary};
    req.body.CompulsoryKeys={"saray":givenSalary,"name":givenName}


    req.body.getNumberOfResults="all";  // number of result eg : 2
    next(); 
}, crudMiddleware);
`

for put request

`https://youtu.be/70howjPg2yM`

for put request in mysql

`
router.put('/', (req, res, next) => {
    req.body.DatabaseName='mysql'
    req.body.Table_Name = "employees"; //your table name
    req.body.model = db;//your mysql pool instance
    //take query from frontend and find and update on the basis of that
    const givenName = req.query.name;
    const givenSalary = req.query.salary;

    //TempKeys and CompulsoryKeys are taught in the vedio
    req.body.TempKeys={"salary":givenSalary};
    req.body.CompulsoryKeys={"saray":givenSalary,"name":givenName}

    next(); 
}, crudMiddleware);
`

for put request in mongo

`
router.put('/', (req, res, next) => {
    req.body.DatabaseName='mongo'
    req.body.model = testModel; //your mongo model instance
    //take query from frontend and find and update on the basis of that

    const givenName = req.query.name;
    const givenSalary = req.query.salary;

    //TempKeys and CompulsoryKeys are taught in the vedio
    req.body.TempKeys={"salary":givenSalary};
    req.body.CompulsoryKeys={"saray":givenSalary,"name":givenName}

    next(); 
}, crudMiddleware);

`

for delete request

`https://youtu.be/D1GmFdCXEJU`


for delete request in mysql

`router.delete('/', (req, res, next) => {
    req.body.DatabaseName='mysql'
    req.body.Table_Name = "employees"; //your table name
    req.body.model = db; //your mysql pool instance

    //take query from frontend and find and delete on the basis of 
    
    const givenName = req.query.name;
    const givenSalary = req.query.salary;

    //TempKeys and CompulsoryKeys are taught in the vedio

    req.body.TempKeys={"salary":givenSalary};
    req.body.CompulsoryKeys={"saray":givenSalary,"name":givenName}

    req.body.getNumberOfResults = "all"; // Limit the number of results or use "all"
    next(); // Proceed to the middleware
}, crudMiddleware);`

for delete request in mongo

`
router.delete('/', (req, res, next) => {
   req.body.DatabaseName='mongo'
    req.body.model = testModel;  //your mongo model instance
    
    //take query from frontend and find and update on the basis of that

    const givenName = req.query.name;
    const givenSalary = req.query.salary;

    //TempKeys and CompulsoryKeys are taught in the vedio of get request

    req.body.TempKeys={"salary":givenSalary};
    req.body.CompulsoryKeys={"saray":givenSalary,"name":givenName}


    req.body.getNumberOfResults = "all"; // Limit the number of results or use "all"
    next(); // Proceed to the middleware
}, crudMiddleware);
`


