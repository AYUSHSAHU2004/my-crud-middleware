const crudMiddleware = async (req, res, next) => {
  const requestType = req.method;
  const modelInstance = req.body.model;

  const filterFields = req.body.filterField;
  
  const filterValues = req.body.filterValues;

  if(requestType=="POST" || requestType=="PUT"){

      if (!requestType || !modelInstance) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
  }

  try {
    if(requestType=="POST" || requestType=="PUT"){

        if (!requestType || !modelInstance) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
    }

    if (requestType === 'GET') {
      if(req.body.getNumberOfResults==="all"){

         let data = await modelInstance.find(req.body.query);
         return res.status(200).json(data);
      }else{
        let data = await modelInstance.find(req.body.query).limit(req.body.getNumberOfResults);
        return res.status(200).json(data);
      }
    }

    else if (requestType === 'POST') {
      const dataToCreate = filterValues;
      if (!dataToCreate) {
        return res.status(400).json({ error: 'filterValues are required to create a new entry' });
      }
      const newItem = new modelInstance(dataToCreate);
      await newItem.save();
      return res.status(201).json(newItem);
    }

    else if (requestType === 'PUT') {
      const updatedItem = await modelInstance.findOneAndUpdate(req.body.query,filterValues, { new: true });
      if (!updatedItem) {
        return res.status(404).json({ error: 'No record found to update' });
      }

      return res.status(200).json(updatedItem);
    }

    else if (requestType === 'DELETE') {
     
      const deletedItem =  req.body.deleteType=="one"?await modelInstance.findOneAndDelete(req.body.query):await modelInstance.deleteMany(req.body.query);

      if (!deletedItem) {
        return res.status(404).json({ error: 'No record found to delete' });
      }

      return res.status(200).json(deletedItem);
    }

    else {
      return res.status(400).json({ error: 'Invalid request type' });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
};

module.exports = crudMiddleware;
