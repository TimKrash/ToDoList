import Store from './Store';

export default class Project {
  constructor(name="inbox", tasks=[]) {
    this.name = name;
    this.activeTasks = tasks;
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
