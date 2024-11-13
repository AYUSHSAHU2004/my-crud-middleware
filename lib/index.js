const crudMiddleware = async (req, res, next) => {
    const requestType = req.method;
    const modelInstance = req.body.model || Product;
  
    // Extract filterField and filterValues based on request method
    const filterField = requestType === 'GET' || requestType === 'DELETE' ? req.params.filterField : req.body.filterField;
    const filterValues = requestType === 'GET' || requestType === 'DELETE' ? req.params.filterValues : req.body.filterValues;
  
    if (!requestType || !modelInstance) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
  
    try {
      if (requestType === 'GET') {
        let data;
        if (filterField === 'null') {
          data = await modelInstance.find();
        } else {
          data = await modelInstance.find({ [filterField]: filterValues });
        }
  
        return res.status(200).json(data);
  
      } else if (requestType === 'POST') {
        // Use filterValues as the data to create a new document
        const datas = req.body.formData; // Expecting filterValues in the body
        console.log(datas); // Ensure it's being received correctly
        
        if (!datas) {
          return res.status(400).json({ error: 'filterValues are required to create a new entry' });
        }
      
        // Create a new product using the form data
        const newItem = new modelInstance(datas);
        await newItem.save();
        
        return res.status(201).json(newItem); // Respond with the created product
      }
       else if (requestType === 'PUT') {
        if (!filterField || !filterValues) {
          return res.status(400).json({ error: 'Both filterField and filterValues are required for updating a record' });
        }
        const updatedItem = await modelInstance.findOneAndUpdate(
          { [filterField]: filterValues },
          req.body.formData,
          { new: true }
        );
        return res.status(200).json(updatedItem);
  
      } else if (requestType === 'DELETE') {
        if (!filterField || !filterValues) {
          return res.status(400).json({ error: `${filterField} and ${filterValues} are required to delete the record` });
        }
        const deletedItem = await modelInstance.findOneAndDelete({ [filterField]: filterValues });
        return res.status(200).json(deletedItem);
  
      } else {
        return res.status(400).json({ error: 'Invalid request type' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Server error', message: err.message });
    }
  };
  
  module.exports = crudMiddleware;
  