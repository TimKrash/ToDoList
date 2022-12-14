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

  updateProject(project, newTask, oldTask=null) {
    const currProj = this.getProject(project.name);
    if (oldTask) {
      currProj.removeTask(oldTask.name);
    }
    currProj.addTask(newTask)
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

  removeProject(projectName) {
    const project = this.getProject(projectName);
    if (!project) {
      console.log("error removing project from store...doesn't exist");
      return;
    }

    project.removeTasks();
    this.localStorage.removeItem(project.name);
  }

  removeTask(project, taskName) {
    const targetProject = this.getProject(project);

    const activeTasks = targetProject.getTasks();
    for (let i = 0; i < activeTasks.length; i++) {
      const currTask = activeTasks[i];
      if (currTask.name === taskName) {
        targetProject.removeTask(currTask.name);
      }
    }

    this.addProject(targetProject);
  }
}

export default (new Store);
