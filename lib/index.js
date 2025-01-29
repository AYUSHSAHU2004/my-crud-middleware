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
  const { CompulsoryKeys, TempKeys, filterValues, Table_Name } = req.body;

  // Error handling for missing keys
  if (!filterValues) {
      throw new Error("filterValues is not provided in the request.");
  }
  if (!Table_Name) {
      throw new Error("Table_Name is not provided in the request.");
  }

  const setClauses = filterValues;
  const ks = Object.keys(setClauses);
  const setClause = ks.map((k) => {
      const value = setClauses[k];
      if (typeof value === "number") {
          return `${k} = ${value}`; // No quotes for numbers
      }
      return `${k} = '${value}'`; // Add quotes for strings
  }).join(",");

  if (!CompulsoryKeys && !TempKeys) {
      return `UPDATE ${Table_Name} SET ${setClause}`;
  } else if (!CompulsoryKeys && TempKeys) {
      // Handle TempKeys only
      const Tkeys = Object.keys(TempKeys);
      const Tcond = Tkeys.map((Tkey) => {
          const value = TempKeys[Tkey];
          if (Array.isArray(value)) {
              return `(${value.map((subVal) => {
                  return typeof subVal === "number" ? `${Tkey} = ${subVal}` : `${Tkey} = '${subVal}'`;
              }).join(" OR ")})`;
          }

          // Handle comparison operators
          if (typeof value === 'string' && value.match(/^[><=]+[\d.]+$/)) {
              // If value contains a comparison operator (>, <, >=, <=, etc.)
              return `${Tkey} ${value}`;
          }

          return typeof value === "number" ? `${Tkey} = ${value}` : `${Tkey} = '${value}'`;
      }).join(" OR ");
      return `UPDATE ${Table_Name} SET ${setClause} WHERE (${Tcond});`;
  } else if (CompulsoryKeys && !TempKeys) {
      // Handle CompulsoryKeys only
      const Ckeys = Object.keys(CompulsoryKeys);
      const Ccond = Ckeys.map((Ckey) => {
          const value = CompulsoryKeys[Ckey];
          if (Array.isArray(value)) {
              return `(${value.map((subVal) => {
                  return typeof subVal === "number" ? `${Ckey} = ${subVal}` : `${Ckey} = '${subVal}'`;
              }).join(" OR ")})`;
          }

          // Handle comparison operators
          if (typeof value === 'string' && value.match(/^[><=]+[\d.]+$/)) {
              return `${Ckey} ${value}`;
          }

          return typeof value === "number" ? `${Ckey} = ${value}` : `${Ckey} = '${value}'`;
      }).join(" AND ");
      return `UPDATE ${Table_Name} SET ${setClause} WHERE (${Ccond});`;
  } else {
      // Handle both CompulsoryKeys and TempKeys
      const Ckeys = Object.keys(CompulsoryKeys);
      const Tkeys = Object.keys(TempKeys);

      const Ccond = Ckeys.map((Ckey) => {
          const value = CompulsoryKeys[Ckey];
          if (Array.isArray(value)) {
              return `(${value.map((subVal) => {
                  return typeof subVal === "number" ? `${Ckey} = ${subVal}` : `${Ckey} = '${subVal}'`;
              }).join(" OR ")})`;
          }

          // Handle comparison operators
          if (typeof value === 'string' && value.match(/^[><=]+[\d.]+$/)) {
              return `${Ckey} ${value}`;
          }

          return typeof value === "number" ? `${Ckey} = ${value}` : `${Ckey} = '${value}'`;
      }).join(" AND ");

      const Tcond = Tkeys.map((Tkey) => {
          const value = TempKeys[Tkey];
          if (Array.isArray(value)) {
              return `(${value.map((subVal) => {
                  return typeof subVal === "number" ? `${Tkey} = ${subVal}` : `${Tkey} = '${subVal}'`;
              }).join(" OR ")})`;
          }

          // Handle comparison operators
          if (typeof value === 'string' && value.match(/^[><=]+[\d.]+$/)) {
              return `${Tkey} ${value}`;
          }

          return typeof value === "number" ? `${Tkey} = ${value}` : `${Tkey} = '${value}'`;
      }).join(" OR ");

      return `UPDATE ${Table_Name} SET ${setClause} WHERE (${Ccond}) AND (${Tcond});`;
  }
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
  let Ccond = [];
  let Tcond = [];

  // Function to handle comparison operators in values
  const handleComparisonOperators = (key, value) => {
    if (typeof value === 'string' && /^[><=]+\s*\d+(\.\d+)?$/.test(value)) {
      // Extract operator and numeric value correctly
      const match = value.match(/^([><=]+)\s*(\d+(\.\d+)?)$/);
      if (match) {
        const operator = match[1]; // Extract operator (>, <, >=, <=)
        const numValue = parseFloat(match[2]); // Convert value to a number

        switch (operator) {
          case '>':
            return { [key]: { $gt: numValue } };
          case '<':
            return { [key]: { $lt: numValue } };
          case '>=':
            return { [key]: { $gte: numValue } };
          case '<=':
            return { [key]: { $lte: numValue } };
          default:
            return { [key]: numValue }; // Default case (direct match)
        }
      }
    }
    return { [key]: value }; // Return as-is if not a comparison string
  };

  // Process CompulsoryKeys
  if (CompulsoryKeys && Object.keys(CompulsoryKeys).length > 0) {
    Ccond = Object.keys(CompulsoryKeys).map((Ckey) => {
      const value = CompulsoryKeys[Ckey];
      return Array.isArray(value)
        ? { [Ckey]: { $in: value } }
        : handleComparisonOperators(Ckey, value);
    });
  }

  // Process TempKeys
  if (TempKeys && Object.keys(TempKeys).length > 0) {
    Tcond = Object.keys(TempKeys).map((Tkey) => {
      const value = TempKeys[Tkey];
      return Array.isArray(value)
        ? { [Tkey]: { $in: value } }
        : handleComparisonOperators(Tkey, value);
    });
  }

  // Construct final MongoDB query
  if (Ccond.length > 0 && Tcond.length > 0) {
    return { $and: [{ $and: Ccond }, { $or: Tcond }] };
  } else if (Ccond.length > 0) {
    return { $and: Ccond };
  } else if (Tcond.length > 0) {
    return { $or: Tcond };
  } else {
    return {}; // Empty condition
  }
};




function SqlQueryDa(CompulsoryKeys, TempKeys, TableName) {
  // Helper function to handle comparison operators
  const handleComparisonOperators = (key, value) => {
    if (typeof value === 'string' && value.match(/^[><=]+ *[\d.]+$/)) {
      const operator = value.trim().split(' ')[0]; // ">", "<", etc.
      const numValue = parseFloat(value.trim().split(' ')[1]); // Get the numeric part
      switch (operator) {
        case '>':
          return `${key} > ${numValue}`;
        case '<':
          return `${key} < ${numValue}`;
        case '>=':
          return `${key} >= ${numValue}`;
        case '<=':
          return `${key} <= ${numValue}`;
        default:
          return `${key} = '${value}'`; // If no valid operator, return as is
      }
    }
    return `${key} = '${value}'`; // Default case for equality
  };

  // Case when neither CompulsoryKeys nor TempKeys are provided
  if (!CompulsoryKeys && !TempKeys) {
    return `DELETE FROM ${TableName};`;
  }
  
  // Case when only TempKeys are provided
  else if (!CompulsoryKeys && TempKeys) {
    const Tkeys = Object.keys(TempKeys);
    const Tcond = Tkeys.map((Tkey) => {
      const value = TempKeys[Tkey];
      if (Array.isArray(value)) {
        // Handle arrays in TempKeys
        return `(${value
          .map((subVal) => handleComparisonOperators(Tkey, subVal))
          .join(" OR ")})`; // Wrap in parentheses
      } else {
        return handleComparisonOperators(Tkey, value); // Handle single values
      }
    }).join(" OR ");
    return `DELETE FROM ${TableName} WHERE (${Tcond});`;
  }

  // Case when only CompulsoryKeys are provided
  else if (CompulsoryKeys && !TempKeys) {
    const Ckeys = Object.keys(CompulsoryKeys);
    const Ccond = Ckeys.map((Ckey) => {
      const value = CompulsoryKeys[Ckey];
      if (Array.isArray(value)) {
        return `(${value
          .map((subVal) => handleComparisonOperators(Ckey, subVal))
          .join(" OR ")})`; // Wrap in parentheses
      } else {
        return handleComparisonOperators(Ckey, value); // Handle single values
      }
    }).join(" AND ");
    return `DELETE FROM ${TableName} WHERE (${Ccond});`;
  }

  // Case when both CompulsoryKeys and TempKeys are provided
  else {
    const Ckeys = Object.keys(CompulsoryKeys);
    const Tkeys = Object.keys(TempKeys);

    // Generate conditions for compulsory keys
    const Ccond = Ckeys.map((Ckey) => {
      const value = CompulsoryKeys[Ckey];
      if (Array.isArray(value)) {
        return `(${value
          .map((subVal) => handleComparisonOperators(Ckey, subVal))
          .join(" OR ")})`; // Wrap in parentheses
      } else {
        return handleComparisonOperators(Ckey, value); // Handle single values
      }
    }).join(" AND ");

    // Generate conditions for temporary keys
    const Tcond = Tkeys.map((Tkey) => {
      const value = TempKeys[Tkey];
      if (Array.isArray(value)) {
        return `(${value
          .map((subVal) => handleComparisonOperators(Tkey, subVal))
          .join(" OR ")})`; // Wrap in parentheses
      } else {
        return handleComparisonOperators(Tkey, value); // Handle single values
      }
    }).join(" OR ");

    return `DELETE FROM ${TableName} WHERE (${Ccond}) AND (${Tcond});`;
  }
}



function SqlQuerySa(CompulsoryKeys, TempKeys, TableName) {
  const processConditions = (keys, values, joiner) => {
    return keys.map((key) => {
      const value = values[key];
      if (Array.isArray(value)) {
        return `(${value.map((subVal) => processCondition(key, subVal)).join(` OR `)})`;
      } else {
        return processCondition(key, value);
      }
    }).join(` ${joiner} `);
  };

  const processCondition = (key, value) => {
    if (typeof value === "string" && /^[<>]=?\s*\d+/.test(value)) {
      return `${key} ${value}`;
    } else if (typeof value === "number") {
      return `${key} = ${value}`;
    }
    return `${key} = '${value}'`;
  };

  if (!CompulsoryKeys && !TempKeys) {
    return `SELECT * FROM ${TableName};`;
  } else if (!CompulsoryKeys && TempKeys) {
    return `SELECT * FROM ${TableName} WHERE (${processConditions(Object.keys(TempKeys), TempKeys, "OR")});`;
  } else if (CompulsoryKeys && !TempKeys) {
    return `SELECT * FROM ${TableName} WHERE (${processConditions(Object.keys(CompulsoryKeys), CompulsoryKeys, "AND")});`;
  } else {
    return `SELECT * FROM ${TableName} WHERE (${processConditions(Object.keys(CompulsoryKeys), CompulsoryKeys, "AND")}) AND (${processConditions(Object.keys(TempKeys), TempKeys, "OR")});`;
  }
}

function SqlQuerySs(CompulsoryKeys, TempKeys, TableName, count) {
  if (!CompulsoryKeys && !TempKeys) {
      return `SELECT * FROM ${TableName} LIMIT ${count};`;
  } else if (!CompulsoryKeys && TempKeys) {
      const Tkeys = Object.keys(TempKeys);
      const Tcond = Tkeys.map((Tkey) => {
          const value = TempKeys[Tkey];
          if (Array.isArray(value)) {
              return `(${value.map((subVal) => {
                  if (typeof subVal === "number" || subVal.startsWith(">") || subVal.startsWith("<")) {
                      return `${Tkey} ${subVal.startsWith(">") || subVal.startsWith("<") ? subVal : "= " + subVal}`;
                  }
                  return `${Tkey} = '${subVal}'`;
              }).join(" OR ")})`;
          } else {
              if (typeof value === "number" || value.startsWith(">") || value.startsWith("<")) {
                  return `${Tkey} ${value.startsWith(">") || value.startsWith("<") ? value : "= " + value}`;
              }
              return `${Tkey} = '${value}'`;
          }
      }).join(" OR ");
      return `SELECT * FROM ${TableName} WHERE (${Tcond}) LIMIT ${count};`;
  } else if (CompulsoryKeys && !TempKeys) {
      const Ckeys = Object.keys(CompulsoryKeys);
      const Ccond = Ckeys.map((Ckey) => {
          const value = CompulsoryKeys[Ckey];
          if (Array.isArray(value)) {
              return `(${value.map((subVal) => {
                  if (typeof subVal === "number" || subVal.startsWith(">") || subVal.startsWith("<")) {
                      return `${Ckey} ${subVal.startsWith(">") || subVal.startsWith("<") ? subVal : "= " + subVal}`;
                  }
                  return `${Ckey} = '${subVal}'`;
              }).join(" OR ")})`;
          } else {
              if (typeof value === "number" || value.startsWith(">") || value.startsWith("<")) {
                  return `${Ckey} ${value.startsWith(">") || value.startsWith("<") ? value : "= " + value}`;
              }
              return `${Ckey} = '${value}'`;
          }
      }).join(" AND ");
      return `SELECT * FROM ${TableName} WHERE (${Ccond}) LIMIT ${count};`;
  } else {
      const Ckeys = Object.keys(CompulsoryKeys);
      const Tkeys = Object.keys(TempKeys);
      const Ccond = Ckeys.map((Ckey) => {
          const value = CompulsoryKeys[Ckey];
          if (Array.isArray(value)) {
              return `(${value.map((subVal) => {
                  if (typeof subVal === "number" || subVal.startsWith(">") || subVal.startsWith("<")) {
                      return `${Ckey} ${subVal.startsWith(">") || subVal.startsWith("<") ? subVal : "= " + subVal}`;
                  }
                  return `${Ckey} = '${subVal}'`;
              }).join(" OR ")})`;
          } else {
              if (typeof value === "number" || value.startsWith(">") || value.startsWith("<")) {
                  return `${Ckey} ${value.startsWith(">") || value.startsWith("<") ? value : "= " + value}`;
              }
              return `${Ckey} = '${value}'`;
          }
      }).join(" AND ");
      const Tcond = Tkeys.map((Tkey) => {
          const value = TempKeys[Tkey];
          if (Array.isArray(value)) {
              return `(${value.map((subVal) => {
                  if (typeof subVal === "number" || subVal.startsWith(">") || subVal.startsWith("<")) {
                      return `${Tkey} ${subVal.startsWith(">") || subVal.startsWith("<") ? subVal : "= " + subVal}`;
                  }
                  return `${Tkey} = '${subVal}'`;
              }).join(" OR ")})`;
          } else {
              if (typeof value === "number" || value.startsWith(">") || value.startsWith("<")) {
                  return `${Tkey} ${value.startsWith(">") || value.startsWith("<") ? value : "= " + value}`;
              }
              return `${Tkey} = '${value}'`;
          }
      }).join(" OR ");
      return `SELECT * FROM ${TableName} WHERE (${Ccond}) AND (${Tcond}) LIMIT ${count};`;
  }
}

function SqlQueryDa0(CompulsoryKeys, TempKeys, TableName, count) {
// Helper function to handle comparison operators
const handleComparisonOperators = (key, value) => {
  if (typeof value === 'string' && value.match(/^[<>!=]+[\s]*[\d.]+$/)) {
    const operator = value.trim().split(' ')[0]; // Extract operator ("<", ">", etc.)
    const numValue = value.trim().split(' ')[1]; // Get the numeric part
    return `${key} ${operator} ${numValue}`; // Build condition like "salary < 5000"
  }
  return `${key} = '${value}'`; // Default equality check for non-operator values
};

// Helper function to build conditions from keys and values
const buildCondition = (keys, conditionType) => {
  return keys
    .map((key) => {
      const value = conditionType[key];
      if (Array.isArray(value)) {
        // Handle array conditions
        return `(${value
          .map((subVal) => handleComparisonOperators(key, subVal))
          .join(" OR ")})`; // Wrap in parentheses
      } else {
        return handleComparisonOperators(key, value); // Handle single values
      }
    })
    .join(conditionType === CompulsoryKeys ? " AND " : " OR ");
};

switch (true) {
  case (!CompulsoryKeys && !TempKeys):
    return `DELETE FROM ${TableName} LIMIT ${count};`;

  case (!CompulsoryKeys && TempKeys):
    const Tkeys = Object.keys(TempKeys);
    const Tcond = buildCondition(Tkeys, TempKeys);
    return `DELETE FROM ${TableName} WHERE (${Tcond}) LIMIT ${count};`;

  case (CompulsoryKeys && !TempKeys):
    const Ckeys = Object.keys(CompulsoryKeys);
    const Ccond = buildCondition(Ckeys, CompulsoryKeys);
    return `DELETE FROM ${TableName} WHERE (${Ccond}) LIMIT ${count};`;

  default:
    const CkeysDefault = Object.keys(CompulsoryKeys);
    const TkeysDefault = Object.keys(TempKeys);

    const CcondDefault = buildCondition(CkeysDefault, CompulsoryKeys);
    const TcondDefault = buildCondition(TkeysDefault, TempKeys);

    return `DELETE FROM ${TableName} WHERE (${CcondDefault}) AND (${TcondDefault}) LIMIT ${count};`;
}
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

  // Build the WHERE clause by combining the conditions (just the keys)
  const keysGroup = keys.join(",");  // e.g., 'name, employee_code, salary'

  // Build the values part of the query, ensuring strings are enclosed in quotes
  const valueGroups = keys
    .map((key) => {
      const value = conditions[key];
      // Check if the value is a string and wrap it in single quotes
      return typeof value === 'string' ? `'${value}'` : value;
    })
    .join(",");  // e.g., "'ana', 'EMP1232', 10010"

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
  // const filterFields = req.body.filterField;
  const filterValues = req.body.filterValues;

  try {
    if (["POST", "PUT"].includes(requestType)) {
      if (!requestType || !modelInstance) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
    }

    if (requestType === "GET") {
      if (req.body.DatabaseName === "mongo") {
        const query = MongoQueryDa(req.body.CompulsoryKeys, req.body.TempKeys);
        const data = req.body.getNumberOfResults === "all"
          ? await modelInstance.find(query)
          : await modelInstance.find(query).limit(req.body.getNumberOfResults);
        return res.status(200).json(data);
      } else if (req.body.DatabaseName === "mysql") {
        const pool = req.body.model; // Assume `pool` is a promise-based MySQL client
        const CompulsoryKeys = req.body.CompulsoryKeys;
        const TempKeys = req.body.TempKeys;

        const query = req.body.getNumberOfResults === "all"
          ? SqlQuerySa(CompulsoryKeys, TempKeys, req.body.Table_Name)
          : SqlQuerySs(CompulsoryKeys, TempKeys, req.body.Table_Name , req.body.getNumberOfResults);

        const [results] = await pool.query(query);
        return results.length > 0
          ? res.json(results)
          : res.status(404).json({ message: "No data found" });
      }
    } else if (requestType === "POST") {
      if (req.body.DatabaseName === "mongo") {
        const newItem = new modelInstance(filterValues);
        await newItem.save();
        return res.status(201).json(newItem);
      } else if (req.body.DatabaseName === "mysql") {
        const pool = req.body.model;
        const query = objectToQueryC(req.body.Table_Name, filterValues);
        const [results] = await pool.query(query);
        return res.status(201).json(results);
      }
    } else if (requestType === "PUT") {
      if (req.body.DatabaseName === "mongo") {
        const query = MongoQueryDa(req.body.CompulsoryKeys, req.body.TempKeys);
        const updatedItem = await modelInstance.updateMany(query, filterValues, { new: true });
        if (!updatedItem) {
          return res.status(404).json({ error: "No record found to update" });
        }
        return res.status(200).json(updatedItem);
      } else if (req.body.DatabaseName === "mysql") {
        const pool = req.body.model;
        const query = SqlQueryUpdate(req);
        const [results] = await pool.query(query);
        return res.status(200).json(results);
      }
    } else if (requestType === "DELETE") {
      const CompulsoryKeys = req.body.CompulsoryKeys;
      const TempKeys = req.body.TempKeys;

      if (req.body.DatabaseName === "mongo") {
        const query = MongoQueryDa(CompulsoryKeys, TempKeys);
        const deletedItem = req.body.deleteType === "one"
          ? await modelInstance.findOneAndDelete(query)
          : await modelInstance.deleteMany(query);
        return res.status(200).json(deletedItem);
      } else if (req.body.DatabaseName === "mysql") {
        const pool = req.body.model;
        const query = req.body.getNumberOfResults === "all"
          ? SqlQueryDa(CompulsoryKeys, TempKeys, req.body.Table_Name)
          : SqlQueryDa0(CompulsoryKeys, TempKeys, req.body.Table_Name, req.body.getNumberOfResults);

        const [results] = await pool.query(query);
        return res.status(200).json(results);
      }
    } else {
      return res.status(400).json({ error: "Invalid request type" });
    }
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", message: err.message });
  }
};

module.exports = crudMiddleware;


