import UI from './UI';

class Store {
  constructor() {
    this.localStorage = window.localStorage;
    this.projects = {};
  }

  addProject(project) {
    this.projects[project.name] = project;

    this.localStorage.setItem("projects", JSON.stringify(this.projects));

    UI.renderContent(event=null, project.getTasks());
  }

  removeProject(project) {
    delete this.projects[project.name];
    this.localStorage.setItem("projects", JSON.stringify(this.projects));
  }

  getProjects() {
    return JSON.parse(this.localStorage.getItem("projects"));
  }
}

export default (new Store);
