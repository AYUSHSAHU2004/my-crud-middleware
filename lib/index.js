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
            return typeof value === "number" ? `${Ckey} = ${value}` : `${Ckey} = '${value}'`;
        }).join(" AND ");

        const Tcond = Tkeys.map((Tkey) => {
            const value = TempKeys[Tkey];
            if (Array.isArray(value)) {
                return `(${value.map((subVal) => {
                    return typeof subVal === "number" ? `${Tkey} = ${subVal}` : `${Tkey} = '${subVal}'`;
                }).join(" OR ")})`;
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
    // Initialize conditions
    let Ccond = [];
    let Tcond = [];
  
    // Check if CompulsoryKeys is present
    if (CompulsoryKeys && Object.keys(CompulsoryKeys).length > 0) {
      Ccond = Object.keys(CompulsoryKeys).map((Ckey) => {
        const value = CompulsoryKeys[Ckey];
        if (Array.isArray(value)) {
          return { [Ckey]: { $in: value } }; // Use $in for arrays
        } else {
          return { [Ckey]: value }; // Direct match
        }
      });
    }
  
    // Check if TempKeys is present
    if (TempKeys && Object.keys(TempKeys).length > 0) {
      Tcond = Object.keys(TempKeys).map((Tkey) => {
        const value = TempKeys[Tkey];
        if (Array.isArray(value)) {
          return { [Tkey]: { $in: value } }; // Use $in for arrays
        } else {
          return { [Tkey]: value }; // Direct match
        }
      });
    }
  
    // Handle cases based on the presence of keys
    if (Ccond.length > 0 && Tcond.length > 0) {
      // Both CompulsoryKeys and TempKeys are present
      return { $and: [{ $and: Ccond }, { $or: Tcond }] };
    } else if (Ccond.length > 0) {
      // Only CompulsoryKeys are present
      return { $and: Ccond };
    } else if (Tcond.length > 0) {
      // Only TempKeys are present
      return { $or: Tcond };
    } else {
      // Neither CompulsoryKeys nor TempKeys are present
      return {}; // Return an empty condition
    }
  };
  
  
  function SqlQueryDa(CompulsoryKeys, TempKeys, TableName) {
    if(!CompulsoryKeys && !TempKeys){
        return `DELETE FROM ${TableName};`
    }else if(!CompulsoryKeys && TempKeys){
        const Tkeys = Object.keys(TempKeys);
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
          return `DELETE FROM ${TableName} WHERE (${Tcond});`;


    }else if(CompulsoryKeys && !TempKeys){
        const Ckeys = Object.keys(CompulsoryKeys);
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
          return `DELETE FROM ${TableName} WHERE (${Ccond});`;

    }else{
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
  }
  function SqlQuerySa(CompulsoryKeys, TempKeys, TableName) {
    if(!CompulsoryKeys && !TempKeys){
        return `SELECT * FROM ${TableName};`
    }else if(!CompulsoryKeys && TempKeys){
        const Tkeys = Object.keys(TempKeys);
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
          console.log( `SELECT * FROM ${TableName} WHERE (${Tcond});`);
          return `SELECT * FROM ${TableName} WHERE (${Tcond});`;


    }else if(CompulsoryKeys && !TempKeys){
        const Ckeys = Object.keys(CompulsoryKeys);
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
          return `SELECT * FROM ${TableName} WHERE (${Ccond});`;

    }else{
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
  }


  function SqlQuerySs(CompulsoryKeys, TempKeys, TableName , count) {
    if(!CompulsoryKeys && !TempKeys){
        return `SELECT * FROM ${TableName} LIMIT ${count};`
    }else if(!CompulsoryKeys && TempKeys){
        const Tkeys = Object.keys(TempKeys);
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
          console.log( `SELECT * FROM ${TableName} WHERE (${Tcond});`);
          return `SELECT * FROM ${TableName} WHERE (${Tcond}) LIMIT ${count};`;


    }else if(CompulsoryKeys && !TempKeys){
        const Ckeys = Object.keys(CompulsoryKeys);
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
          return `SELECT * FROM ${TableName} WHERE (${Ccond}) LIMIT ${count};`;
    }else{
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
    
    return `SELECT * FROM ${TableName} WHERE (${Ccond}) AND (${Tcond}) LIMIT ${count};`;
    }
  }
  
  function SqlQueryDa0(CompulsoryKeys, TempKeys, TableName, count) {
    if(!CompulsoryKeys && !TempKeys){
        return `DELETE FROM ${TableName} LIMIT ${count};`
    }else if(!CompulsoryKeys && TempKeys){
        const Tkeys = Object.keys(TempKeys);
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
          console.log( `DELETE FROM ${TableName} WHERE (${Tcond});`);
          return `DELETE FROM ${TableName} WHERE (${Tcond}) LIMIT ${count};`;


    }else if(CompulsoryKeys && !TempKeys){
        const Ckeys = Object.keys(CompulsoryKeys);
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
          return `DELETE FROM ${TableName} WHERE (${Ccond}) LIMIT ${count};`;
    }else{
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
  
  
  