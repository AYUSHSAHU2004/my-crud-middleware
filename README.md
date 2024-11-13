# My CRUD Middleware

A simple Express middleware to handle CRUD operations for your mongo models.

## Installation

You can install the package via npm:

```bash
npm install mongo-crud-middleware


Server Setup Example

Here’s an example of how to set up your Express server with the `mongo-crud-middleware`:

```const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse incoming JSON requests

app.use('/api/products/:filterField?/:filterValues?', (req, res, next) => {
  // Determine the filterField and filterValues based on the request method
  const filterField = (req.method === 'GET' || req.method === 'DELETE') 
    ? req.params.filterField 
    : req.body.filterField;

  const filterValues = (req.method === 'GET' || req.method === 'DELETE') 
    ? req.params.filterValues 
    : req.body.filterValues;

  // Attach necessary information to the request body
  req.body = {
    requestType: req.method,       // HTTP method (GET, POST, PUT, DELETE)
    model: Product,                // Your Mongoose model instance
    filterField,                   // Field to filter by
    filterValues,
    formData:req.body.formData                // Data to create or update
  };

  next(); // Proceed to CRUD middleware
}, crudMiddleware);


app.listen(3000, () => {
    console.log('Server running on port 3000');
}); 


GET Request Example


const fetchProducts = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user ? user.email : null;
    let url = 'http://localhost:5000/api/products';
    const filterField = 'userEmail'; // Replace with actual filter field when needed
    const filterValues = userEmail; // Replace with actual filter value when needed
  
    if (filterField && filterValues) {
      url += `/${filterField}/${filterValues}`;
    }
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response?.ok) {
        const data = await response.json();
        if(data){
          console.log(data);
          setProducts(data);
        }
      } else {
        console.error('Error fetching products');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []); 



POST Request

try {
      const response = await fetch('http://localhost:5000/api/products/null/null', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              filterValues: formData, // Directly use formData as filterValues
          }),
      });
  
      if (response.ok) {
          // Refresh the page or redirect
          window.location.reload();
          alert("Uploaded");
      } else {
          const errorText = await response.text();
          console.error('Error creating product:', errorText);
          setErrorMessage('Failed to create product. Please try again.');
      }
  } catch (error) {
      console.error('Error during fetch:', error);
      setErrorMessage('An error occurred while submitting the form.');
  }




PUT Request


try {
          const response = await fetch('http://localhost:5000/product/getId', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filterField,     // Add filterField
              filterValues,    // Add filterValues
              formData         // Add formData
            }),
          });
      
          if (response.ok) {
            const result = await response.json();
            setProductName(result.productName);
            setPrice(result.price);
            setPhoneNumber(result.phoneNumber);
            setProductCategory(result.productCategory);
            setProductDetails(result.productDetails);
          } else {
            setErrorMessage('Failed to fetch product details.');
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
          setErrorMessage('An error occurred while fetching product details.');
        }



DELETE Request



try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response?.ok) {
        alert("deleted");
        const data = await response.json();
        if(data){
          console.log(data);
        }
      } else {
        alert("not deleted");
        console.error('Error fetching products');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };






