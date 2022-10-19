import Project from './Project';

export default class Task {
  constructor(name, description, priority, deadline, project) {
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.deadline = deadline;
    this.project = project;
  }

  getName() {
    return this.name;
  }

  setName(description) {
    this.description = description;
  }

  setPriority(priority) {
    this.priority = priority;
  }

  setDeadline(deadline) {
    this.deadline = deadline;
  }

  setProject(project) {
    this.project = project;
  }
}
