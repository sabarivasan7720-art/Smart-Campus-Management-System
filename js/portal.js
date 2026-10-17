(function portal() {
  const DEMO_KEY = "etc-portal-user";
  const TASKS_KEY = "excel-portal-tasks:";
  const loginView = document.getElementById("login-view");
  const dashView = document.getElementById("dash-view");
  const form = document.getElementById("login-form");
  const who = document.getElementById("who");
  const logout = document.getElementById("logout");
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const taskFeedback = document.getElementById("task-feedback");
  const pendingTaskCount = document.getElementById("pending-task-count");
  const routeOrigin = document.getElementById("route-origin");
  const routeDestination = document.getElementById("route-destination");
  const routeTitle = document.getElementById("portal-route-title");
  const routeMeta = document.getElementById("portal-route-meta");
  const routeSteps = document.getElementById("portal-route-steps");
  const semesterSelect = document.getElementById("marksheet-semester");
  const marksheetRows = document.getElementById("marksheet-rows");
  const marksBySemester = {
    1: [
      { subject: "Engineering Mathematics I", marks: 86, credits: 4 },
      { subject: "Engineering Physics", marks: 78, credits: 3 },
      { subject: "Programming in C", marks: 91, credits: 4 },
      { subject: "Engineering Graphics", marks: 74, credits: 3 },
      { subject: "Communication Skills", marks: 82, credits: 2 },
    ],
    2: [
      { subject: "Engineering Mathematics II", marks: 81, credits: 4 },
      { subject: "Applied Chemistry", marks: 72, credits: 3 },
      { subject: "Data Structures", marks: 88, credits: 4 },
      { subject: "Digital Logic", marks: 69, credits: 3 },
      { subject: "Professional English", marks: 93, credits: 2 },
    ],
  };
  let sortKey = "subject";
  let sortDirection = 1;
  let currentUser = "";
  let campusMapPromise = null;

  function fillLocationSelect(select, locations, placeholder) {
    if (placeholder) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = placeholder;
      option.disabled = true;
      option.selected = true;
      select.append(option);
    }
    locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location.id;
      option.textContent = `${location.number}. ${location.name}`;
      select.append(option);
    });
  }

  function renderDirections(route, location) {
    routeDestination.value = location.id;
    routeTitle.textContent = `${route.origin.name} to ${location.name}`;
    routeMeta.textContent = route.minutes ? `About ${route.minutes} min walk` : "You are already at this location.";
    routeSteps.replaceChildren(...route.steps.map((step, index) => {
      const item = document.createElement("li");
      item.className = "flex gap-3";
      const number = document.createElement("span");
      number.className = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold";
      number.textContent = String(index + 1);
      const text = document.createElement("span");
      text.className = "text-slate-700";
      text.textContent = step;
      item.append(number, text);
      return item;
    }));
  }

  function initializeCampusMap() {
    if (campusMapPromise) {
      campusMapPromise.then(() => CampusMap.invalidateSize());
      return;
    }
    campusMapPromise = CampusData.load().then((campus) => {
      fillLocationSelect(routeOrigin, campus.locations);
      fillLocationSelect(routeDestination, campus.locations, "Choose a destination");
      routeOrigin.value = campus.map.defaultOrigin;
      CampusMap.init("portal-map", campus, { originId: routeOrigin.value });
      CampusMap.onNavigate(renderDirections);
      routeOrigin.addEventListener("change", () => CampusMap.setOrigin(routeOrigin.value));
      routeDestination.addEventListener("change", () => {
        if (routeDestination.value) CampusMap.navigateTo(routeDestination.value);
      });
      requestAnimationFrame(() => CampusMap.invalidateSize());
    }).catch(() => {
      routeMeta.textContent = "The campus map could not be loaded. Refresh the page and try again.";
      campusMapPromise = null;
    });
  }

  function taskStorageKey() {
    return `${TASKS_KEY}${encodeURIComponent(currentUser.trim().toLowerCase())}`;
  }

  function getTasks() {
    if (!currentUser) return [];
    try {
      const saved = JSON.parse(localStorage.getItem(taskStorageKey()) || "[]");
      return Array.isArray(saved)
        ? saved.filter((task) => task && typeof task.id === "string" && typeof task.text === "string" && typeof task.completed === "boolean")
        : [];
    } catch {
      return [];
    }
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(taskStorageKey(), JSON.stringify(tasks));
      return true;
    } catch {
      return false;
    }
  }

  function setTaskFeedback(message, isError = false) {
    taskFeedback.textContent = message;
    taskFeedback.className = `text-sm ${isError ? "text-red-700" : "text-emerald-700"}`;
  }

  function renderTasks() {
    const tasks = getTasks();
    pendingTaskCount.textContent = String(tasks.filter((task) => !task.completed).length);
    if (!tasks.length) {
      const empty = document.createElement("li");
      empty.className = "py-3 text-sm text-slate-500";
      empty.textContent = "No tasks yet.";
      taskList.replaceChildren(empty);
      return;
    }

    taskList.replaceChildren(...tasks.map((task) => {
      const item = document.createElement("li");
      item.className = "flex items-center gap-3 py-3";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.className = "h-4 w-4 shrink-0 accent-navy";
      checkbox.setAttribute("aria-label", `${task.completed ? "Mark task pending" : "Mark task complete"}: ${task.text}`);
      const text = document.createElement("span");
      text.className = `min-w-0 flex-1 text-sm ${task.completed ? "text-slate-500 line-through" : "text-navy"}`;
      text.textContent = task.text;
      checkbox.addEventListener("change", () => {
        const updated = getTasks().map((savedTask) => savedTask.id === task.id
          ? { ...savedTask, completed: checkbox.checked }
          : savedTask);
        if (!saveTasks(updated)) {
          checkbox.checked = task.completed;
          setTaskFeedback("Could not save this task. Check your browser storage settings and try again.", true);
          return;
        }
        setTaskFeedback(checkbox.checked ? "Task marked complete." : "Task moved back to pending.");
        renderTasks();
      });
      item.append(checkbox, text);
      return item;
    }));
  }

  function gradeFor(marks) {
    if (marks >= 90) return { grade: "O", points: 10 };
    if (marks >= 80) return { grade: "A+", points: 9 };
    if (marks >= 70) return { grade: "A", points: 8 };
    if (marks >= 60) return { grade: "B+", points: 7 };
    if (marks >= 50) return { grade: "B", points: 6 };
    if (marks >= 40) return { grade: "C", points: 5 };
    return { grade: "F", points: 0 };
  }

  function renderMarksheet() {
    if (!semesterSelect || !marksheetRows) return;
    const subjects = marksBySemester[semesterSelect.value] || [];
    const ordered = [...subjects].sort((a, b) => {
      const left = sortKey === "marks" ? a.marks : sortKey === "grade" ? gradeFor(a.marks).points : a.subject;
      const right = sortKey === "marks" ? b.marks : sortKey === "grade" ? gradeFor(b.marks).points : b.subject;
      return (typeof left === "string" ? left.localeCompare(right) : left - right) * sortDirection;
    });
    const totalMarks = subjects.reduce((sum, subject) => sum + subject.marks, 0);
    const maxMarks = subjects.length * 100;
    const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
    const weightedPoints = subjects.reduce((sum, subject) => sum + gradeFor(subject.marks).points * subject.credits, 0);
    const sgpa = totalCredits ? (weightedPoints / totalCredits).toFixed(2) : "0.00";
    const passed = subjects.every((subject) => subject.marks >= 40);

    document.getElementById("marks-total").textContent = `${totalMarks} / ${maxMarks}`;
    document.getElementById("marks-percentage").textContent = `${((totalMarks / maxMarks) * 100).toFixed(1)}%`;
    document.getElementById("marks-result").textContent = `${sgpa} · ${passed ? "Pass" : "Needs improvement"}`;
    marksheetRows.innerHTML = ordered.map((subject) => {
      const grade = gradeFor(subject.marks).grade;
      const result = subject.marks >= 40 ? "Pass" : "Fail";
      return `<tr class="border-t border-slate-100">
        <th scope="row" class="px-4 py-3 font-semibold">${subject.subject}</th>
        <td class="px-4 py-3">${subject.marks} / 100</td>
        <td class="px-4 py-3">${subject.credits}</td>
        <td class="px-4 py-3 font-semibold">${grade}</td>
        <td class="px-4 py-3">${result}</td>
      </tr>`;
    }).join("");
  }

  semesterSelect?.addEventListener("change", renderMarksheet);
  document.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextKey = button.dataset.sort;
      sortDirection = sortKey === nextKey ? -sortDirection : 1;
      sortKey = nextKey;
      document.querySelectorAll("[data-sort]").forEach((item) => {
        item.closest("th").setAttribute("aria-sort", item === button ? (sortDirection === 1 ? "ascending" : "descending") : "none");
      });
      renderMarksheet();
    });
  });
  renderMarksheet();

  function showDash(user) {
    loginView.classList.add("hidden");
    dashView.classList.remove("hidden");
    who.textContent = user;
    currentUser = user;
    taskForm?.reset();
    setTaskFeedback("");
    renderTasks();
    initializeCampusMap();
  }

  const existing = sessionStorage.getItem(DEMO_KEY);
  if (existing) showDash(existing);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("student-id").value.trim();
    const pw = document.getElementById("password").value;
    if (!id || !pw) return;
    sessionStorage.setItem(DEMO_KEY, id);
    showDash(id);
  });

  taskInput?.addEventListener("input", () => {
    const trimmedLength = taskInput.value.trim().length;
    taskInput.setCustomValidity(taskInput.value.length > 0 && trimmedLength < 3
      ? "Enter at least 3 non-space characters."
      : "");
  });

  taskForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    taskInput.setCustomValidity(text.length < 3 ? "Enter at least 3 non-space characters." : "");
    if (!taskForm.reportValidity()) return;

    const task = {
      id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      completed: false,
    };
    if (!saveTasks([task, ...getTasks()])) {
      setTaskFeedback("Could not save this task. Check your browser storage settings and try again.", true);
      return;
    }
    taskForm.reset();
    taskInput.setCustomValidity("");
    setTaskFeedback("Task added.");
    renderTasks();
  });

  logout?.addEventListener("click", () => {
    sessionStorage.removeItem(DEMO_KEY);
    dashView.classList.add("hidden");
    loginView.classList.remove("hidden");
    form.reset();
  });
})();
