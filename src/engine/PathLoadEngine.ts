import fs from "fs";
import path from "path";

type LoadCallback = (path: string) => void;

export default class PathLoadEngine {
  static async load(dir: string, callback: LoadCallback) {
    try {
      const directory = path.resolve(process.cwd(), dir);

      const entities = await fs.promises.readdir(directory);

      for (const entity of entities) {
        const finalPath = path.join(directory, entity);

        const stat = await fs.promises.stat(finalPath);

        if (stat.isDirectory()) {
          await this.load(finalPath, callback);
        } else if (stat.isFile()) {
          callback(finalPath);
        }
      }
    } catch (error) {
      console.error(`Error while loading path: ${dir}`, error);
    }
  }
}
