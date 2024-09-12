import EventEmitter from "node:events";
import { BaseType, DataTypeMap, Infer } from "../@foxlib/data-types";
import { SchedulerModel } from "../database/scheduler_schema";
import { SharedEntity } from "../@foxlib/shared-entity";

// Определение статусов задачи
enum TaskStatus {
  Scheduled = "Запланировано",
  InProgress = "В процессе",
  Completed = "Завершено",
  Inactive = "Не активен",
}

type ITask = Infer<typeof SchedulerModel.model>

// Класс Task представляет задачу
export class Task<T extends Record<string, BaseType>, E extends SharedEntity<T>, P extends ITask['tasks'][number]>{
  id: number;
  status: TaskStatus;
  timer?: { clear: () => void };

  constructor(id: number, public schema: E, public data: P) {
    this.id = id;
    this.status = TaskStatus.Scheduled; // Изначальный статус задачи
  }
}

// Класс TaskScheduler управляет задачами и их расписанием
export default class TaskScheduler<T extends Record<string, BaseType>, E extends SharedEntity<T>, P extends ITask['tasks'][number]> extends EventEmitter {
  private tasks: Map<number, Task<T, E, P>> = new Map();
  private nextId: number = 1;

  // Добавление новой задачи
  addTask(schema: E, data: P): Task<T, E, P> {
    const id = this.nextId++;
    const task = new Task<T, E, P>(id, schema, data);
    this.tasks.set(id, task);
    this.scheduleTask(task);
    return task;
  }

  // Удаление задачи по ID
  removeTask(id: number): boolean {
    const task = this.tasks.get(id);
    if (task) {
      if (task.timer) task.timer.clear();
      this.tasks.delete(id);
      return true;
    }
    return false;
  }

  // Получение всех задач
  getAllTasks(): Task<T, E, P>[] {
    return Array.from(this.tasks.values());
  }

  // Установка таймера для задачи
  private scheduleTask(task: Task<T, E, P>) {
    const timeToEvent = new Date(task.data.task_due).getTime() - Date.now();
    task.timer = this.setLongTimeout(() => {
      this.emit("taskDue", task);
      task.status = TaskStatus.Completed; // Обновление статуса задачи при наступлении срока
    }, timeToEvent);
  }

  // Функция для установки таймера с поддержкой больших интервалов
  private setLongTimeout(
    callback: () => void,
    delay: number
  ): { clear: () => void } {
    const MAX_TIMEOUT = 2147483647; // Максимальное значение для setTimeout (~24.8 дня)
    let currentTimeout: NodeJS.Timeout | null = null;

    const executeCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error("Error executing callback:", error);
      }
    };

    const scheduleNextTimeout = (remainingDelay: number) => {
      if (remainingDelay > MAX_TIMEOUT) {
        currentTimeout = setTimeout(() => {
          scheduleNextTimeout(remainingDelay - MAX_TIMEOUT);
        }, MAX_TIMEOUT);
      } else {
        currentTimeout = setTimeout(executeCallback, remainingDelay);
      }
    };

    scheduleNextTimeout(delay);

    return {
      clear: () => {
        if (currentTimeout) {
          clearTimeout(currentTimeout);
          currentTimeout = null;
        }
      }
    };
  }
}
