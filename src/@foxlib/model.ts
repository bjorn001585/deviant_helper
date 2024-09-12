import type {
  BaseType,
  DataTypeEnum,
  DataTypeInt,
  DataTypeList,
  DataTypeMap,
  DataTypeString,
  Infer,
} from "./data-types";

interface ModelOption<T> {
  name: string;
  debug?: boolean
  targets: {
    [Key in keyof T]: T[Key] extends DataTypeString<string> 
      ? Key 
      : T[Key] extends DataTypeInt<number>
      ? Key
      : never
  }[keyof T][]
}

export default class Model<T extends Record<string, BaseType>> {
  model: T;

  constructor(model: T, public option: ModelOption<T>) {
    this.model = model;
  }

  validate(doc: any): Infer<T> {
    return this.validateStructure(doc, this.model);
  }

  private validateStructure(
    doc: any,
    model: Record<string, BaseType>,
    path: string = ""
  ) {
    for (let key in model) {
      const currentPath = path ? `${path}.${key}` : key;
      if (!(key in doc)) {
        if (model[key].isMap()) {
          doc[key] = {};
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Assigned default map for ${currentPath}`);
          }
          this.validateStructure(doc[key], model[key].value, currentPath);
        } else if (model[key].isList()) {
          doc[key] = [];
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Assigned default list for ${currentPath}`);
          }
          this.validateArray(
            doc[key],
            (model[key] as DataTypeList<BaseType>).elements,
            currentPath
          );
        } else if (model[key].isEnum()) {
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Assigned default enum value for ${currentPath}: ${JSON.stringify(doc[key])}`);
          }
          doc[key] = model[key].value;
        } else {
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Assigned default value for ${currentPath}: ${JSON.stringify(doc[key])}`);
          }
          doc[key] = model[key].value;
        }
      } else {
        if (model[key].isString()) {
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Checking key: ${key}, value: ${JSON.stringify(doc[key])}, expected type: string`);
          }
          if (typeof doc[key] !== "string" && doc[key] != null) {
            if(this.option.debug != undefined && this.option.debug) {
              console.log(`[Debug]: Type mismatch at ${currentPath}: expected string, got ${typeof doc[key]}`);
            }
            throw new Error(
              `Type mismatch at ${currentPath}: expected string, got ${typeof doc[key]}`
            );
          }
        } else if (model[key].isInt()) {
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Checking key: ${key}, value: ${JSON.stringify(doc[key])}, expected type: number`);
          }
          if (typeof doc[key] !== "number" && doc[key] != null) {
            if(this.option.debug != undefined && this.option.debug) {
              console.log(`[Debug]: Type mismatch at ${currentPath}: expected number, got ${typeof doc[key]}`);
            }
            throw new Error(
              `Type mismatch at ${currentPath}: expected number, got ${typeof doc[key]}`
            );
          }
        } else if (model[key].isList()) {
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Checking key: ${key}, value: ${JSON.stringify(doc[key])}, expected type: list`);
          }
          const listModel = model[key] as DataTypeList<BaseType>;
          if (!Array.isArray(doc[key]) && doc[key] != null) {
            if(this.option.debug != undefined && this.option.debug) {
              console.log(`[Debug]: Type mismatch at ${currentPath}: expected array, got ${typeof doc[key]}`);
            }
            throw new Error(
              `Type mismatch at ${currentPath}: expected array, got ${typeof doc[key]}`
            );
          } else {
            this.validateArray(doc[key], listModel.elements, currentPath);
          }
        } else if (model[key].isMap()) {
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Checking key: ${key}, value: ${JSON.stringify(doc[key])}, expected type: map`);
          }
          const mapModel = model[key] as DataTypeMap<Record<string, BaseType>>;
          if (typeof doc[key] !== "object" && doc[key] != null) {
            if(this.option.debug != undefined && this.option.debug) {
              console.log(`[Debug]: Type mismatch at ${currentPath}: expected map, got ${typeof doc[key]}`);
            }
            throw new Error(
              `Type mismatch at ${currentPath}: expected map, got ${typeof doc[key]}`
            );
          } else {
            if(this.option.debug != undefined && this.option.debug) {
              console.log(`[Debug]: Validating structure for map at ${currentPath}`);
            }
            this.validateStructure(doc[key], mapModel.value, currentPath);
          }
        } else if (model[key].isBoolean()) {
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Checking key: ${key}, value: ${JSON.stringify(doc[key])}, expected type: boolean`);
          }
          if (typeof doc[key] !== "boolean" && doc[key] != null) {
            if(this.option.debug != undefined && this.option.debug) {
              console.log(`[Debug]: Type mismatch at ${currentPath}: expected boolean, got ${typeof doc[key]}`);
            }
            throw new Error(
              `Type mismatch at ${currentPath}: expected boolean, got ${typeof doc[
                key
              ]}`
            );
          }
        } else if (model[key].isEnum()) {
          if(this.option.debug != undefined && this.option.debug) {
            console.log(`[Debug]: Checking key: ${key}, value: ${JSON.stringify(doc[key])}, expected type: enum`);
          }
          const enumModel = model[key] as DataTypeEnum<string | number, any>;
          const value = doc[key]?.value ?? doc[key];
          if (!enumModel.elements.includes(value) && value !== null) {
            if(this.option.debug != undefined && this.option.debug) {
              console.log(`[Debug]: Type mismatch at ${currentPath}: expected enum, got ${typeof doc[key]}`);
            }
            throw new Error(
              `Type mismatch at ${currentPath}: expected one of [${enumModel.elements.join(
                ", "
              )}], got ${value}`
            );
          }
        }
      }
    }

    for (let key in doc) {
      const currentPath = path ? `${path}.${key}` : key;
      if (!(key in model)) {
        if(this.option.debug != undefined && this.option.debug) {
          console.log(`[Debug]: Deleted unexpected key: ${currentPath}`);
        }
        delete doc[key];
      } else if (model[key].isMap()) {
        const mapModel = model[key] as DataTypeMap<Record<string, BaseType>>;
        if(this.option.debug != undefined && this.option.debug) {
          console.log(`[Debug]: Validating structure for map at ${currentPath}`);
        }
        this.validateStructure(doc[key], mapModel.value, currentPath);
      }
    }

    return doc;
  }

  private validateArray<T, K extends string>(
    array: any[],
    elementTypes: BaseType<T, K>[],
    path: string
  ) {
    array.forEach((item: any, index: number) => {
      let isValidType = false;
      for (const element of elementTypes) {
        if (element.isEnum() && element.elements.includes(item)) {
          isValidType = true;
          break;
        } else if (
          element.isMap() &&
          typeof item === "object" &&
          item !== null
        ) {
          try {
            this.validateStructure(item, element.value, `${path}[${index}]`);
            isValidType = true;
            break;
          } catch (e: any) {
            throw new Error(
              `Type mismatch in array at ${path}[${index}]: ${e.message}`
            );
          }
        } else if (element.isList() && Array.isArray(item)) {
          try {
            this.validateArray(item, element.elements, `${path}[${index}]`);
            isValidType = true;
            break;
          } catch (e: any) {
            throw new Error(
              `Type mismatch in array at ${path}[${index}]: ${e.message}`
            );
          }
        } else if (typeof item === element.type) {
          isValidType = true;
          break;
        }
      }
      if (!isValidType) {
        throw new Error(
          `Type mismatch in array at ${path}[${index}]: item does not match any of the expected types`
        );
      }
    });
  }
}

export function updateDatabaseStructure<T extends Record<string, BaseType>>(
  collection: any[],
  newModel: Model<T>
) {
  return new Promise<Infer<T>[]>((resolve, reject) => {
    const data: any[] = [];

    collection.forEach(async (doc: any) => {
      let updatedDoc = { ...doc };

      try {
        updatedDoc = newModel.validate(updatedDoc);

        // Рекурсивная функция для установки значений по умолчанию
        function setDefaultValues(updatedDoc: any, model: any) {
          for (const key in model) {
            if (!(key in updatedDoc)) {
              updatedDoc[key] = model[key].value;
              if(newModel.option.debug != undefined && newModel.option.debug) {
                console.log(`[Debug:updateDatabaseStructure]: Assigned default value for ${key}: ${JSON.stringify(updatedDoc[key])}`);
              }
            } else if (
              model[key].isMap() &&
              typeof updatedDoc[key] === "object" &&
              updatedDoc[key] !== null
            ) {
              if(newModel.option.debug != undefined && newModel.option.debug) {
                console.log(`[Debug:updateDatabaseStructure]: Recursively setting default values for map at ${key}`);
              }
              setDefaultValues(updatedDoc[key], model[key].value);
            } else if (model[key].isList() && Array.isArray(updatedDoc[key])) {
              const listModel = model[key] as DataTypeList<BaseType>;
              updatedDoc[key].forEach((item: any, index: number) => {
                if (listModel.elements.some((type: BaseType) => type.isMap())) {
                  const mapType = listModel.elements.find((type: BaseType) =>
                    type.isMap()
                  ) as DataTypeMap<any>;
                  if(newModel.option.debug != undefined && newModel.option.debug) {
                    console.log(`[Debug:updateDatabaseStructure]: Recursively setting default values for list item at ${key}[${index}]`);
                  }
                  setDefaultValues(item, mapType.value);
                }
              });
            }
          }
        }

        // Устанавливаем значения по умолчанию для отсутствующих свойств
        setDefaultValues(updatedDoc, newModel.model);

        // Обновляем структуру документа
        data.push(updatedDoc);
      } catch (error) {
        reject(error);
      }
    });
    resolve(data);
  });
}
