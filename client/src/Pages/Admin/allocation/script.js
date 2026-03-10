// Data Structure
let courseData = {
    year1: { odd: [1], even: [2], 1: [], 2: [] },
    year2: { odd: [3], even: [4], 3: [], 4: [] },
    year3: { odd: [5], even: [6], 5: [], 6: [] },
    year4: { odd: [7], even: [8], 7: [], 8: [] }
};

// --- Comprehensive Mock Data ---

// Year 1
courseData.year1[1] = [
    { code: '24MAT101', title: 'Calculus', ltp: '3-1-0', credits: '4', category: 'Core' },
    { code: '24PHY101', title: 'Engineering Physics', ltp: '3-0-2', credits: '4', category: 'Core' },
    { code: '24CSE101', title: 'Problem Solving & C Programming', ltp: '3-0-2', credits: '4', category: 'Core' }
];
courseData.year1[2] = [
    { code: '24MAT102', title: 'Linear Algebra', ltp: '3-1-0', credits: '4', category: 'Core' },
    { code: '24CSE102', title: 'Data Structures', ltp: '3-0-2', credits: '4', category: 'Core' },
    { code: '24ENG101', title: 'Professional Communication', ltp: '2-0-2', credits: '3', category: 'Core' }
];

// Year 2
courseData.year2[3] = [
    { code: '19CSE201', title: 'Computer Organization & Architecture', ltp: '3-1-0', credits: '4', category: 'Core' },
    { code: '19CSE202', title: 'Object Oriented Programming', ltp: '3-0-2', credits: '4', category: 'Core' },
    { code: '19MAT201', title: 'Discrete Mathematics', ltp: '3-1-0', credits: '4', category: 'Core' },
    { code: '19HUM201', title: 'Environmental Sciences', ltp: '2-0-0', credits: 'P/F', category: 'Audit' }
];
courseData.year2[4] = [
    { code: '19CSE211', title: 'Design & Analysis of Algorithms', ltp: '3-0-2', credits: '4', category: 'Core' },
    { code: '19CSE212', title: 'Software Engineering', ltp: '3-0-0', credits: '3', category: 'Core' },
    { code: '19CSE213', title: 'Java Programming', ltp: '2-0-2', credits: '3', category: 'Core' },
    { code: '19AVP201', title: 'Amrita Values Program', ltp: '1-0-0', credits: 'P/F', category: 'Audit' }
];

// Year 3
courseData.year3[5] = [
    { code: '19CSE301', title: 'Operating Systems', ltp: '3-0-2', credits: '4', category: 'Core' },
    { code: '19CSE302', title: 'Database Management', ltp: '3-0-2', credits: '4', category: 'Core' },
    { code: '19CSE303', title: 'Theory of Computation', ltp: '3-1-0', credits: '4', category: 'Core' },
    { code: '19CSE331', title: 'Data Mining', ltp: '3-0-0', credits: '3', category: 'PE' },
    { code: '19SSK301', title: 'Soft Skills I', ltp: '1-0-2', credits: 'P/F', category: 'Audit' }
];
courseData.year3[6] = [
    { code: '19CSE311', title: 'Computer Networks', ltp: '3-0-2', credits: '4', category: 'Core' },
    { code: '19CSE312', title: 'Compiler Design', ltp: '3-0-2', credits: '4', category: 'Core' },
    { code: '19CSE332', title: 'Cloud Computing', ltp: '3-0-0', credits: '3', category: 'PE' },
    { code: '19OEL301', title: 'Photography', ltp: '2-0-0', credits: '2', category: 'FE' },
    { code: '19SSK302', title: 'Soft Skills II', ltp: '1-0-2', credits: 'P/F', category: 'Audit' }
];

// Year 4
courseData.year4[7] = [
    { code: '19CSE401', title: 'Artificial Intelligence', ltp: '3-0-0', credits: '3', category: 'Core' },
    { code: '19CSE431', title: 'Blockchain Technologies', ltp: '3-0-0', credits: '3', category: 'PE' },
    { code: '19CSE432', title: 'Natural Language Processing', ltp: '3-0-0', credits: '3', category: 'PE' },
    { code: '19OEL401', title: 'Financial Management', ltp: '3-0-0', credits: '3', category: 'FE' },
    { code: '19CSE491', title: 'Project Phase I', ltp: '0-0-12', credits: '4', category: 'Core' }
];
courseData.year4[8] = [
    { code: '19CSE433', title: 'Cyber Security', ltp: '3-0-0', credits: '3', category: 'PE' },
    { code: '19CSE434', title: 'Internet of Things', ltp: '3-0-0', credits: '3', category: 'PE' },
    { code: '19CSE492', title: 'Project Phase II', ltp: '0-0-24', credits: '8', category: 'Core' }
];

// --- Faculty Readiness Logic ---
let faculties = [
    { name: 'Dr. Amitabh Mukherjee', status: 'Not Sent' },
    { name: 'Prof. Lakshmi Narayan', status: 'Not Sent' },
    { name: 'Dr. Sunita Deshmukh', status: 'Not Sent' },
    { name: 'Dr. Ramesh Chandra', status: 'Not Sent' },
    { name: 'Dr. Gitanjali Rao', status: 'Not Sent' },
    { name: 'Prof. Venkat Subramanian', status: 'Not Sent' }
];

function updateReadinessUI() {
    const completed = faculties.filter(f => f.status === 'Completed').length;
    const total = faculties.length;
    const progress = (completed / total) * 100;

    document.getElementById('readiness-progress').style.width = `${progress}%`;
    document.getElementById('completed-count').innerText = completed;
    document.getElementById('total-faculties').innerText = total;

    const genBtn = document.getElementById('btn-generate-timetable');
    if (completed === total) {
        genBtn.classList.remove('hidden');
        document.getElementById('btn-send-forms').innerText = 'All Responses Received';
        document.getElementById('btn-send-forms').disabled = true;
    }
}

function sendForms() {
    const btn = document.getElementById('btn-send-forms');
    btn.innerText = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
        faculties.forEach(f => f.status = 'Pending');
        btn.innerText = 'Waiting for Faculty...';
        showToast('Forms sent to all 6 faculties');
        simulateFacultyResponses();
    }, 1500);
}

function simulateFacultyResponses() {
    faculties.forEach((f, index) => {
        const delay = 2000 + Math.random() * 5000;
        setTimeout(() => {
            f.status = 'Completed';
            updateReadinessUI();
            showToast(`${f.name} submitted the form`);
        }, delay * (index + 1) / 2);
    });
}

// State Management
let currentYear = 1;
let currentSemType = 'odd';

// DOM Elements
const semestersContainer = document.getElementById('semesters-container');
const yearTabs = document.querySelectorAll('.year-tab');
const semTypeRadios = document.querySelectorAll('input[name="semType"]');
const modal = document.getElementById('course-modal');
const courseForm = document.getElementById('course-form');
const closeModalBtns = document.querySelectorAll('.close-modal, .close-btn');

// Initialize
function init() {
    renderSemesters();
    updateReadinessUI();

    // Readiness Buttons
    document.getElementById('btn-send-forms').addEventListener('click', sendForms);
    document.getElementById('btn-generate-timetable').addEventListener('click', () => {
        showToast('🚀 Timetable Generation Engine Started!');
    });

    // Year Switch
    yearTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            yearTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentYear = parseInt(tab.dataset.year);
            renderSemesters();
        });
    });

    // Odd/Even Switch
    semTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentSemType = e.target.value;
            renderSemesters();
        });
    });

    // Modal Close
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => modal.style.display = 'none');
    });

    // Form Submit
    courseForm.addEventListener('submit', handleFormSubmit);
}

function renderSemesters() {
    const semsToShow = courseData[`year${currentYear}`][currentSemType];
    semestersContainer.innerHTML = '';

    semsToShow.forEach(semNum => {
        const courses = courseData[`year${currentYear}`][semNum];
        const semCard = document.createElement('div');
        semCard.className = 'semester-card';

        semCard.innerHTML = `
            <div class="sem-header">
                <div class="sem-title-box">
                    <div class="sem-badge">S${semNum}</div>
                    <h2>Semester ${semNum}</h2>
                </div>
                <button class="btn-add" onclick="openModal(${semNum})">
                    <span>+</span> Add Course
                </button>
            </div>
            <table class="course-table">
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Title</th>
                        <th>L-T-P</th>
                        <th>Credits</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${courses.length ? courses.map((c, index) => {
            const isPF = c.credits === 'P/F';
            const catClass = `cat-${c.category.toLowerCase()}`;
            const catNames = { 'PE': 'Professional Elective', 'FE': 'Free Elective', 'Core': 'Core Course', 'Audit': 'Audit Course' };

            return `
                        <tr>
                            <td>
                                <span class="course-code">${c.code}</span>
                                <span class="category-badge ${catClass}">${catNames[c.category] || c.category}</span>
                            </td>
                            <td class="course-title">${c.title}</td>
                            <td class="course-ltp">${c.ltp}</td>
                            <td>
                                <span class="credit-badge ${isPF ? 'pf' : ''}">
                                    ${isPF ? 'PASS/FAIL' : c.credits + ' Cr'}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <button class="icon-btn" onclick="editCourse(${semNum}, ${index})">✎</button>
                                <button class="icon-btn" onclick="deleteCourse(${semNum}, ${index})">🗑</button>
                            </td>
                        </tr>
                    `}).join('') : `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding: 3rem;">No courses allocated yet. Click "Add Course" to begin.</td></tr>`}
                </tbody>
            </table>
        `;
        semestersContainer.appendChild(semCard);
    });
}

function openModal(semNum, editIndex = null) {
    document.getElementById('course-semester').value = semNum;
    document.getElementById('edit-index').value = editIndex !== null ? editIndex : '';

    if (editIndex !== null) {
        const course = courseData[`year${currentYear}`][semNum][editIndex];
        document.getElementById('modal-title').innerText = 'Edit Course';
        document.getElementById('course-code').value = course.code;
        document.getElementById('course-title').value = course.title;
        document.getElementById('course-ltp').value = course.ltp;
        document.getElementById('course-credits').value = course.credits;
        document.getElementById('course-category').value = course.category || 'Core';
    } else {
        document.getElementById('modal-title').innerText = 'Add New Course';
        courseForm.reset();
    }

    modal.style.display = 'block';
}

function handleFormSubmit(e) {
    e.preventDefault();
    const semNum = parseInt(document.getElementById('course-semester').value);
    const editIndex = document.getElementById('edit-index').value;

    const newCourse = {
        code: document.getElementById('course-code').value,
        title: document.getElementById('course-title').value,
        ltp: document.getElementById('course-ltp').value,
        credits: document.getElementById('course-credits').value,
        category: document.getElementById('course-category').value
    };

    if (editIndex !== '') {
        courseData[`year${currentYear}`][semNum][parseInt(editIndex)] = newCourse;
    } else {
        courseData[`year${currentYear}`][semNum].push(newCourse);
    }

    modal.style.display = 'none';
    renderSemesters();
}

function deleteCourse(semNum, index) {
    if (confirm('Are you sure you want to remove this course?')) {
        courseData[`year${currentYear}`][semNum].splice(index, 1);
        renderSemesters();
    }
}

function editCourse(semNum, index) {
    openModal(semNum, index);
}

// Global scope for onclick handlers
window.openModal = openModal;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;

init();
