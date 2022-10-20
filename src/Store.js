import Project from './Project';
import Utils from './Utils';

class Store {
  constructor() {
    this.localStorage = window.localStorage;
    //this.localStorage.clear();
  }

  addProject(project) {
    // serialize
    project.setName(Utils.editEachWord(project.name, false))
    const projectSerialized = project.toJSON();
    this.localStorage.setItem(project.name, projectSerialized);
  }

  updateProject(project, task) {
    const currProj = this.getProject(project.name);
    currProj.addTask(task);
    this.addProject(currProj);
  }

  getProject(name) {
    const rawProject = this.localStorage.getItem(name);
    const deserializedProj = Project.fromJSON(rawProject);
    return deserializedProj;
  }

  getProjects() {
    const projects = new Object();
    const storageKeys = Object.keys(this.localStorage);
    let i = storageKeys.length;

    while (i--) {
      const rawItem = this.localStorage.getItem(storageKeys[i]);
      const projectItem = Project.fromJSON(rawItem);
      projects[projectItem.name] = projectItem;
    }

    return projects;
  }
}

export default (new Store);
