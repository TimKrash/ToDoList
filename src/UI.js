import './style.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import Task from './Task';
import Project from './Project';
import Store from './Store';
import Utils from './Utils';
import { add, isEqual, isBefore, isAfter, formatISO } from 'date-fns';

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
    let sidebar = document.querySelector('div.sidebar');
    if (sidebar) {
      sidebar.innerHTML = "";
    } else {
      sidebar = document.createElement('div');
      sidebar.classList.add('sidebar');
    }

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

      // create x to delete project
      const deleteBtnDiv = document.createElement('div');
      deleteBtnDiv.classList.add("deleteBtn");

      const deleteBtn = document.createElement('i');
      deleteBtn.classList.add("fa-solid", "fa-xmark");
      deleteBtnDiv.append(deleteBtn);

      pElem.textContent = Utils.editEachWord(project.name, false);
      newProject.append(pElem, deleteBtnDiv);
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
    } else if (project instanceof PointerEvent){
      // Propagate up to parent in case child element was clicked (font instead of project-item for example)
      let currProjectTarget = project.target;
      while (currProjectTarget !== this) {
        currProjectTarget = currProjectTarget.parentElement;
      }

      // for case of event listeners with an event as the parameter
      mainContent = document.querySelector(".todos");
      mainContent.innerHTML = "";
      if (currProjectTarget.id === "inbox") {
        project = currProjectTarget.querySelector('p').textContent;
      } else {
        project = currProjectTarget.textContent;
      }
    } else {
      mainContent = document.querySelector(".todos");
      mainContent.innerHTML = "";
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
    const taskItems = document.createElement('div');
    taskItems.classList.add('task-items');
    header.textContent = Utils.editEachWord(project, false);
    if (tasks !== null) {
      taskItems.innerHTML = "";
      tasks.forEach(task => {
        UI.displayNewTask(taskItems, task);
      });
    }

    projectPage.append(header, taskItems);
    mainContent.appendChild(projectPage);

    const controllers = document.querySelectorAll(".task-controllers > span");
    controllers.forEach(controller => controller.addEventListener('click', UI.editTask))

    return mainContent;
  }

  static loadWeek() {
    let mainContent = document.querySelector(".todos");
    mainContent.innerHTML = "";

    let tasks;
    const projects = Store.getProjects();
    for (const project in projects) {
      const targetProject = projects[project];
      if (tasks !== undefined) {
        tasks = tasks.concat(targetProject.getTasks());
      } else {
        tasks = targetProject.getTasks();
      }
    }

    const weekPage = document.createElement('div');
    weekPage.classList.add("project-content", "week");
    weekPage.style.display = "flex";

    const weekHeader = document.createElement("h1");
    weekHeader.textContent = "This Week";

    weekPage.append(weekHeader);

    const taskItems = document.createElement('div');
    taskItems.classList.add("task-items");
    tasks.forEach(task => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAfterToday = add(today, {
        years: 0,
        months: 0,
        weeks: 1,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });

      const taskDeadline = new Date(Date.parse(task.deadline));
      taskDeadline.setHours(0, 0, 0, 0);

      if (isBefore(taskDeadline, weekAfterToday) &&
      (isAfter(taskDeadline, today) || isEqual(taskDeadline, today))) {
        UI.displayNewTask(taskItems, task);
      }

    });

    weekPage.append(taskItems);
    mainContent.append(weekPage);

    const controllers = document.querySelectorAll('.task-controllers > span');
    controllers.forEach(controller => controller.addEventListener('click', UI.editTask))
  }

  static loadToday() {
    let mainContent = document.querySelector(".todos");
    mainContent.innerHTML = "";

    let tasks;
    const projects = Store.getProjects();
    for (const project in projects) {
      const targetProject = projects[project];
      if (tasks !== undefined) {
        tasks = tasks.concat(targetProject.getTasks());
      } else {
        tasks = targetProject.getTasks();
      }
    }

    const todayPage = document.createElement('div');
    todayPage.classList.add("project-content", "today");
    todayPage.style.display = "flex";

    const todayHeader = document.createElement("h1");
    todayHeader.textContent = "Today";

    todayPage.append(todayHeader);

    const taskItems = document.createElement('div');
    taskItems.classList.add("task-items");
    tasks.forEach(task => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const taskDeadline = new Date(Date.parse(task.deadline));
      taskDeadline.setHours(0, 0, 0, 0);

      if (isEqual(today, taskDeadline)) {
        UI.displayNewTask(taskItems, task);
      }
    })

    todayPage.append(taskItems);
    mainContent.append(todayPage);

    const controllers = document.querySelectorAll('.task-controllers > span');
    controllers.forEach(controller => controller.addEventListener('click', UI.editTask))
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
      } else if (tab.id == "today") {
        tab.addEventListener('click', UI.loadToday);
      } else if (tab.id == "week") {
        tab.addEventListener('click', UI.loadWeek);
      } else {
        tab.addEventListener('click', UI.loadContent);
      }
    });

    const projectItems = document.querySelectorAll(".project-item > p");
    projectItems.forEach(projectItem => {
      projectItem.addEventListener('click', UI.loadContent);
    });

    const deletes = document.querySelectorAll(".project-item > .deleteBtn");
    deletes.forEach(deleteBtn => deleteBtn.addEventListener('click', UI.removeProject));

    const addTask = document.querySelector(".add-task");
    addTask.addEventListener('click', UI.addNewTask);

    const addProject = document.querySelector(".add-new-project");
    addProject.addEventListener('click', UI.addNewProject);

    const taskEditors = document.querySelectorAll(".task-controllers > span");
    taskEditors.forEach(taskEditor => taskEditor.addEventListener('click', UI.editTask));

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

  static addNewTask(task=null) {
    let modal = document.querySelector('.modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.classList.add('modal');
      modal.style.display = "block";
    } else {
      modal.style.display = "block";
    }

    console.log(task.project);
    const projectContent = document.querySelector(".project-content > h1");
    const projectName = (task && !(task instanceof PointerEvent)) ? task.project : projectContent.textContent;
    modal.innerHTML = `
      <div class="modal-title">
        <h4>Add Task</h4>
      </div>
      <div class="modal-content">
        <form action="">
          <div class="form-entry">
            <label for="task">Task</label>
            <input type="text" id="task" name="task" value="${(task && !(task instanceof PointerEvent)) ? task.name : ""}" required>
          </div>
          <div class="form-entry">
            <label for="description">Description</label>
            <textarea id="description" name="description" cols="30" rows="4"}>${(task && !(task instanceof PointerEvent)) ? task.description : ""}</textarea>
          </div>
          <div class="form-entry">
            <label for="priority">Priority</label>
            <select id="priority" name="priority">
              <option value="low" ${(task && !(task instanceof PointerEvent) && task.priority === "low") && "selected" }>Low</option>
              <option value="medium" ${(task && !(task instanceof PointerEvent) && task.priority === "medium") && "selected"}>Medium</option>
              <option value="high" ${(task && !(task instanceof PointerEvent)) && task.priority === "high" && "selected"}>wHigh</option>
            </select>
          </div>
          <div class="form-entry">
            <label for="deadline">Deadline</label>
            <input type="date" id="deadline" name="deadline" value="${(task && !(task instanceof PointerEvent)) ? task.deadline : formatISO(new Date(), { representation: 'date' })}" required>
          </div>
          <div class="form-entry">
            <label for="project">Project</label>
            <select id="project" name="project">
              <option value="${projectName}">${projectName}</option>
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

      const newTask = new Task(...values);
      const taskProject = Store.getProject(newTask.project);

      if (taskProject === null || taskProject === undefined) {
        console.log("Missing project for task!");
        return;
      }

      if (task && !(task instanceof PointerEvent)) {
        Store.updateProject(taskProject, newTask, task);
      } else {
        Store.updateProject(taskProject, newTask);
      }

      // If currently displaying said project page, then add task to DOM, otherwise will be displayed when clicked
      const projClassName = taskProject.name.replace(/\s+/g, '-');
      const currContentDOM = document.querySelector(`.project-content.${projClassName} > .task-items`);
      if ((!task || task instanceof PointerEvent) && currContentDOM) {
        UI.displayNewTask(currContentDOM, newTask);
      } else if (task && !(task instanceof PointerEvent) && currContentDOM) {
        UI.changeCurrentTask(currContentDOM, task, newTask);
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
    const deleteBtnDiv = document.createElement('div');
    deleteBtnDiv.classList.add("deleteBtn");

    const deleteBtn = document.createElement('i');
    deleteBtn.classList.add("fa-solid", "fa-xmark");
    deleteBtnDiv.append(deleteBtn);

    pElem.textContent = Utils.editEachWord(project.name, false);

    newProjectTab.append(pElem, deleteBtnDiv);

    target.prepend(newProjectTab);

    // ensure new event listeners get added
    UI.addEventListeners();
  }

  static displayNewTask(target, task) {
    if (task.name === null || task.name === undefined) {
      return;
    }

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
        <span class="delete"><i class="fa-regular fa-trash-can"></i></span>
      </div>
    `;

    target.append(taskItem);

    const controllers = document.querySelectorAll('.task-controllers > span');
    controllers.forEach(controller => controller.addEventListener('click', UI.editTask))
 }

  static changeCurrentTask(target, task, newTask) {
    if (target === null || target === undefined) {
      console.log("undefined target when trying to edit existing task")
      return;
    }

    const formattedOldTask = task.name.replaceAll(/\s+/g, '-');

    const taskItem = target.querySelector(`.task-item > .task-input > label[for=${formattedOldTask}]`);
    if (taskItem === null || taskItem === undefined) {
      console.log("Can't find task item associated with task" + task.name);
      return;
    }

    const targetItem = taskItem.parentElement.parentElement;

    const formattedTask = newTask.name.replaceAll(/\s+/g, '-');
    targetItem.innerHTML = `
      <div class="task-input">
        <input type="checkbox" id="task-item-${formattedTask}", name="task-item-${formattedTask}">
        <label for="${formattedTask}">${newTask.name}</label>
      </div>
      <div class="task-controllers">
        <span class="edit"><i class="fa-regular fa-pen-to-square"></i></span>
        <span class="delete"><i class="fa-regular fa-trash-can"></i></span>
      </div>
    `;

    const controllers = document.querySelectorAll('.task-controllers > span');
    controllers.forEach(controller => controller.addEventListener('click', UI.editTask))
  }

  // ****** END DISPLAY EVENTS ******

  // ******* EDIT EVENTS ********

  static editTask(event) {
    let target = event.target;
    while (target !== this) {
      target = target.parentElement;
    }

    const projectName = document.querySelector(".project-content > h1").textContent;
    const taskName = Utils.removeDashes(target.parentElement.previousElementSibling.querySelector("label").htmlFor);
    let project;
    if (projectName === "Today" || projectName === "This Week") {
      const projects = Store.getProjects();
      for (const currProject in projects) {
        const targetProj = projects[currProject];
        const targetTasks = targetProj.getTasks();

        targetTasks.forEach(task => {
          if (task.name === taskName) {
            project = targetProj;
          }
        })
      }
    } else {
      project = Store.getProject(projectName);
    }

    switch (target.className) {
      case "edit":
        const task = project.getTask(taskName);
        if (task) {
          UI.addNewTask(project.getTask(taskName));
        } else {
          console.log("Can't find task associated with project!")
          return;
        }
        break;
      case "delete":
        Store.removeTask(project.name, taskName);
        break;
    }

    UI.loadContent(project.name);
  }

  // ******* END EDIT EVENTS *******

  static removeProject(event) {
    let target = event.target;
    while (target !== this) {
      target = target.parentElement;
    }
    const projectName = target.previousElementSibling.textContent;

    if (!projectName) {
      console.log("Error finding project while trying to delete");
      return;
    }

    Store.removeProject(projectName);

    // Check what page you're on to reload properly
    const currContent = document.querySelector(".project-content > h1").textContent;
    if (currContent === projectName) {
      UI.loadContent();
    }

    const projects = Store.getProjects();
    const rootElem = document.querySelector(".root");
    const sidebar = UI.loadSidebar(projects);
    rootElem.append(sidebar);
    UI.addEventListeners();
  }
}
