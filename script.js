document.addEventListener('DOMContentLoaded', () => {
    const studentTextarea = document.getElementById('student-names');
    const generateButton = document.getElementById('generate-button');
    const fillExampleButton = document.getElementById('fill-example-students');
    const seatingStyleInput = document.getElementById('seating-style');
    const seatingChartContainer = document.getElementById('seating-chart');
    const exportPdfButton = document.getElementById('export-pdf');
    const editableTitle = document.getElementById('editable-title');
    const editableRoomNumber = document.getElementById('editable-room-number');
    const addGroupButton = document.getElementById('add-group-button');
    const addStudentButton = document.getElementById('add-student-button');
    const addRowButton = document.getElementById('add-row-button');
    const removeRowButton = document.getElementById('remove-row-button');
    const toggleAdvancedRequirementsButton = document.getElementById('toggle-advanced-requirements');
    const advancedRequirementsSection = document.getElementById('advanced-requirements');
    const resetButton = document.getElementById('reset-button');
    let students = JSON.parse(localStorage.getItem('students')) || [];
    let groupCounter = 1;
    let studentCounter = students.length;
    let totalCols = 3; // Default number of columns
    let totalRows = 4; // Default number of rows including the kateter row
    let kateterRow = totalRows; // Place the kateter at the bottom row
    const kateterColumn = 2; // Middle column for 3x3 grid

    const settingsButton = document.getElementById('settings-button');
const settingsSection = document.getElementById('settings-section');
const applySettingsButton = document.getElementById('apply-settings');
const numRowsInput = document.getElementById('num-rows');
const numColsInput = document.getElementById('num-cols');
const exportSection = document.getElementById('export-section');
const fixedSettings = document.getElementById('fixed-settings');

if (settingsButton) {
    settingsButton.addEventListener('click', () => {
        const isCollapsed = settingsSection.classList.contains('collapsible');
        settingsSection.classList.toggle('collapsible');
        settingsSection.setAttribute('aria-hidden', isCollapsed ? 'false' : 'true');
        fixedSettings.classList.toggle('hidden'); // Toggle visibility of fixed-settings
    });
}

const toggleSidebarButton = document.getElementById('toggle-sidebar');
const sidebar = document.getElementById('menu-placeholder');
toggleSidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    document.querySelector('header').classList.toggle('full-width');
    document.querySelector('main').classList.toggle('full-width');
});

applySettingsButton.addEventListener('click', () => {
    const currentGridData = saveCurrentGridData(); // Save current grid data
    totalRows = parseInt(numRowsInput.value);
    totalCols = parseInt(numColsInput.value);
    kateterRow = totalRows; // Update kateterRow to the new bottom row
    renderEmptyGrid();
    loadGridData(currentGridData); // Load saved grid data
    saveCurrentGrid(); // Save the updated grid
});
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        const draggableElementId = e.dataTransfer.getData('text/plain');
        const dropZone = e.target.closest('.seating-cell, .student-group, .student-container');
        const draggableElement = document.getElementById(draggableElementId);
        if (dropZone && draggableElement && dropZone !== draggableElement) {
            if (dropZone.classList.contains('student-group')) {
                dropZone.querySelector('.student-container').appendChild(draggableElement);
            } else {
                dropZone.appendChild(draggableElement);
            }
            draggableElement.classList.remove('dragging');
            saveCurrentGrid();
        }
    }

    function handleGroupDoubleClick(e) {
        const groupHeader = e.target;
        if (!groupHeader.isContentEditable) {
            groupHeader.contentEditable = true;
            groupHeader.focus();
            groupHeader.addEventListener('blur', () => {
                groupHeader.contentEditable = false;
                saveCurrentGrid();
            });
        }
    }

    function handleStudentDoubleClick(e) {
        const studentDiv = e.target;
        if (!studentDiv.isContentEditable) {
            studentDiv.contentEditable = true;
            studentDiv.focus();
            studentDiv.addEventListener('blur', () => {
                studentDiv.contentEditable = false;
                saveCurrentGrid();
            });
        }
    }

    function handleDeleteGroup(e) {
        const groupElement = e.target.closest('.student-group');
        if (groupElement) {
            groupElement.remove();
            saveCurrentGrid();
        }
    }

    function handleDeleteStudent(e) {
        const studentElement = e.target.closest('.student');
        if (studentElement) {
            studentElement.remove();
            saveCurrentGrid();
        }
    }

    function createGroup(groupNumber, students = []) {
        const group = document.createElement('div');
        group.className = 'student-group';
        group.id = `group-${groupNumber}`;
        group.draggable = true;

        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.innerText = `Gruppe ${groupNumber}`;
        groupHeader.addEventListener('dblclick', handleGroupDoubleClick);
        group.appendChild(groupHeader);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '&times;';
        deleteButton.addEventListener('click', handleDeleteGroup);
        groupHeader.appendChild(deleteButton);

        group.addEventListener('dragstart', handleDragStart);
        group.addEventListener('dragover', handleDragOver);
        group.addEventListener('drop', handleDrop);

        const studentContainer = document.createElement('div');
        studentContainer.className = 'student-container';
        group.appendChild(studentContainer);

        students.forEach((student) => {
            const studentDiv = createStudent(student);
            studentContainer.appendChild(studentDiv);
        });

        // Adjust group size based on the number of students
        const baseHeight = 100; // Base height for the group
        const studentHeight = 50; // Height for each student
        group.style.height = `${baseHeight + students.length * studentHeight}px`;

        return group;
    }

    function createStudent(name) {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'student';
        studentDiv.innerText = name;
        studentDiv.id = `student-${studentCounter++}`;
        studentDiv.draggable = true;
        studentDiv.addEventListener('dragstart', handleDragStart);
        studentDiv.addEventListener('dragover', handleDragOver);
        studentDiv.addEventListener('drop', handleDrop);
        studentDiv.addEventListener('dblclick', handleStudentDoubleClick);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '&times;';
        deleteButton.addEventListener('click', handleDeleteStudent);
        studentDiv.appendChild(deleteButton);

        return studentDiv;
    }

    function saveCurrentGrid() {
        const gridData = [];
        document.querySelectorAll('.seating-cell').forEach(cell => {
            const cellData = { row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col), students: [] };
            cell.querySelectorAll('.student, .student-group').forEach(element => {
                if (element.classList.contains('student')) {
                    cellData.students.push({ type: 'student', name: element.innerText });
                } else {
                    const group = { type: 'group', students: [] };
                    element.querySelectorAll('.student').forEach(student => {
                        group.students.push(student.innerText);
                    });
                    cellData.students.push(group);
                }
            });
            gridData.push(cellData);
        });
        localStorage.setItem('gridData', JSON.stringify(gridData));
    }

    function loadCurrentGrid() {
        const gridData = JSON.parse(localStorage.getItem('gridData') || '[]');
        gridData.forEach(cellData => {
            const cell = document.querySelector(`.seating-cell[data-row='${cellData.row}'][data-col='${cellData.col}']`);
            if (cell) {
                cellData.students.forEach(data => {
                    if (data.type === 'student') {
                        const studentDiv = createStudent(data.name);
                        cell.appendChild(studentDiv);
                    } else {
                        const group = createGroup(groupCounter++);
                        data.students.forEach(studentName => {
                            const studentDiv = createStudent(studentName);
                            group.appendChild(studentDiv);
                        });
                        cell.appendChild(group);
                    }
                });
            }
        });
    }

    function saveCurrentGridData() {
        const gridData = [];
        document.querySelectorAll('.seating-cell').forEach(cell => {
            const cellData = { row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col), students: [] };
            cell.querySelectorAll('.student, .student-group').forEach(element => {
                if (element.classList.contains('student')) {
                    cellData.students.push({ type: 'student', name: element.innerText });
                } else {
                    const group = { type: 'group', students: [] };
                    element.querySelectorAll('.student').forEach(student => {
                        group.students.push(student.innerText);
                    });
                    cellData.students.push(group);
                }
            });
            gridData.push(cellData);
        });
        return gridData;
    }

    function loadGridData(gridData) {
        gridData.forEach(cellData => {
            const cell = document.querySelector(`.seating-cell[data-row='${cellData.row}'][data-col='${cellData.col}']`);
            if (cell) {
                // Clear existing elements in the cell
                cell.innerHTML = '';
                cellData.students.forEach(data => {
                    if (data.type === 'student') {
                        const studentDiv = createStudent(data.name);
                        cell.appendChild(studentDiv);
                    } else {
                        const group = createGroup(groupCounter++);
                        data.students.forEach(studentName => {
                            const studentDiv = createStudent(studentName);
                            group.appendChild(studentDiv);
                        });
                        cell.appendChild(group);
                    }
                });
            }
        });
    }

    addGroupButton.addEventListener('click', () => {
        const firstEmptyCell = Array.from(seatingChartContainer.querySelectorAll('.seating-cell')).find(cell => cell.children.length === 0 && !(parseInt(cell.dataset.row) === kateterRow && parseInt(cell.dataset.col) === kateterColumn));
        if (firstEmptyCell) {
            const group = createGroup(groupCounter++);
            firstEmptyCell.appendChild(group);
            saveCurrentGrid();
        } else {
            alert('Ingen ledige plasseringer tilgjengelig.');
        }
    });

    addStudentButton.addEventListener('click', () => {
        const firstEmptyCell = Array.from(seatingChartContainer.querySelectorAll('.seating-cell')).find(cell => cell.children.length === 0 && !(parseInt(cell.dataset.row) === kateterRow && parseInt(cell.dataset.col) === kateterColumn));
        if (firstEmptyCell) {
            const studentDiv = createStudent('Ny elev');
            firstEmptyCell.appendChild(studentDiv);
            saveCurrentGrid();
        } else {
            alert('Ingen ledige plasseringer tilgjengelig.');
        }
    });

    function autoGenerateSeatingChart() {
        const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
        students = names;
        localStorage.setItem('students', JSON.stringify(students));

        const seatingStyle = parseInt(seatingStyleInput.value);
        const sitTwoByTwo = document.getElementById('sit-two-by-two').checked;
        adjustGridForStudents(students.length, seatingStyle);
        seatingChartContainer.innerHTML = ''; // Clear previous seating chart before rendering new one

        renderEmptyGrid(); // Render the adjusted grid

        if (students.length === 0 && studentCounter === 0) {
            alert('Vennligst registrer elevene først.');
            return;
        }

        const shuffledStudents = shuffle(students.slice());
        let currentIndex = 0;
        groupCounter = 1;

        document.querySelectorAll('.seating-cell').forEach((cell, index) => {
            if (currentIndex >= shuffledStudents.length) return;

            if (parseInt(cell.dataset.row) === kateterRow && parseInt(cell.dataset.col) === kateterColumn) return;
            if (parseInt(cell.dataset.row) === kateterRow) return; // Skip kateter row for students

            if (sitTwoByTwo) {
                const studentDiv1 = createStudent(shuffledStudents[currentIndex++]);
                cell.appendChild(studentDiv1);
                if (currentIndex < shuffledStudents.length) {
                    const studentDiv2 = createStudent(shuffledStudents[currentIndex++]);
                    cell.appendChild(studentDiv2);
                }
            } else {
                if (seatingStyle === 1) {
                    const studentDiv = createStudent(shuffledStudents[currentIndex++]);
                    cell.appendChild(studentDiv);
                } else {
                    const groupStudents = [];
                    for (let j = 0; j < seatingStyle && currentIndex < shuffledStudents.length; j++, currentIndex++) {
                        groupStudents.push(shuffledStudents[currentIndex]);
                    }
                    const group = createGroup(groupCounter++, groupStudents);
                    cell.appendChild(group);
                }
            }
        });

        saveCurrentGrid();
    }

    fillExampleButton.addEventListener('click', () => {
        fetch('elever.jsx')
            .then(response => response.text())
            .then(data => {
                studentTextarea.value = data.trim();
                autoGenerateSeatingChart(); // Automatically generate seating chart
            })
            .catch(error => {
                console.error('Error fetching example students:', error);
            });
    });

    exportPdfButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'pt', 'a4');

        const cellWidth = 70;
        const cellHeight = 50;
        const startX = 20;
        const startY = 40;
        const gap = 10;

        pdf.setFontSize(14);
        pdf.text(editableTitle.innerText, startX, startY);
        pdf.text(editableRoomNumber.innerText, startX, startY + 20);

        if (document.getElementById('kateter-cell')) {
            const kateterCell = document.getElementById('kateter-cell');
            const kateterTextValue = kateterCell.querySelector('#kateter-text').value;
            pdf.rect(startX, startY + 40, cellWidth, cellHeight);
            pdf.text(kateterTextValue, startX + 5, startY + 55);
        }

        const cells = document.querySelectorAll('.seating-cell .student-group, .seating-cell > .student');
        
        cells.forEach((element, index) => {
            const boxX = startX + ((index + 1) % 5) * (cellWidth + gap);
            const boxY = startY + 40 + Math.floor((index + 1) / 5) * (cellHeight + gap);
            pdf.rect(boxX, boxY, cellWidth, cellHeight);
            
            if (element.classList.contains('student-group')) {
                const groupNameElem = element.querySelector('.group-header');
                const lines = pdf.splitTextToSize(element.innerText, cellWidth - 10);
                pdf.text(lines, boxX + 5, boxY + 25);
            } else if (element.classList.contains('student')) {
                const studentName = element.innerText;
                pdf.text(studentName, boxX + 5, boxY + 10);
            }
        });

        const titleText = editableTitle.innerText.replaceAll(' ', '_');
        const roomNumberText = editableRoomNumber.innerText.replaceAll(' ', '_');
        const filename = `Klassekart_${titleText}_${roomNumberText}.pdf`;

        pdf.save(filename);
    });

    toggleAdvancedRequirementsButton.addEventListener('click', () => {
        const isCollapsed = advancedRequirementsSection.classList.contains('collapsible');
        advancedRequirementsSection.classList.toggle('collapsible');
        toggleAdvancedRequirementsButton.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
    });

    function createResizers() {
        const seatingChart = document.getElementById('seating-chart');
        const rows = totalRows;
        const cols = totalCols;

        for (let i = 1; i < rows; i++) {
            const resizer = document.createElement('div');
            resizer.className = 'grid-resizer horizontal';
            resizer.style.top = `calc(${(i / rows) * 100}% - 2.5px)`;
            seatingChart.appendChild(resizer);
            resizer.addEventListener('mousedown', initDrag);
        }

        for (let i = 1; i < cols; i++) {
            const resizer = document.createElement('div');
            resizer.className = 'grid-resizer vertical';
            resizer.style.left = `calc(${(i / cols) * 100}% - 2.5px)`;
            seatingChart.appendChild(resizer);
            resizer.addEventListener('mousedown', initDrag);
        }
    }

    function initDrag(e) {
        const resizer = e.target;
        const isHorizontal = resizer.classList.contains('horizontal');
        const startPos = isHorizontal ? e.clientY : e.clientX;
        const startSize = isHorizontal ? seatingChartContainer.offsetHeight : seatingChartContainer.offsetWidth;

        function doDrag(e) {
            const newSize = startSize + (isHorizontal ? e.clientY - startPos : e.clientX - startPos);
            seatingChartContainer.style[isHorizontal ? 'height' : 'width'] = `${newSize}px`;
        }

        function stopDrag() {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        }

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }

    function renderEmptyGrid() {
        seatingChartContainer.innerHTML = '';
        seatingChartContainer.style.gridTemplateColumns = `repeat(${totalCols}, 1fr)`; // Update grid columns
        seatingChartContainer.style.gap = '0.5rem'; // Adjust gap when generating

        for (let row = 1; row <= totalRows; row++) {
            for (let col = 1; col <= totalCols; col++) {
                if (row === kateterRow && col === kateterColumn) {
                    const kateterCellHTML = `
                        <div id="kateter-cell" class="seating-cell kateter-row" data-row="${row}" data-col="${col}" draggable="true">
                            <input id="kateter-text" type="text" value="Kateter" aria-label="Kateter" readonly />
                        </div>
                    `;
                    seatingChartContainer.insertAdjacentHTML('beforeend', kateterCellHTML);

                    const kateterText = document.getElementById('kateter-text');
                    kateterText.addEventListener('dblclick', () => {
                        kateterText.removeAttribute('readonly');
                        kateterText.focus();
                    });
                    kateterText.addEventListener('blur', () => {
                        kateterText.setAttribute('readonly', true);
                    });
                    kateterText.addEventListener('input', () => {
                        localStorage.setItem('kateterText', kateterText.value);
                    });

                    if (localStorage.getItem('kateterText')) {
                        kateterText.value = localStorage.getItem('kateterText');
                    }
                    
                    const kateterCell = document.getElementById('kateter-cell');
                    kateterCell.addEventListener('dragstart', handleDragStart);
                    kateterCell.addEventListener('dragover', handleDragOver);
                    kateterCell.addEventListener('drop', handleDrop);
                } else {
                    const cell = document.createElement('div');
                    cell.className = 'seating-cell';
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    cell.addEventListener('dragover', handleDragOver);
                    cell.addEventListener('drop', handleDrop);
                    seatingChartContainer.appendChild(cell);
                }
            }
        }

        createResizers();
    }

    function calculateRowsNeeded(studentCount, groupSize) {
        return Math.ceil(studentCount / (groupSize * totalCols)) + 1; // Add one extra row for the kateter
    }

    function adjustGridForStudents(studentCount, groupSize) {
        totalRows = calculateRowsNeeded(studentCount, groupSize);
        kateterRow = totalRows; // Update kateterRow to the new bottom row
        renderEmptyGrid();
        loadCurrentGrid(); // Load current grid data after adjusting the grid
    }

    addRowButton.addEventListener('click', () => {
        const lastRowCells = Array.from(seatingChartContainer.querySelectorAll(`.seating-cell[data-row='${totalRows}']`));
        
        if (lastRowCells.length < totalCols) {
            // Add new cell to the last row
            const newCell = document.createElement('div');
            newCell.className = 'seating-cell';
            newCell.dataset.row = totalRows;
            newCell.dataset.col = lastRowCells.length + 1;
            newCell.addEventListener('dragover', handleDragOver);
            newCell.addEventListener('drop', handleDrop);
            seatingChartContainer.appendChild(newCell);
        } else {
            // Add a new row if the last row is filled
            totalRows++;
            const newCell = document.createElement('div');
            newCell.className = 'seating-cell';
            newCell.dataset.row = totalRows;
            newCell.dataset.col = 1;
            newCell.addEventListener('dragover', handleDragOver);
            newCell.addEventListener('drop', handleDrop);
            seatingChartContainer.appendChild(newCell);
        }
        saveCurrentGrid();
    });

    removeRowButton.addEventListener('click', () => {
        const cells = Array.from(seatingChartContainer.querySelectorAll('.seating-cell'));
        if (cells.length > 0) {
            // Remove the last cell
            const lastCell = cells[cells.length - 1];
            lastCell.remove();
            
            // Decrease totalRows if the last row becomes empty
            const rowCells = cells.filter(cell => parseInt(cell.dataset.row) === totalRows);
            if (rowCells.length <= 1) {
                totalRows--;
            }
            
            saveCurrentGrid();
        } else {
            alert('Det er ingen flere celler å slette.');
        }
    });

    resetButton.addEventListener('click', () => {
        localStorage.removeItem('gridData');
        localStorage.removeItem('kateterText');
        localStorage.removeItem('editableTitle');
        localStorage.removeItem('editableRoomNumber');
        location.reload();
    });

    renderEmptyGrid();

    generateButton.addEventListener('click', () => {
        const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
        students = names;
        localStorage.setItem('students', JSON.stringify(students));

        // Apply settings from num-rows and num-cols
        totalRows = parseInt(numRowsInput.value);
        totalCols = parseInt(numColsInput.value);
        kateterRow = totalRows; // Update kateterRow to the new bottom row

        const seatingStyle = parseInt(seatingStyleInput.value);
        const sitTwoByTwo = document.getElementById('sit-two-by-two').checked;
        adjustGridForStudents(students.length, seatingStyle);
        seatingChartContainer.innerHTML = ''; // Clear previous seating chart before rendering new one

        renderEmptyGrid(); // Render the adjusted grid

        if (students.length === 0 && studentCounter === 0) {
            alert('Vennligst registrer elevene først.');
            return;
        }

        const shuffledStudents = shuffle(students.slice());
        let currentIndex = 0;
        groupCounter = 1;

        document.querySelectorAll('.seating-cell').forEach((cell, index) => {
            if (currentIndex >= shuffledStudents.length) return;

            if (parseInt(cell.dataset.row) === kateterRow && parseInt(cell.dataset.col) === kateterColumn) return;
            if (parseInt(cell.dataset.row) === kateterRow) return; // Skip kateter row for students

            if (sitTwoByTwo) {
                const studentDiv1 = createStudent(shuffledStudents[currentIndex++]);
                cell.appendChild(studentDiv1);
                if (currentIndex < shuffledStudents.length) {
                    const studentDiv2 = createStudent(shuffledStudents[currentIndex++]);
                    cell.appendChild(studentDiv2);
                }
            } else {
                if (seatingStyle === 1) {
                    const studentDiv = createStudent(shuffledStudents[currentIndex++]);
                    cell.appendChild(studentDiv);
                } else {
                    const groupStudents = [];
                    for (let j = 0; j < seatingStyle && currentIndex < shuffledStudents.length; j++, currentIndex++) {
                        groupStudents.push(shuffledStudents[currentIndex]);
                    }
                    const group = createGroup(groupCounter++, groupStudents);
                    cell.appendChild(group);
                }
            }
        });

        saveCurrentGrid();
    });

    editableTitle.addEventListener('dblclick', () => {
        if (!editableTitle.isContentEditable) {
            editableTitle.contentEditable = true;
            editableTitle.focus();

            editableTitle.addEventListener('blur', () => {
                editableTitle.contentEditable = false;
                localStorage.setItem('editableTitle', editableTitle.innerText);
            });
        }
    });

    editableRoomNumber.addEventListener('dblclick', () => {
        if (!editableRoomNumber.isContentEditable) {
            editableRoomNumber.contentEditable = true;
            editableRoomNumber.focus();
            
            editableRoomNumber.addEventListener('blur', () => {
                editableRoomNumber.contentEditable = false;
                localStorage.setItem('editableRoomNumber', editableRoomNumber.innerText);
            });
        }
    });

    const kateterText = document.getElementById('kateter-text');
    kateterText.addEventListener('dblclick', () => {
        kateterText.removeAttribute('readonly');
        kateterText.focus();
    });

    kateterText.addEventListener('blur', () => {
        kateterText.setAttribute('readonly', true);
    });

    kateterText.addEventListener('input', () => {
        localStorage.setItem('kateterText', kateterText.value);
    });

    if (localStorage.getItem('kateterText')) {
        kateterText.value = localStorage.getItem('kateterText');
    }

    if (localStorage.getItem('editableTitle')) {
        editableTitle.innerText = localStorage.getItem('editableTitle');
    }

    if (localStorage.getItem('editableRoomNumber')) {
        editableRoomNumber.innerText = localStorage.getItem('editableRoomNumber');
    }

    loadCurrentGrid();

    const fetchStudentsButton = document.getElementById('fetch-students');
    const fileInput = document.getElementById('file-input');

    fetchStudentsButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                studentTextarea.value = e.target.result.trim();
                autoGenerateSeatingChart(); // Automatically generate seating chart
            };
            reader.readAsText(file);
        }
    });
});