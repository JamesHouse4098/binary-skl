const violations = JSON.parse(localStorage.getItem('violations')) || [];
let currentUser = "";
const adminPassword = "123456";
let isAdmin = false;

const adminUsers = [
    "Phạm Hoàng Minh",
    "Đinh Nguyễn Minh Quân",
    "Nguyễn Minh Hiền",
    "Hồ Bảo Nghi",
    "Nguyễn Nhật Việt",
    "Nguyễn Phan Nam Long",
    "Đàm Trung Tín",
    "Tạ Minh Trí",
];

function getCurrentDate() {
    return new Date().toLocaleDateString("vi-VN");
}

function checkUser() {
    const username = document.getElementById("username").value.trim();
    currentUser = username;

    if (adminUsers.includes(username)) {
        document.querySelector(".login-container").style.display = "none";
        document.querySelector(".password-container").style.display = "block";
        document.querySelector(".password-container").style.animation = "fadeInUp 0.5s forwards";
    } else {
        loginUser(username);
    }
}

function adminLogin() {
    if (document.getElementById("password").value === adminPassword) {
        isAdmin = true;
        loginUser(currentUser, true);
    } else {
        alert("Sai mật khẩu!");
    }
}

function loginUser(username, admin = false) {
    document.querySelector(".tabs").style.display = "flex";
    renderTable(username, admin);
}

function renderTable(username, admin) {
    const userViolations = violations.filter(v => v.name.toLowerCase() === username.toLowerCase());
    document.getElementById("userWelcome").innerText = userViolations.length > 0 
        ? `Xin chào, ${username}! Vi phạm của bạn:` 
        : `Xin chào, ${username}! Bạn không có vi phạm nào.`;
    renderTableContent(userViolations, "violationTable");
    renderTableContent(violations, "disciplinaryTable");

    if (admin) {
        document.querySelector(".admin-controls").style.display = "block";
    }

    updateChart();
}

function renderTableContent(data, tableId) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = data.map((v, index) => `
        <tr>
            <td>${v.name}</td>
            <td>${v.reason}</td>
            <td>${v.count}</td>
            <td>${v.total}</td>
            <td>${v.date}</td>
            <td>${v.subject}</td>
            <td>${v.violationDate}</td>
            <td>
                ${isAdmin ? `
                             <button onclick="deleteViolation(${index})">Xóa</button>` : ''}
            </td>
        </tr>
    `).join("");
}

function addViolation() {
    const name = document.getElementById("newName").value.trim();
    const reason = document.getElementById("newReason").value.trim();
    const count = parseInt(document.getElementById("newCount").value);
    const subject = document.getElementById("newSubject").value.trim();
    const violationDate = document.getElementById("newViolationDate").value; 

    if (name && reason && count > 0 && subject && violationDate) {
        const newViolation = { 
            name, 
            reason, 
            count, 
            total: count, 
            date: getCurrentDate(),
            subject,
            violationDate 
        };
        violations.push(newViolation); 
        localStorage.setItem('violations', JSON.stringify(violations)); 
        renderTable(currentUser, isAdmin);
        document.getElementById("newName").value = '';
        document.getElementById("newReason").value = '';
        document.getElementById("newCount").value = '';
        document.getElementById("newSubject").value = '';
        document.getElementById("newViolationDate").value = '';
    } else {
        alert("Vui lòng điền đầy đủ thông tin!");
    }
}

function editViolation(index) {
    const violation = violations[index];
    document.getElementById("newName").value = violation.name;
    document.getElementById("newReason").value = violation.reason;
    document.getElementById("newCount").value = violation.count;
    document.getElementById("newSubject").value = violation.subject;
    document.getElementById("newViolationDate").value = violation.violationDate;

    deleteViolation(index);
}

function deleteViolation(index) {
    const violation = violations[index];

    // Chặn xóa chính mình
    if (violation.name.toLowerCase() === currentUser.toLowerCase()) {
        alert("Bạn không thể xóa tên của chính mình trong danh sách!");
        return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa vi phạm này?")) {
        violations.splice(index, 1); 
        localStorage.setItem('violations', JSON.stringify(violations)); 
        renderTable(currentUser, isAdmin); 
    }
}

function searchViolations() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#disciplinaryTable tr");

    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const reason = row.cells[1].textContent.toLowerCase();
        const date = row.cells[4].textContent.toLowerCase();
        if (name.includes(input) || reason.includes(input) || date.includes(input)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.${tabName}`).classList.add('active');
}

function updateChart() {
    const ctx = document.getElementById('violationChart').getContext('2d');
    const chartData = violations.map(v => v.count);
    const chartLabels = violations.map(v => v.name);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Số lần vi phạm',
                data: chartData,
                backgroundColor: '#007bff',
                borderColor: '#0056b3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(violations);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vi phạm");
    XLSX.writeFile(workbook, "Danh_sach_vi_pham.xlsx");
}

window.onload = function() {
    const storedViolations = JSON.parse(localStorage.getItem('violations'));
    if (storedViolations) {
        violations.push(...storedViolations);
    }
};