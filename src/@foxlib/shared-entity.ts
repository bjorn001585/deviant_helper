import {
  getFirestore,
  query,
  where,
  getDocs,
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  DocumentSnapshot,
  DocumentChange,
  QuerySnapshot
} from "firebase/firestore";
import * as firebase from "firebase/app";
import Model, { updateDatabaseStructure } from "./model";
import {
  BaseType,
  DataTypeInt,
  DataTypeString,
  type Infer,
} from "./data-types";

type Search<T> = {
  [Key in keyof T]: T[Key] extends DataTypeString<string>
    ? string
    : T[Key] extends DataTypeInt<number>
    ? number
    : never;
};

type RecursivelyPartial<T> = {
  [Key in keyof T]?: T[Key] extends object
    ? RecursivelyPartial<T[Key]>
    : T[Key];
};

export class SharedEntity<T extends Record<string, BaseType>> {
  constructor(public model: Model<T>, public payload: Infer<T>) {}

  async remove() {
    return await SharedEntity.remove(this);
  }

  static fromJson<T extends Record<string, BaseType>>(
    model: Model<T>,
    payload: Infer<T>
  ) {
    return new SharedEntity(model, payload);
  }

  static async toList<T extends Record<string, BaseType>>(
    model: Model<T>
  ): Promise<SharedEntity<T>[]> {
    const application = firebase.getApp();
    const firebaseRef = getFirestore(application);
    const userCollection = collection(firebaseRef, model.option.name);

    const snap = await getDocs(query(userCollection));

    return snap.docs.map((doc) =>
      SharedEntity.fromJson(model, doc.data() as any)
    );
  }

  static async remove<
    T extends Record<string, BaseType>,
  >(entity: SharedEntity<T>): Promise<boolean> {
    const application = firebase.getApp();
    const firebaseRef = getFirestore(application);
    const userCollection = collection(firebaseRef, entity.model.option.name);

    const queryFragments = entity.model.option.targets.map(target => where(String(target), "==", entity.payload[target]))
    const snap = await getDocs(query(userCollection, ...queryFragments));

    if (snap.docs.length > 0) {
      await deleteDoc(snap.docs[0].ref);
      return true;
    }

    return false;
  }

  static async create<T extends Record<string, BaseType>>(
    model: Model<T>,
    payload: Infer<T>
  ) {
    const application = firebase.getApp();
    const firebaseRef = getFirestore(application);
    const userCollection = collection(firebaseRef, model.option.name);

    const queryFragments = model.option.targets.map(target => where(String(target), "==", payload[target]))
    const snap = await getDocs(query(userCollection, ...queryFragments));

    const user = new SharedEntity(model, payload);
    if (snap.docs.length < 1) {
      await addDoc(userCollection, (await user.toJson()) as any);
      return user;
    } else {
      return user;
    }
  }

  static async findOneOrCreate<
    T extends Record<string, BaseType>,
    S extends Partial<Search<T>>
  >(
    model: Model<T>,
    payload: {
      search: S;
      createPayload?: RecursivelyPartial<Omit<Infer<T>, keyof S>>;
    }
  ) {
    const application = firebase.getApp();
    const firebaseRef = getFirestore(application);
    const userCollection = collection(firebaseRef, model.option.name);

    const queryFragments = Object.entries(payload.search).map(
      ([key, value]) => {
        return where(key, "==", value);
      }
    );

    const snap = await getDocs(query(userCollection, ...queryFragments));

    if (snap.docs.length < 1) {
      if (payload.createPayload != undefined) {
        return SharedEntity.create(model, {
          ...payload.createPayload,
          ...payload.search,
        } as Infer<T>);
      }

      throw new Error("SharedEntity not found");
    }

    const value = snap.docs[0].data() as Infer<T>;
    return SharedEntity.fromJson(model, value);
  }

  async save() {
    const application = firebase.getApp();
    const firebaseRef = getFirestore(application);
    const userCollection = collection(firebaseRef, this.model.option.name);

    const queryFragments = this.model.option.targets.map(target => where(String(target), "==", this.payload[target]))
    const snap = await getDocs(query(userCollection, ...queryFragments));

    if (snap.docs.length < 1) {
      throw new Error("SharedEntity not found");
    }

    // Обновляем структуру данных перед сохранением
    const updatedDocs = await updateDatabaseStructure(
      [this.payload],
      this.model
    );
    const updatedDoc = updatedDocs[0];

    // Устанавливаем значение по умолчанию для отсутствующих свойств
    for (const key in this.model.model) {
      if (updatedDoc[key] === null) {
        updatedDoc[key] = this.model.model[key].value;
      }
    }

    await setDoc(snap.docs[0].ref, updatedDoc as any);

    return this;
  }

  async onUpdate(fn: (data: QuerySnapshot<Infer<T>, Infer<T>>) => void) {
    const application = firebase.getApp();
    const firebaseRef = getFirestore(application);
    const userCollection = collection(firebaseRef, this.model.option.name);

    const queryFragments = this.model.option.targets.map(target => where(String(target), "==", this.payload[target]))

    onSnapshot(query(userCollection, ...queryFragments), {
      next: data => fn(data as any),
      error: error => {
        console.log(error)
      },
      complete: () => {
        console.log("complete!")
      }
    })
  }

  async toJson() {
    // Обновляем структуру данных согласно модели
    const updatedDocs = await updateDatabaseStructure(
      [this.payload],
      this.model
    );

    // Устанавливаем значение по умолчанию для отсутствующих свойств
    const updatedDoc = updatedDocs[0];
    for (const key in this.model.model) {
      if (updatedDoc[key] === null) {
        updatedDoc[key] = this.model.model[key].value;
      }   
    }

    return updatedDoc as Infer<T>;
  }
}
