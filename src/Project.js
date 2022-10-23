import Store from './Store';
import Task from './Task';

export default class Project {
  constructor(name="inbox", tasks=[]) {
    this.name = name;

    this.activeTasks = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      this.activeTasks.push(new Task(
        task.name,
        task.description,
        task.priority,
        task.deadline,
        task.project
      ));
    }
  }

  addTask(task) {
    this.activeTasks.push(task);
  }

  removeTask(taskName) {
    for (let i = 0; i < this.activeTasks.length; i++) {
      const currTask = this.activeTasks[i];
      if (currTask.name === taskName) {
        this.activeTasks.splice(i, 1);
        return;
      }
    }
  }

  getTasks() {
    return this.activeTasks;
  }

  getTask(taskName) {
    let targetTask;
    this.activeTasks.forEach(task => {
      if (task.name === taskName) {
        targetTask = task;
        return task;
      }
    });

    if (targetTask) {
      return targetTask;
    }

    return null;
  }

  setName(name) {
    this.name = name;
  }

  // Serialization/Deserialization methods
  toJSON() {
    return JSON.stringify({name: this.name, activeTasks: this.activeTasks});
  }

  static fromJSON(json) {
    const project = JSON.parse(json);
    return new Project(project.name, project.activeTasks);
  }
}
