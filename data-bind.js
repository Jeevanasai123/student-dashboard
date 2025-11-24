let studentsData = [];

async function loadStudents() {
  try {
    const res = await fetch("data.json", { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Failed to load JSON");
    }

    const json = await res.json();
    studentsData = json.students || [];
  } catch (err) {
    console.error("[Error loading JSON]", err);

    // fallback if fetch fails
    studentsData = [
      { name: "Alice", email: "alice@example.com", phone: "1234567890", status: "Present" },
      { name: "Bob", email: "bob@example.com", phone: "9876543210", status: "Absent" },
      { name: "Charlie", email: "charlie@example.com", phone: "5555555555", status: "Present" }
    ];
  }

  renderDashboard();
}

function renderDashboard() {
  const total = studentsData.length;
  const present = studentsData.filter(s => s.status === "Present").length;
  const absent = studentsData.filter(s => s.status === "Absent").length;

  document.getElementById("kpi-students").innerText = total;
  document.getElementById("kpi-present").innerText = present;
  document.getElementById("kpi-absent").innerText = absent;

  // Chart
  if (window.attendanceChart) {
    window.attendanceChart.data.datasets[0].data = [present, absent];
    window.attendanceChart.update();
  } else {
    const ctx = document.getElementById("attendanceChart").getContext("2d");
    window.attendanceChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Present", "Absent"],
        datasets: [
          {
            data: [present, absent],
            backgroundColor: ["#28a745", "#ffc107"]
          }
        ]
      },
      options: { plugins: { legend: { position: "bottom" } } }
    });
  }

  // Table
  const tbody = document.querySelector("#students-table tbody");
  tbody.innerHTML = "";

  studentsData.forEach((s, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td><span class="badge ${s.status === "Present" ? "bg-success" : "bg-warning"}">${s.status}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary toggle-status" data-index="${i}">Toggle</button>
        <button class="btn btn-sm btn-danger delete-student" data-index="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".toggle-status").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = e.target.dataset.index;
      studentsData[i].status = studentsData[i].status === "Present" ? "Absent" : "Present";
      renderDashboard();
    });
  });

  document.querySelectorAll(".delete-student").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = e.target.dataset.index;
      studentsData.splice(i, 1);
      renderDashboard();
    });
  });
}

document.addEventListener("DOMContentLoaded", loadStudents);
