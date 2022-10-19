class Store {
  constructor() {
    this.localStorage = window.localStorage;
    this.projects = {};
  }

  addProject(project) {
    // ensure all project names are lower case
    project.setName(project.name.toLowerCase());

    this.projects[project.name] = project;
    console.log(this.projects);

    this.localStorage.setItem("projects", JSON.stringify(this.projects));
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
