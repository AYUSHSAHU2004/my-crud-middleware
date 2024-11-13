const crudMiddleware = async (req, res, next) => {
    const { requestType, filterField, fieldValues, modelInstance, endpoint } = req.body;

    // Validate necessary fields
    if (!requestType || !modelInstance || !filterField) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        if (requestType === 'GET') {
            let data;
            const filterValue = req.query[filterField];

            if (!filterValue) {
                data = await modelInstance.find();  // Get all records if no filter value is provided
            } else {
                data = await modelInstance.find({ [filterField]: filterValue });  // Filter records based on fieldType
            }
            return res.status(200).json(data);

        } else if (requestType === 'POST') {
            if (!fieldValues || fieldValues.length === 0) {
                return res.status(400).json({ error: 'fieldValues are required to create a new entry' });
            }
            const newItem = new modelInstance(fieldValues);  // Create new entry
            await newItem.save();
            return res.status(201).json(newItem);

        } else if (requestType === 'PUT') {
            // Ensure both filterField and fieldValues are present in the PUT request
            if (!filterField || !fieldValues || fieldValues.length === 0) {
                return res.status(400).json({ error: 'Both filterField and fieldValues are required for updating a record' });
            }

            const filterValue = req.query[filterField];
            if (!filterValue) {
                return res.status(400).json({ error: `${filterField} is required to update the record` });
            }

            // Perform the update based on filterField
            const updatedItem = await modelInstance.findOneAndUpdate(
                { [filterField]: filterValue },
                fieldValues,
                { new: true }
            );
            return res.status(200).json(updatedItem);

        } else if (requestType === 'DELETE') {
            const filterValue = req.query[filterField];
            if (!filterValue) {
                return res.status(400).json({ error: `${filterField} is required to delete the record` });
            }
            const deletedItem = await modelInstance.findOneAndDelete({ [filterField]: filterValue });
            return res.status(200).json(deletedItem);

        } else {
            return res.status(400).json({ error: 'Invalid request type' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

module.exports = crudMiddleware;
