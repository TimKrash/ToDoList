import Store from './Store';

export default class Project {
  constructor(name) {
    this.name = name;
    this.activeTasks = [];
  }

  addTask(task) {
    this.activeTasks.push(task);
  }

  removeTask(task) {
    const idx = this.activeTasks.indexOf(task);
    if (idx > -1) {
      this.activeTasks.splice(idx, 1);
    }
  }

  getTasks() {
    return this.activeTasks;
  }
}
