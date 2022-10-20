import './style.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import Task from './Task';
import Project from './Project';
import Store from './Store';
import Utils from './Utils';

export default class UI {
  // ************ LOAD SECTION *************

  // Used to load basic header, sidebar and content
  static loadPage() {
    // Get active projects from localStorage
    const loadedProjects = Store.getProjects();

    const root = document.querySelector(".root");
    const header = UI.loadHeader();
    const sidebar = UI.loadSidebar(loadedProjects);
    const mainContent = UI.loadContent();

    root.append(header, sidebar, mainContent);

    UI.addEventListeners();
  }

  static loadHeader() {
    const header = document.createElement('div');
    header.classList.add("header");

    header.innerHTML = `
      <div class="header-wrapper">
        <div class="logo">
          <i class="fa-solid fa-check-double fa-3x"></i>
        </div>
        <div class="hero">To-Do List</div>
        <div class="add-task"><i class="fa-solid fa-plus fa-3x"></i></div>
        <div class="menu"><i class="fa-solid fa-bars fa-3x"></i></div>
      </div>
      `;
    return header;
  }

  static loadSidebar(loadedProjects) {
    const sidebar = document.createElement('div');
    sidebar.classList.add('sidebar');

    sidebar.innerHTML = `
      <div class="entry" id="inbox">
        <i class="fa-solid fa-inbox"></i>
        <p>Inbox</p>
      </div>
      <div class="entry" id="today">
        <i class="fa-solid fa-calendar-day"></i>
        <p>Today</p>
      </div>
      <div class="entry" id="week">
        <i class="fa-solid fa-calendar-week"></i>
        <p>Week</p>
      </div>
      <div class="entry down" id="projects">
        <i class="fa-solid fa-list-check"></i>
        <p>Projects</p>
        <i class="fa-solid fa-caret-down"></i>
      </div>
    `;

    const currentProjects = document.createElement('div');
    currentProjects.classList.add("current-projects");

    const addNewProject = document.createElement('div');
    addNewProject.classList.add('add-new-project');

    // Load in any projects
    for (const projectName in loadedProjects) {
      if (projectName === "Inbox") {
        continue;
      }
      const project = loadedProjects[projectName];
      const newProject = document.createElement('div');
      newProject.classList.add("project-item");
      const pElem = document.createElement('p');
      pElem.textContent = Utils.editEachWord(project.name, false);
      newProject.append(pElem);
      currentProjects.append(newProject);
    }

    const plus = document.createElement('i');
    plus.classList.add('fa-solid', 'fa-plus');

    const text = document.createElement('p');
    text.textContent = "Add Project";

    addNewProject.append(plus, text);
    currentProjects.append(addNewProject);
    sidebar.append(currentProjects);

    return sidebar;
  }

  static loadContent(project=null) {
    // dom element
    let mainContent;

    let loadedProjects = Store.getProjects();

    if (!project) {
      mainContent = document.createElement('div');
      mainContent.classList.add('todos');
      project = "Inbox";

      if (!loadedProjects || !loadedProjects[project]) {
        console.log("Project inbox not found, creating default...")
        const defaultProject = new Project(project);
        Store.addProject(defaultProject);

        loadedProjects = Store.getProjects();
      }
    } else {
      // Propagate up to parent in case child element was clicked (font instead of project-item for example)
      let currProjectTarget = project.target;
      while (currProjectTarget !== this) {
        currProjectTarget = currProjectTarget.parentElement;
      }

      // for case of event listeners with an event as the parameter
      mainContent = document.querySelector(".todos");
      mainContent.innerHTML = "";
      project = currProjectTarget.querySelector('p').textContent;
    }

    const projToRender = loadedProjects[project];

    if (projToRender === null || projToRender === undefined) {
      console.log("Error in rendering project!");
      return;
    }

    const tasks = projToRender.activeTasks;

    // todo style better later
    const projectPage = document.createElement('div');
    projectPage.classList.add("project-content", project.replace(/\s+/g, '-'));
    projectPage.style.display = "flex";

    const header = document.createElement('h1');
    header.textContent = Utils.editEachWord(project, false);
    if (tasks !== null) {
      tasks.forEach(task => {
        UI.displayNewTask(projectPage, task);
      });
    }

    projectPage.prepend(header);
    mainContent.appendChild(projectPage);

    return mainContent;
  }

  static loadDropdownProjects(target) {
    const projects = Store.getProjects();
    for (const project in projects) {
      if (project === "Inbox") {
        continue;
      }
      const newOption = document.createElement('option');
      newOption.value = project;
      newOption.textContent = project;
      target.append(newOption);
     }
  }

  // ************ END LOAD SECTION **********

  // *********** EVENT LISTENERS **********

  static addEventListeners() {
    const sidebarTabs = document.querySelectorAll(".entry");
    sidebarTabs.forEach(tab => {
      if (tab.className === "entry down" && tab.id === "projects") {
        tab.addEventListener('click', UI.toggleProjectNav);
      } else {
        tab.addEventListener('click', UI.loadContent);
      }
    });

    const projectItems = document.querySelectorAll(".project-item");
    projectItems.forEach(projectItem => {
      projectItem.addEventListener('click', UI.loadContent);
    });

    const addTask = document.querySelector(".add-task");
    addTask.addEventListener('click', UI.addNewTask);

    const addProject = document.querySelector(".add-new-project");
    addProject.addEventListener('click', UI.addNewProject);

    window.addEventListener('click', (event) => {
      const modal = document.querySelector(".modal");
      if (modal && event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  static toggleProjectNav() {
    const projectEntry = document.querySelector("#projects");
    const down = projectEntry.classList.toggle("down");
    if (!down) {
      const caretUp = document.createElement('i');
      caretUp.classList.add("fa-solid", "fa-caret-up");
      const caretDown = document.querySelector(".fa-caret-down");
      projectEntry.replaceChild(caretUp, caretDown)
    } else {
      const caretDown = document.createElement('i');
      caretDown.classList.add("fa-solid", "fa-caret-down");
      const caretUp = document.querySelector(".fa-caret-up");
      projectEntry.replaceChild(caretDown, caretUp);
    }
    const showProjects = document.querySelector(".current-projects");
    showProjects.classList.toggle("show");
  }

  // *********** END EVENT LISTENERS *********

  // ********** ADD EVENTS **************

  static addNewTask() {
    let modal = document.querySelector('.modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.classList.add('modal');
      modal.style.display = "block";
    } else {
      modal.style.display = "block";
    }

    modal.innerHTML = `
      <div class="modal-title">
        <h4>Add Task</h4>
      </div>
      <div class="modal-content">
        <form action="">
          <div class="form-entry">
            <label for="task">Task</label>
            <input type="text" id="task" name="task" required>
          </div>
          <div class="form-entry">
            <label for="description">Description</label>
            <textarea id="description" name="description" cols="30" rows="4"></textarea>
          </div>
          <div class="form-entry">
            <label for="priority">Priority</label>
            <select id="priority" name="priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div class="form-entry">
            <label for="deadline">Deadline</label>
            <input type="date" value="2022-10-24" id="deadline" name="deadline" required>
          </div>
          <div class="form-entry">
            <label for="project">Project</label>
            <select id="project" name="project">
              <option value="Inbox">Inbox</option>
            </select>
          </div>
          <div class="submit-entry">
            <button>Cancel</button>
            <button>Submit</button>
          </div>
        </form>
      </div>
    `;

    document.body.append(modal);

    // Load in projects into select tab
    const dropDownElem = document.querySelector('select[id="project"]');
    UI.loadDropdownProjects(dropDownElem);

    // handle submit
    const form = modal.querySelector(".modal-content > form");
    form.addEventListener('submit', () => {
      event.preventDefault();
      const form = event.target;

      const formData = new FormData(form);
      const values = [...formData.values()];

      const task = new Task(...values);
      const taskProject = Store.getProject(task.project);

      if (taskProject === null || taskProject === undefined) {
        console.log("Missing project for task!");
        return;
      }

      Store.updateProject(taskProject, task);

      // If currently displaying said project page, then add task to DOM, otherwise will be displayed when clicked
      const projClassName = taskProject.name.replace(/\s+/g, '-');
      const currContentDOM = document.querySelector(`.project-content.${projClassName}`);
      if (currContentDOM) {
        UI.displayNewTask(currContentDOM, task);
      }
    });
  }

  static addNewProject() {
    let modal = document.querySelector('.modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.classList.add('modal');
      modal.style.display = "block";
    } else {
      modal.style.display = "block";
    }

    modal.innerHTML = `
      <div class="modal-title">
        <h4>Add Project</h4>
      </div>
      <div class="modal-content">
        <form action="">
          <div class="form-entry">
            <label for="task">Name</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="submit-entry">
            <button>Cancel</button>
            <button>Submit</button>
          </div>
        </form>
      </div>
    `;

    document.body.append(modal);

    // handle submit
    const form = modal.querySelector(".modal-content > form");
    form.addEventListener('submit', () => {
      event.preventDefault();
      const form = event.target;

      const formData = new FormData(form);
      const values = [...formData.values()];

      const project = new Project(...values);
      Store.addProject(project);

      const projectEntry = document.querySelector(".current-projects");
      UI.displayNewProject(projectEntry, project)
      });
    }

  // ********** END ADD EVENTS ***********

  // ******** DISPLAY EVENTS ************

  static displayNewProject(target, project) {
    if (target === null || target === undefined) {
      console.log("undefined target to display new project");
      return;
    }

    const newProjectTab = document.createElement('div');
    newProjectTab.classList.add('project-item');
    const pElem = document.createElement('p');
    pElem.textContent = Utils.editEachWord(project.name, false);

    newProjectTab.append(pElem);

    target.prepend(newProjectTab);

    // ensure new event listeners get added
    UI.addEventListeners();
  }

  static displayNewTask(target, task) {
    if (target === null || target === undefined) {
      console.log("Undefined target when trying to display new task");
      return;
    }

    if (target instanceof PointerEvent) {
      target = target.target;
    }

    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');
    const formattedTask = task.name.replaceAll(/\s+/g, '-');
    taskItem.innerHTML = `
      <div class="task-input">
        <input type="checkbox" id="task-item-${formattedTask}", name="task-item-${formattedTask}">
        <label for="${formattedTask}">${task.name}</label>
      </div>
      <div class="task-controllers">
        <span class="edit"><i class="fa-regular fa-pen-to-square"></i></span>
        <span class="priority"><i class="fa-solid fa-flag"></i></span>
        <span class="moveTo"><i class="fa-regular fa-circle-right"></i></span>
        <span class="delete"><i class="fa-regular fa-trash-can"></i></span>
      </div>
    `;

    target.append(taskItem);
  }

}
