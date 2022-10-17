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
      UI.createTodos(),
      UI.createFooter()
    );
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
        <div class="menu"><i class="fa-solid fa-bars fa-3x"></i></div>
      </div>
      `;
    return header;
  }

  static createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.classList.add('sidebar');

    sidebar.textContent = "Sidebar";
    return sidebar;
  }

  static createTodos() {
    const todos = document.createElement('div');
    todos.classList.add('todos');

    todos.textContent = "Todos";
    return todos;
  }

  static createFooter() {
    const footer = document.createElement('div');
    footer.classList.add('footer');

    footer.textContent = "Footer";
    return footer;
  }
}
