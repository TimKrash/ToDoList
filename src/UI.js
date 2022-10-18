import './style.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import Task from './Task';
import Project from './Project';
import Store from './Store';

export default class UI {
  static loadPage() {
    UI.loadFrames();
  }

  static loadFrames() {
    const root = document.querySelector(".root");
    let header = UI.createHeader();
    let sidebar = UI.createSidebar();
    let todos = UI.createTodos();

    root.append(
      header,
      sidebar,
      todos
    );

    UI.addEventListeners();
    UI.loadProjects(sidebar);
    UI.renderContent();
    // todo remove
    UI.createNewTask();
  }

  static loadProjects(sidebar) {
    const loadedProjects = Store.getProjects();

    if (loadedProjects != null) {
      const newProject = document.createElement('div');
      newProject.classList.add('project-item');
      console.log(loadedProjects);
    }
  }

  static addEventListeners() {
    const pages = document.querySelectorAll(".entry");
    pages.forEach(page => {
      page.addEventListener('click', UI.renderContent);
    });

    const addTask = document.querySelector(".add-task");
    addTask.addEventListener('click', UI.createNewTask);

    window.addEventListener('click', (event) => {
      const modal = document.querySelector(".modal");
      if (modal && event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  static createNewTask() {
    let modal = document.querySelector('.modal');
    if (!modal) {
      console.log("hi");
      modal = document.createElement('div');
      modal.classList.add('modal');
      modal.style.display = "block";
    } else {
      console.log("hello");
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
              <option value="inbox">Inbox</option>
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
    // handle submit
    const form = modal.querySelector(".modal-content > form");
    form.addEventListener('submit', UI.handleTaskSubmit);
  }

  static handleTaskSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const formData = new FormData(form);
    const values = [...formData.values()];

    const task = new Task(...values);
  }

  static handleProjectSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const formData = new FormData(form);
    const values = [...formData.values()];

    const project = new Project(...values);
    Store.addProject(project);
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
    form.addEventListener('submit', UI.handleProjectSubmit);
  }

  static renderContent(event=null, tasks=null) {
    let target;
    if (event) {
      target = event.target;
      while (target !== this) {
        target = target.parentElement;
      }
    } else {
      target = document.querySelector(".entry#inbox");
    }

    if (target.id === "projects") {
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

      showProjects.addEventListener('click', UI.addNewProject);
    }

    const todo = UI.getTodos();
    const page = target.id;

    todo.innerHTML = "";
    const projectPage = document.createElement('div');
    projectPage.classList.add(page);
    projectPage.style.display = "flex";

    const header = document.createElement('h1');
    header.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    const list = document.createElement('ul');
    if (tasks !== null) {
      tasks.forEach(task => {
        const newList = document.createElement('li');
        newList.textContent = task.name;
        list.appendChild(newList);
      });
    }

    projectPage.appendChild(header);
    projectPage.appendChild(list);
    todo.appendChild(projectPage);
  }

  static createHeader() {
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

  static createSidebar() {
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
      <div class="current-projects">
        <div class="add-new-project">
          <i class="fa-solid fa-plus"></i>
          <p>Add Project</p>
        </div>
      </div>
    `

    return sidebar;
  }

  static createTodos() {
    const todos = document.createElement('div');
    todos.classList.add('todos');

    return todos;
  }

  static getTodos() {
    const todo = document.querySelector(".todos");
    return todo;
  }

  static createFooter() {
    const footer = document.createElement('div');
    footer.classList.add('footer');

    footer.textContent = "Footer";
    return footer;
  }
}
