import './style.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

export default class UI {
  static loadPage() {
    UI.loadFrames();
  }

  static loadFrames() {
    const root = document.querySelector(".root");
    root.append(
      UI.createHeader(),
      UI.createSidebar(),
      UI.createTodos()
    );

    UI.addEventListeners();
    UI.renderContent();
  }

  static addEventListeners() {
    const pages = document.querySelectorAll(".entry");
    pages.forEach(page => {
      page.addEventListener('click', UI.renderContent);
    });

    const addTask = document.querySelector(".add-task");
    addTask.addEventListener('click', UI.createNewTask);
  }

  static createNewTask() {
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
            <input type="text" id="task">
            <label for="task">Task</label>
          </div>
        </form>
      </div>
    `;

    modal.addEventListener('click', () => modal.style.display = "none");
    document.body.append(modal);
  }

  static renderContent(event=null) {
    let target;
    if (event) {
      target = event.target;
      while (target !== this) {
        target = target.parentElement;
      }
    } else {
      target = document.querySelector(".entry#inbox");
    }
    const todo = UI.getTodos();
    const page = target.id;

    todo.innerHTML = "";
    todo.innerHTML = `
      <div class="${page}" style="display: flex;">
        <h1>${page.charAt(0).toUpperCase() + page.slice(1)}</h1>
      </div>
    `;
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
      <div class="entry" id="projects">
        <i class="fa-solid fa-list-check"></i>
        <p>Projects</p>
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
