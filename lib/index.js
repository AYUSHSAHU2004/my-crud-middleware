function objectToQueryAll(tableName, conditions) {
  // Get the keys from the conditions object
  const keys = Object.keys(conditions);

  // Build the WHERE clause by combining the conditions
  const whereClause = keys
    .map((key) => {
      const value = conditions[key];
      if (typeof value === "number") {
        return `${key} = ${value}`; // No quotes for numbers
      }
      return `${key} = '${value}'`; // Add quotes for strings
    })
    .join(" AND ");

  // Return the complete SQL query
  return `SELECT * FROM ${tableName} WHERE ${whereClause};`;
}
function SqlQueryUpdate(req) {
  const Ckeys = Object.keys(req.body.CompulsoryKeys);  // Compulsory keys
  const Tkeys = Object.keys(req.body.TempKeys);  // Temporary keys

  // The SET clause comes from req.body.query
  const setClause = req.body.query;  // This is already provided in the request.

  // Generate the WHERE clause for the compulsory keys (joined with AND)
  const Ccond = Ckeys.map((Ckey) => {
    const value = req.body.CompulsoryKeys[Ckey];
    if (Array.isArray(value)) {
      // Handle arrays in CompulsoryKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === 'number') {
            return `${Ckey} = ${subVal}`; // No quotes for numbers
          }
          return `${Ckey} = '${subVal}'`; // Add quotes for strings
        })
        .join(' OR ')})`; // Wrap in parentheses for OR
    } else {
      // Handle single values in CompulsoryKeys
      if (typeof value === 'number') {
        return `${Ckey} = ${value}`; // No quotes for numbers
      }
      return `${Ckey} = '${value}'`; // Add quotes for strings
    }
  }).join(' AND ');  // Join with AND for compulsory conditions

  // Generate the WHERE clause for the temporary keys (joined with OR)
  const Tcond = Tkeys.map((Tkey) => {
    const value = req.body.TempKeys[Tkey];
    if (Array.isArray(value)) {
      // Handle arrays in TempKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === 'number') {
            return `${Tkey} = ${subVal}`; // No quotes for numbers
          }
          return `${Tkey} = '${subVal}'`; // Add quotes for strings
        })
        .join(' OR ')})`; // Wrap in parentheses for OR
    } else {
      // Handle single values in TempKeys
      if (typeof value === 'number') {
        return `${Tkey} = ${value}`; // No quotes for numbers
      }
      return `${Tkey} = '${value}'`; // Add quotes for strings
    }
  }).join(' OR ');  // Join with OR for temporary conditions

  // Return the final UPDATE query with both compulsory and temporary conditions
  return `UPDATE ${req.body.Table_Name} SET ${setClause} WHERE (${Ccond}) AND (${Tcond});`;
}

function objectToQuery(tableName, conditions, count) {
  // Get the keys from the conditions object
  const keys = Object.keys(conditions);

  // Build the WHERE clause by combining the conditions
  const whereClause = keys
    .map((key) => {
      const value = conditions[key];
      if (typeof value === "number") {
        return `${key} = ${value}`; // No quotes for numbers
      }
      return `${key} = '${value}'`; // Add quotes for strings
    })
    .join(" AND ");

  // Return the complete SQL query
  return `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT ${count};`;
}

const MongoQueryDa = (CompulsoryKeys, TempKeys) => {
  // Generate conditions for compulsory keys
  const Ccond = Object.keys(CompulsoryKeys).map((Ckey) => {
    const value = CompulsoryKeys[Ckey];
    if (Array.isArray(value)) {
      // Handle arrays in CompulsoryKeys
      return { [Ckey]: { $in: value } }; // Use $in for arrays
    } else {
      // Handle single values in CompulsoryKeys
      return { [Ckey]: value }; // Direct match
    }
  });

  // Generate conditions for temporary keys
  const Tcond = Object.keys(TempKeys).map((Tkey) => {
    const value = TempKeys[Tkey];
    if (Array.isArray(value)) {
      // Handle arrays in TempKeys
      return { [Tkey]: { $in: value } }; // Use $in for arrays
    } else {
      // Handle single values in TempKeys
      return { [Tkey]: value }; // Direct match
    }
  });

  // Combine conditions with $and for MongoDB
  return { $and: [{ $and: Ccond }, { $or: Tcond }] };
};

function SqlQueryDa(CompulsoryKeys, TempKeys, TableName) {
  const Ckeys = Object.keys(CompulsoryKeys);
  const Tkeys = Object.keys(TempKeys);

  // Generate conditions for compulsory keys
  const Ccond = Ckeys.map((Ckey) => {
    const value = CompulsoryKeys[Ckey];
    if (Array.isArray(value)) {
      // Handle arrays in CompulsoryKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === "number") {
            return `${Ckey} = ${subVal}`; // No quotes for numbers
          }
          return `${Ckey} = '${subVal}'`; // Add quotes for strings
        })
        .join(" OR ")})`; // Wrap in parentheses
    } else {
      // Handle single values in CompulsoryKeys
      if (typeof value === "number") {
        return `${Ckey} = ${value}`; // No quotes for numbers
      }
      return `${Ckey} = '${value}'`; // Add quotes for strings
    }
  }).join(" AND ");

  // Generate conditions for temporary keys
  const Tcond = Tkeys.map((Tkey) => {
    const value = TempKeys[Tkey];
    if (Array.isArray(value)) {
      // Handle arrays in TempKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === "number") {
            return `${Tkey} = ${subVal}`; // No quotes for numbers
          }
          return `${Tkey} = '${subVal}'`; // Add quotes for strings
        })
        .join(" OR ")})`; // Wrap in parentheses
    } else {
      // Handle single values in TempKeys
      if (typeof value === "number") {
        return `${Tkey} = ${value}`; // No quotes for numbers
      }
      return `${Tkey} = '${value}'`; // Add quotes for strings
    }
  }).join(" OR ");

  // Return the final DELETE query
  return `DELETE FROM ${TableName} WHERE (${Ccond}) AND (${Tcond});`;
}
function SqlQuerySa(CompulsoryKeys, TempKeys, TableName) {
  const Ckeys = Object.keys(CompulsoryKeys);
  const Tkeys = Object.keys(TempKeys);

  // Generate conditions for compulsory keys
  const Ccond = Ckeys.map((Ckey) => {
    const value = CompulsoryKeys[Ckey];
    if (Array.isArray(value)) {
      // Handle arrays in CompulsoryKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === "number") {
            return `${Ckey} = ${subVal}`; // No quotes for numbers
          }
          return `${Ckey} = '${subVal}'`; // Add quotes for strings
        })
        .join(" OR ")})`; // Wrap in parentheses
    } else {
      // Handle single values in CompulsoryKeys
      if (typeof value === "number") {
        return `${Ckey} = ${value}`; // No quotes for numbers
      }
      return `${Ckey} = '${value}'`; // Add quotes for strings
    }
  }).join(" AND ");

  // Generate conditions for temporary keys
  const Tcond = Tkeys.map((Tkey) => {
    const value = TempKeys[Tkey];
    if (Array.isArray(value)) {
      // Handle arrays in TempKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === "number") {
            return `${Tkey} = ${subVal}`; // No quotes for numbers
          }
          return `${Tkey} = '${subVal}'`; // Add quotes for strings
        })
        .join(" OR ")})`; // Wrap in parentheses
    } else {
      // Handle single values in TempKeys
      if (typeof value === "number") {
        return `${Tkey} = ${value}`; // No quotes for numbers
      }
      return `${Tkey} = '${value}'`; // Add quotes for strings
    }
  }).join(" OR ");

  // Return the final DELETE query
  return `SELECT * FROM ${TableName} WHERE (${Ccond}) AND (${Tcond});`;
}

function SqlQueryDa0(CompulsoryKeys, TempKeys, TableName, count) {
  const Ckeys = Object.keys(CompulsoryKeys);
  const Tkeys = Object.keys(TempKeys);

  // Generate conditions for compulsory keys
  const Ccond = Ckeys.map((Ckey) => {
    const value = CompulsoryKeys[Ckey];
    if (Array.isArray(value)) {
      // Handle arrays in CompulsoryKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === "number") {
            return `${Ckey} = ${subVal}`; // No quotes for numbers
          }
          return `${Ckey} = '${subVal}'`; // Add quotes for strings
        })
        .join(" OR ")})`; // Wrap in parentheses
    } else {
      // Handle single values in CompulsoryKeys
      if (typeof value === "number") {
        return `${Ckey} = ${value}`; // No quotes for numbers
      }
      return `${Ckey} = '${value}'`; // Add quotes for strings
    }
  }).join(" AND ");

  // Generate conditions for temporary keys
  const Tcond = Tkeys.map((Tkey) => {
    const value = TempKeys[Tkey];
    if (Array.isArray(value)) {
      // Handle arrays in TempKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === "number") {
            return `${Tkey} = ${subVal}`; // No quotes for numbers
          }
          return `${Tkey} = '${subVal}'`; // Add quotes for strings
        })
        .join(" OR ")})`; // Wrap in parentheses
    } else {
      // Handle single values in TempKeys
      if (typeof value === "number") {
        return `${Tkey} = ${value}`; // No quotes for numbers
      }
      return `${Tkey} = '${value}'`; // Add quotes for strings
    }
  }).join(" OR ");

  // Return the final DELETE query
  return `DELETE FROM ${TableName} WHERE (${Ccond}) AND (${Tcond}) LIMIT ${count};`;
}
function SqlQuerySa0(CompulsoryKeys, TempKeys, TableName, count) {
  const Ckeys = Object.keys(CompulsoryKeys);
  const Tkeys = Object.keys(TempKeys);

  // Generate conditions for compulsory keys
  const Ccond = Ckeys.map((Ckey) => {
    const value = CompulsoryKeys[Ckey];
    if (Array.isArray(value)) {
      // Handle arrays in CompulsoryKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === "number") {
            return `${Ckey} = ${subVal}`; // No quotes for numbers
          }
          return `${Ckey} = '${subVal}'`; // Add quotes for strings
        })
        .join(" OR ")})`; // Wrap in parentheses
    } else {
      // Handle single values in CompulsoryKeys
      if (typeof value === "number") {
        return `${Ckey} = ${value}`; // No quotes for numbers
      }
      return `${Ckey} = '${value}'`; // Add quotes for strings
    }
  }).join(" AND ");

  // Generate conditions for temporary keys
  const Tcond = Tkeys.map((Tkey) => {
    const value = TempKeys[Tkey];
    if (Array.isArray(value)) {
      // Handle arrays in TempKeys
      return `(${value
        .map((subVal) => {
          if (typeof subVal === "number") {
            return `${Tkey} = ${subVal}`; // No quotes for numbers
          }
          return `${Tkey} = '${subVal}'`; // Add quotes for strings
        })
        .join(" OR ")})`; // Wrap in parentheses
    } else {
      // Handle single values in TempKeys
      if (typeof value === "number") {
        return `${Tkey} = ${value}`; // No quotes for numbers
      }
      return `${Tkey} = '${value}'`; // Add quotes for strings
    }
  }).join(" OR ");

  // Return the final DELETE query
  return `SELECT FROM ${TableName} WHERE (${Ccond}) AND (${Tcond}) LIMIT ${count};`;
}

function objectToQueryC(tableName, conditions) {
  // Get the keys from the conditions object
  const keys = Object.keys(conditions);

  // Build the WHERE clause by combining the conditions
  const keysGroup = keys.map((key) => `${key}`).join(",");

  const valueGroups = keys.map((key) => `${conditions[key]}`).join(",");

  // Return the complete SQL query
  return `INSERT INTO ${tableName} (${keysGroup}) VALUES (${valueGroups});`;
}
function objectToQueryD(tableName, conditions) {
  // Get the keys from the conditions object
  const keys = Object.keys(conditions);

  // Build the WHERE clause by combining the conditions
  const keysGroup = keys.map((key) => `${key}`).join(",");

  const valueGroups = keys.map((key) => `${conditions[key]}`).join(",");

  // Return the complete SQL query
  return `INSERT INTO ${tableName} (${keysGroup}) VALUES (${valueGroups});`;
}

const crudMiddleware = async (req, res, next) => {
  const requestType = req.method;
  const modelInstance = req.body.model;

  const filterFields = req.body.filterField;

  const filterValues = req.body.filterValues;

  if (requestType == "POST" || requestType == "PUT") {
    if (!requestType || !modelInstance) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
  }

  try {
    if (requestType == "POST" || requestType == "PUT") {
      if (!requestType || !modelInstance) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
    }

    if (requestType === "GET") {
      if (req.body.DatabaseName == "mongo") {
        const query = MongoQueryDa(req.body.CompulsoryKeys, req.body.TempKeys);
        if (req.body.getNumberOfResults === "all") {
          let data = await modelInstance.find(query);
          return res.status(200).json(data);
        } else {
          let data = await modelInstance
            .find(query)
            .limit(req.body.getNumberOfResults);
          return res.status(200).json(data);
        }
      } else if (req.body.DatabaseName == "mysql") {
        const pool = req.body.model;
        if (req.body.getNumberOfResults === "all") {
          const quer = SqlQuerySa(
            CompulsoryKeys,
            TempKeys,
            req.body.Table_Name
          );

          pool.query(quer, (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
          });
        } else {
          const quer = objectToQuery(
            req.body.Table_Name,
            req.body.query,
            req.body.getNumberOfResults
          );
          pool.query(quer, (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
          });
        }
      }
    } else if (requestType === "POST") {
      if (body.DatabaseName == "mongo") {
        const dataToCreate = filterValues;
        if (!dataToCreate) {
          return res
            .status(400)
            .json({ error: "filterValues are required to create a new entry" });
        }
        const newItem = new modelInstance(dataToCreate);
        await newItem.save();
        return res.status(201).json(newItem);
      } else if (body.DatabaseName == "mysql") {
        const dataToCreate = filterValues;
        const pool = req.body.model;
        if (!dataToCreate) {
          return res
            .status(400)
            .json({ error: "filterValues are required to create a new entry" });
        }
        const dtcq = objectToQueryC(req.body.Table_Name, dataToCreate);
        pool.query(dtcq, (err, results) => {
          if (err) return res.status(500).send(err);
          res.json(results);
        });
      }
    } else if (requestType === "PUT") {
      if (req.body.DatabaseName == "mongo") {
        const query = MongoQueryDa(req.body.CompulsoryKeys, req.body.TempKeys);
        const updatedItem = await modelInstance.findOneAndUpdate(
          query,
          filterValues,
          { new: true }
        );
        if (!updatedItem) {
          return res.status(404).json({ error: "No record found to update" });
        }

        return res.status(200).json(updatedItem);
      }else if(req.body.DatabaseName=="mysql"){
        const query = SqlQueryUpdate(req);

        // Execute the query (assuming you are using a pool or connection)
        pool.query(query, (err, results) => {
          if (err) return res.status(500).send(err);
          res.status(200).json(results); // Send the result back to the client
        });
      }
    } else if (requestType === "DELETE") {
      const CompulsoryKeys = req.body.CompulsoryKeys;
      const TempKeys = req.body.TempKeys;

      if (req.body.DatabaseName == "mongo") {
        const query = MongoQueryDa(req.body.CompulsoryKeys, req.body.TempKeys);

        // Use the generated query in the delete operation
        const deletedItem =
          req.body.deleteType == "one"
            ? await modelInstance.findOneAndDelete(query)
            : await modelInstance.deleteMany(query);

        // Send the result back to the client
        res.status(200).json(deletedItem);
      } else if (req.body.DatabaseName == "mysql") {
        const pool = req.body.model;
        if (req.body.getNumberOfResults == "all") {
          const quer = SqlQueryDa(
            CompulsoryKeys,
            TempKeys,
            req.body.Table_Name
          );
          pool.query(dtcq, (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
          });
        } else {
          const quer = SqlQueryDa0(
            CompulsoryKeys,
            TempKeys,
            req.body.Table_Name,
            req.body.getNumberOfResults
          );
          pool.query(dtcq, (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
          });
        }
      }
    } else {
      return res.status(400).json({ error: "Invalid request type" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", message: err.message });
  }
};

module.exports = crudMiddleware;
