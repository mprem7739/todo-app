const KEY = "tasks";
let filter = "all";

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(data)) return [];
    return data.filter(t => t && typeof t.text === "string")
      .map(t => ({ id: Number(t.id) || Date.now() + Math.random(), text: t.text, done: !!t.done }));
  } catch (e) { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {}
}

let tasks = load();

const list = document.getElementById("list");
const form = document.getElementById("form");
const input = document.getElementById("text");
const countEl = document.getElementById("count");
const clearBtn = document.getElementById("clear");

function render() {
  list.textContent = "";
  const shown = tasks.filter(t =>
    filter === "all" || (filter === "active" ? !t.done : t.done));

  if (!shown.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = tasks.length ? "Nothing in this view." : "No tasks yet. Add your first one above.";
    list.append(li);
  }

  shown.forEach(t => {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    if (t.done) li.className = "done";

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = t.done;
    box.dataset.action = "toggle";
    box.setAttribute("aria-label", "Mark “" + t.text + "” as done");

    const label = document.createElement("span");
    label.textContent = t.text; // textContent keeps user text from running as HTML

    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "Delete";
    del.dataset.action = "delete";

    li.append(box, label, del);
    list.append(li);
  });

  const left = tasks.filter(t => !t.done).length;
  countEl.textContent = left + (left === 1 ? " task left" : " tasks left");
  clearBtn.hidden = !tasks.some(t => t.done);

  document.querySelectorAll("[data-filter]").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  tasks.push({ id: Date.now(), text, done: false });
  input.value = "";
  save(); render();
});

list.addEventListener("click", e => {
  const action = e.target.dataset.action;
  if (!action) return;
  const id = Number(e.target.closest("li").dataset.id);
  if (action === "delete") tasks = tasks.filter(t => t.id !== id);
  if (action === "toggle") tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  save(); render();
});

document.querySelector(".filters").addEventListener("click", e => {
  const f = e.target.dataset.filter;
  if (!f) return;
  filter = f; render();
});

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  save(); render();
});

render();
