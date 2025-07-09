// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBS6uwZXhh2nVMaVtiyxDnI93VbbhjDoy0",
  authDomain: "datadefectd29d-a8b38.firebaseapp.com",
  databaseURL: "https://datadefectd29d-a8b38-default-rtdb.firebaseio.com",
  projectId: "datadefectd29d-a8b38",
  storageBucket: "datadefectd29d-a8b38.appspot.com",
  messagingSenderId: "713752004677",
  appId: "1:713752004677:web:2e819fe45b63d7ae50fb2c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Data Storage
let vinData = [];
let editingId = null;
const defectList = document.getElementById("defectList");
const vinCollection = db.collection("vinData");

// DOM Elements
const addDefectBtn = document.getElementById("addDefectBtn");
const zeroDefectBtn = document.getElementById("zeroDefectBtn");
const exportBtn = document.getElementById("exportBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const vinForm = document.getElementById("vinForm");

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Register Chart plugins
  if (typeof Chart !== 'undefined' && Chart.register) {
    Chart.register(ChartDataLabels);
  }
  
  // Set default date
  document.getElementById("vinDate").value = new Date().toISOString().split("T")[0];
  
  // Add first defect entry
  addDefectEntry();
  
  // Set up real-time listener
  setupRealtimeListener();
  
  // Event Listeners
  addDefectBtn.addEventListener('click', addDefectEntry);
  zeroDefectBtn.addEventListener('click', saveZeroDefect);
  exportBtn.addEventListener('click', exportToExcel);
  deleteAllBtn.addEventListener('click', confirmDeleteAll);
  vinForm.addEventListener('submit', handleFormSubmit);
});

// Real-time listener function
function setupRealtimeListener() {
  vinCollection.orderBy("date", "desc").onSnapshot((snapshot) => {
    vinData = [];
    snapshot.forEach(doc => {
      vinData.push({ id: doc.id, ...doc.data() });
    });
    renderTable();
    renderChart();
    renderParetoChart(vinData);
  }, (error) => {
    console.error("Error listening to data changes: ", error);
  });
}

// Fungsi Tambah Defect
function addDefectEntry(defect = {}) {
  const div = document.createElement("div");
  div.className = "defect-entry";
  div.innerHTML = `
    <label>Kategori Defect:</label>
    <select class="category" required>
      <option value="">-- Pilih Kategori --</option>
      <option ${defect.category === 'Function' ? 'selected' : ''}>Function</option>
      <option ${defect.category === 'Body Fitting' ? 'selected' : ''}>Body Fitting</option>
      <option ${defect.category === 'Appearance' ? 'selected' : ''}>Appearance</option>
    </select>

    <label>Area Defect:</label>
    <select class="area" required>
      <option value="">-- Pilih Area --</option>
      <option ${defect.area === 'Fr door outer Rh' ? 'selected' : ''}>Fr door outer Rh</option>
      <option ${defect.area === 'Fr door inner & opening Rh' ? 'selected' : ''}>Fr door inner & opening Rh</option>
      <option ${defect.area === 'Rr door outer Rh' ? 'selected' : ''}>Rr door outer Rh</option>
      <option ${defect.area === 'Rr door inner & opening Rh' ? 'selected' : ''}>Rr door inner & opening Rh</option>
      <option ${defect.area === 'Fr door outer Lh' ? 'selected' : ''}>Fr door outer Lh</option>
      <option ${defect.area === 'Fr door inner & opening Lh' ? 'selected' : ''}>Fr door inner & opening Lh</option>
      <option ${defect.area === 'Rr door outer Lh' ? 'selected' : ''}>Rr door outer Lh</option>
      <option ${defect.area === 'Rr door inner & opening Lh' ? 'selected' : ''}>Rr door inner & opening Lh</option>
      <option ${defect.area === 'Engine room Rh' ? 'selected' : ''}>Engine room Rh</option>
      <option ${defect.area === 'Engine room Lh' ? 'selected' : ''}>Engine room Lh</option>
      <option ${defect.area === 'Engine front' ? 'selected' : ''}>Engine front</option>
      <option ${defect.area === 'Engine hood outer' ? 'selected' : ''}>Engine hood outer</option>
      <option ${defect.area === 'Engine hood inner' ? 'selected' : ''}>Engine hood inner</option>
      <option ${defect.area === 'Back door outer' ? 'selected' : ''}>Back door outer</option>
      <option ${defect.area === 'Back door inner & opening' ? 'selected' : ''}>Back door inner & opening</option>
      <option ${defect.area === 'Inner cabin Rh' ? 'selected' : ''}>Inner cabin Rh</option>
      <option ${defect.area === 'Inner cabin Lh' ? 'selected' : ''}>Inner cabin Lh</option>
      <option ${defect.area === 'Roof' ? 'selected' : ''}>Roof</option>
      <option ${defect.area === 'Fuel lid inner & opening' ? 'selected' : ''}>Fuel lid inner & opening</option>
      <option ${defect.area === 'Under Body' ? 'selected' : ''}>Under Body</option>
    </select>

    <label>Deskripsi Defect:</label>
    <textarea class="description" required placeholder="Deskripsi defect...">${defect.description || ""}</textarea>

    <label>Heavy Repair:</label>
    <select class="heavy-repair">
      <option value="Tidak" ${defect.heavyRepair === 'Tidak' ? 'selected' : ''}>Tidak</option>
      <option value="Ya" ${defect.heavyRepair === 'Ya' ? 'selected' : ''}>Ya</option>
    </select>

    <label>PIC Shop:</label>
    <select class="pic" required>
      <option value="">-- Pilih PIC --</option>
      <option ${defect.pic === 'Welding' ? 'selected' : ''}>Welding</option>
      <option ${defect.pic === 'Tosso' ? 'selected' : ''}>Tosso</option>
      <option ${defect.pic === 'Assy' ? 'selected' : ''}>Assy</option>
      <option ${defect.pic === 'QSS' ? 'selected' : ''}>QSS</option>
      <option ${defect.pic === 'Plant 1' ? 'selected' : ''}>Plant 1</option>
    </select>

    <button type="button" class="btn-danger remove-defect">
      <i class="fas fa-trash"></i> Hapus Defect
    </button>
  `;

  div.querySelector('.remove-defect').addEventListener('click', function() {
    div.remove();
  });

  defectList.appendChild(div);
}

// Fungsi Zero Defect
async function saveZeroDefect() {
  const date = document.getElementById("vinDate").value;
  const vin = document.getElementById("vin").value;
  
  if (!date || !vin) {
    alert("Tanggal dan VIN harus diisi!");
    return;
  }
  
  const newEntry = { 
    date, 
    vin, 
    defects: [{
      category: "Zero Defect",
      area: "N/A",
      description: "Unit dinyatakan tidak memiliki defect",
      pic: "N/A",
      heavyRepair: "Tidak"
    }],
    isZeroDefect: true,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    if (editingId !== null) {
      await vinCollection.doc(editingId).update(newEntry);
      editingId = null;
    } else {
      await vinCollection.add(newEntry);
    }
    
    document.getElementById("vinForm").reset();
    document.getElementById("vinDate").value = new Date().toISOString().split("T")[0];
    defectList.innerHTML = "";
    
    alert("Data Zero Defect berhasil disimpan!");
  } catch (error) {
    console.error("Error saving zero defect: ", error);
    alert("Gagal menyimpan data Zero Defect!");
  }
}

// Fungsi Render Tabel
function renderTable() {
  const tbody = document.querySelector("#vinTable tbody");
  tbody.innerHTML = "";
  
  vinData.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.vin}</td>
      <td>
        ${entry.isZeroDefect ? 
          '<span class="badge badge-success">Zero Defect</span>' : 
          `<ul class="defect-items">
            ${entry.defects.map(d => `
              <li class="${d.heavyRepair === 'Ya' ? 'defect-heavy' : ''}">
                <strong>${d.category}</strong> - ${d.area}, ${d.description} (PIC: ${d.pic})
                ${d.heavyRepair === 'Ya' ? '<span class="heavy-repair-tag">HEAVY REPAIR</span>' : ''}
              </li>
            `).join("")}
          </ul>`
        }
      </td>
      <td>
        <div class="action-buttons">
          <button data-id="${entry.id}" class="btn-primary edit-btn">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button data-id="${entry.id}" class="btn-danger delete-btn">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Add event listeners for edit/delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      editVIN(this.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      deleteVIN(this.getAttribute('data-id'));
    });
  });
}

// Fungsi Edit Data
function editVIN(id) {
  const entry = vinData.find(item => item.id === id);
  if (!entry) return;
  
  document.getElementById("vinDate").value = entry.date;
  document.getElementById("vin").value = entry.vin;
  defectList.innerHTML = "";
  
  if (entry.isZeroDefect) {
    saveZeroDefect();
  } else {
    entry.defects.forEach(addDefectEntry);
  }
  
  editingId = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fungsi Hapus Data
async function deleteVIN(id) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    try {
      await vinCollection.doc(id).delete();
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Gagal menghapus data!");
    }
  }
}

// Fungsi Handle Form Submit
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const date = document.getElementById("vinDate").value;
  const vin = document.getElementById("vin").value;
  const defects = [];
  
  document.querySelectorAll(".defect-entry").forEach(div => {
    const defect = {
      category: div.querySelector(".category").value,
      area: div.querySelector(".area").value,
      description: div.querySelector(".description").value,
      pic: div.querySelector(".pic").value,
      heavyRepair: div.querySelector(".heavy-repair").value
    };
    
    if (defect.category && defect.area && defect.description && defect.pic) {
      defects.push(defect);
    }
  });
  
  if (defects.length === 0) {
    alert("Harap tambahkan minimal 1 defect!");
    return;
  }
  
  const newEntry = { 
    date, 
    vin, 
    defects, 
    isZeroDefect: false,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    if (editingId !== null) {
      await vinCollection.doc(editingId).update(newEntry);
      editingId = null;
    } else {
      await vinCollection.add(newEntry);
    }
    
    vinForm.reset();
    document.getElementById("vinDate").value = new Date().toISOString().split("T")[0];
    defectList.innerHTML = "";
    addDefectEntry();
  } catch (error) {
    console.error("Error saving data: ", error);
    alert("Gagal menyimpan data!");
  }
}

// Fungsi untuk konfigurasi chart
function configureChartOptions(title) {
  const isMobile = window.innerWidth <= 768;
  
  return {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false,
        text: title,
        font: {
          size: isMobile ? 16 : 18
        },
        padding: {
          bottom: 20
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'right',
        formatter: (value) => value,
        font: {
          weight: 'bold',
          size: isMobile ? 18 : 20
        },
        color: '#333'
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 12 : 13
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          font: {
            size: isMobile ? 12 : 14
          }
        },
        grid: {
          display: false
        }
      }
    }
  };
}

// Fungsi Render Chart
function renderChart() {
  const filteredData = vinData.filter(entry => !entry.isZeroDefect);

  // Destroy existing charts if they exist
  if (window.areaChart instanceof Chart) window.areaChart.destroy();
  if (window.categoryChart instanceof Chart) window.categoryChart.destroy();
  if (window.picChart instanceof Chart) window.picChart.destroy();

  // Chart Area
  const areaCounts = {};
  filteredData.forEach(v => v.defects.forEach(d => {
    if (d.area && d.area !== "N/A") areaCounts[d.area] = (areaCounts[d.area] || 0) + 1;
  }));
  
  const areaCtx = document.getElementById("defectChart").getContext('2d');
  window.areaChart = new Chart(areaCtx, {
    type: "bar",
    data: {
      labels: Object.keys(areaCounts),
      datasets: [{
        data: Object.values(areaCounts),
        backgroundColor: [
          '#4361ee', '#4cc9f0', '#9b59b6', '#f72585', 
          '#f8961e', '#2ecc71', '#e74c3c', '#3498db'
        ],
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: configureChartOptions('Defect per Area'),
  });

  // Chart Kategori
  const categoryCounts = {};
  filteredData.forEach(v => v.defects.forEach(d => {
    if (d.category && d.category !== "Zero Defect") categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  }));
  
  const categoryCtx = document.getElementById("categoryBarChart").getContext('2d');
  window.categoryChart = new Chart(categoryCtx, {
    type: "bar",
    data: {
      labels: Object.keys(categoryCounts),
      datasets: [{
        data: Object.values(categoryCounts),
        backgroundColor: [
          '#4cc9f0', '#4361ee', '#9b59b6', 
          '#f72585', '#f8961e'
        ],
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: configureChartOptions('Defect per Kategori')
  });

  // Chart PIC
  const picCounts = {};
  filteredData.forEach(v => v.defects.forEach(d => {
    if (d.pic && d.pic !== "N/A") picCounts[d.pic] = (picCounts[d.pic] || 0) + 1;
  }));
  
  const picCtx = document.getElementById("picBarChart").getContext('2d');
  window.picChart = new Chart(picCtx, {
    type: "bar",
    data: {
      labels: Object.keys(picCounts),
      datasets: [{
        data: Object.values(picCounts),
        backgroundColor: [
          '#9b59b6', '#4361ee', '#4cc9f0',
          '#f72585', '#f8961e'
        ],
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: configureChartOptions('Defect per PIC'),
  });
}

// Fungsi Export ke Excel
async function exportToExcel() {
  const exportBtn = document.getElementById("exportBtn");
  const originalText = exportBtn.innerHTML;
  
  try {
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
    exportBtn.disabled = true;

    const snapshot = await vinCollection.get();
    const currentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const flatData = currentData.flatMap(item => 
      item.defects.map(def => ({
        "Tanggal": item.date,
        "VIN": item.vin,
        "Kategori": def.category,
        "Area": def.area,
        "Deskripsi": def.description,
        "PIC": def.pic,
        "Heavy Repair": def.heavyRepair,
        "Status": item.isZeroDefect ? "Zero Defect" : "With Defect"
      }))
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Defect Report");
    
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Defect_Report_${dateStr}.xlsx`);
    
    alert("Data berhasil di-export!");
    
  } catch (error) {
    console.error("Export error:", error);
    alert("Gagal mengekspor data: " + error.message);
  } finally {
    exportBtn.innerHTML = originalText;
    exportBtn.disabled = false;
  }
}

// Fungsi Render Pareto Chart
function renderParetoChart(dataList) {
  const filtered = dataList.filter(entry => !entry.isZeroDefect);
  const combinedCounts = {};

  filtered.forEach(entry => {
    entry.defects.forEach(def => {
      const desc = def.description.toLowerCase().replace(/\s+/g, " ").trim();
      const key = `${def.category} - ${def.area} - ${desc} - ${def.pic}`;
      combinedCounts[key] = (combinedCounts[key] || 0) + 1;
    });
  });

  let sorted = Object.entries(combinedCounts)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const labels = sorted.map(e => e[0]);
  const counts = sorted.map(e => e[1]);

  if (window.paretoChart instanceof Chart) {
    window.paretoChart.destroy();
  }

  const ctx = document.getElementById("paretoChart").getContext("2d");
  window.paretoChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: '#f72585',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: false}
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: false
          },
          ticks: {
            display: true
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Fungsi Hapus Semua Data
async function deleteAllData() {
  try {
    const snapshot = await vinCollection.get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    alert("Semua data berhasil dihapus!");
  } catch (error) {
    console.error("Error deleting all documents: ", error);
    alert("Gagal menghapus semua data!");
  }
}

// Fungsi Konfirmasi Hapus Semua Data
function confirmDeleteAll() {
  if (vinData.length === 0) {
    alert("Tidak ada data untuk dihapus!");
    return;
  }
  
  if (confirm("APAKAH ANDA YAKIN INGIN MENGHAPUS SEMUA DATA?")) {
    deleteAllData();
  }
}
