document.addEventListener('DOMContentLoaded', () => {
    const customizeHorseshoeBtn = document.getElementById('customize-horseshoe');
    // Hent elementer fra DOM
    const studentTextarea = document.getElementById('student-names');
    const generateButton = document.getElementById('generate-button');
    const fillExampleButton = document.getElementById('fill-example-students');
    const seatingStyleInput = document.getElementById('seating-style');
    const sitOneByOneRadio = document.getElementById('sit-one-by-one');
    const sitTwoByTwoRadio = document.getElementById('sit-two-by-two');
    const showHorseshoeRadio = document.getElementById('show-horseshoe');
    const groupSeatingRadio = document.getElementById('group-seating');

    // Funksjon for å oppdatere input for antall elever pr gruppe
    function updateGroupInputState() {
        if (groupSeatingRadio.checked) {
            seatingStyleInput.disabled = false;
        } else {
            seatingStyleInput.disabled = true;
        }
    }
    // Koble radioknappene til funksjonen
    [sitOneByOneRadio, sitTwoByTwoRadio, showHorseshoeRadio, groupSeatingRadio].forEach(radio => {
        radio.addEventListener('change', updateGroupInputState);
    });
    updateGroupInputState();

    // Oppdater klassekartet automatisk når radioknappene endres og det finnes elever
    [sitOneByOneRadio, sitTwoByTwoRadio, showHorseshoeRadio, groupSeatingRadio].forEach(radio => {
        radio.addEventListener('change', () => {
            // Vis/skjul Tilpass hestesko-knappen uansett
            if (showHorseshoeRadio.checked) {
                customizeHorseshoeBtn.style.display = '';
            } else {
                customizeHorseshoeBtn.style.display = 'none';
            }
            // Oppdater klassekart hvis det finnes elever
            const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
            if (names.length > 0) {
                if (showHorseshoeRadio.checked) {
                    renderHorseshoeLayout();
                    updateHorseshoeCounter();
                } else {
                    seatingChartContainer.classList.remove('hidden');
                    horseshoeContainer.classList.add('hidden');
                    autoGenerateSeatingChart();
                }
            }
        });
    });
    // Skjul Tilpass hestesko-knappen ved lasting hvis ikke hestesko er valgt
    if (!showHorseshoeRadio.checked) {
        customizeHorseshoeBtn.style.display = 'none';
    }
    // Oppdater klassekartet når antall elever pr gruppe endres (kun hvis grupper er valgt)
    seatingStyleInput.addEventListener('change', () => {
        if (groupSeatingRadio.checked) {
            autoGenerateSeatingChart();
        }
    });
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
    const exportPngButton = document.getElementById('export-png');
    let students = [];
    try {
        students = JSON.parse(localStorage.getItem('students')) || [];
    } catch (e) {
        console.error('Feil ved parsing av elever fra localStorage:', e);
    }
    let groupCounter = 1;
    let studentCounter = students.length;
    let totalCols = 4; // Standard antall kolonner
    let totalRows = 4; // Standard antall rader inkludert kateter-raden
    let kateterRow = totalRows; // Plasser kateteret på nederste rad
    const kateterColumn = 2; // Velg standardplassering for kateter

    // Hent flere elementer fra DOM
    const settingsButton = document.getElementById('settings-button');
    const settingsSection = document.getElementById('settings-section');
    const applySettingsButton = document.getElementById('apply-settings');
    const numRowsInput = document.getElementById('num-rows');
    const numColsInput = document.getElementById('num-cols');
    const exportSection = document.getElementById('export-section');
    const fixedSettings = document.getElementById('fixed-settings');
    const showHorseshoeCheckbox = document.getElementById('show-horseshoe');
    const horseshoeContainer = document.getElementById('horseshoe-container');
    const horseshoeSettings = document.getElementById('horseshoe-settings');
    const horseshoeLeftInput = document.getElementById('horseshoe-left');
    const horseshoeBottomInput = document.getElementById('horseshoe-bottom');
    const horseshoeRightInput = document.getElementById('horseshoe-right');

    // Legg til event listener for innstillinger-knappen
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            const isCollapsed = settingsSection.classList.contains('collapsible');
            settingsSection.classList.toggle('collapsible');
            settingsSection.setAttribute('aria-hidden', isCollapsed ? 'false' : 'true');
            fixedSettings.classList.toggle('hidden'); // Veksle synlighet av fixed-settings
        });
    }

    // Legg til event listener for å veksle sidebar
    const toggleSidebarButton = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('menu-placeholder');
    toggleSidebarButton.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        document.querySelector('header').classList.toggle('full-width');
        document.querySelector('main').classList.toggle('full-width');
    });

    // Legg til event listener for å bruke innstillinger
    applySettingsButton.addEventListener('click', () => {
        const currentGridData = saveCurrentGridData(); // Lagre nåværende grid-data
        totalRows = parseInt(numRowsInput.value);
        totalCols = parseInt(numColsInput.value);
        kateterRow = totalRows; // Oppdater kateterRow til den nye nederste raden
        renderEmptyGrid();
        loadGridData(currentGridData); // Last inn lagret grid-data
        saveCurrentGrid(); // Lagre det oppdaterte gridet
    });

    // Legg til event listeners for numRowsInput og numColsInput
    numRowsInput.addEventListener('change', () => {
        const currentGridData = saveCurrentGridData(); // Lagre nåværende grid-data
        totalRows = parseInt(numRowsInput.value);
        kateterRow = totalRows; // Oppdater kateterRow til den nye nederste raden
        renderEmptyGrid();
        loadGridData(currentGridData); // Last inn lagret grid-data
        saveCurrentGrid();
    });

    numColsInput.addEventListener('change', () => {
        const currentGridData = saveCurrentGridData(); // Lagre nåværende grid-data
        totalCols = parseInt(numColsInput.value);
        renderEmptyGrid();
        loadGridData(currentGridData); // Last inn lagret grid-data
        saveCurrentGrid();
    });

    // Funksjon for å stokke en array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Funksjon for å håndtere drag start
    function handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    // Funksjon for å håndtere drag over
    function handleDragOver(e) {
        e.preventDefault();
    }

    // Funksjon for å håndtere drop
    function handleDrop(e) {
        e.preventDefault();
        const draggableElementId = e.dataTransfer.getData('text/plain');
        const dropZone = e.target.closest('.seating-cell, .student-group, .student-container');
        const draggableElement = document.getElementById(draggableElementId);
        if (dropZone && draggableElement && dropZone !== draggableElement) {
            const dropZoneRect = dropZone.getBoundingClientRect();
            const dropPosition = {
                x: e.clientX - dropZoneRect.left,
                y: e.clientY - dropZoneRect.top
            };

            if (dropZone.classList.contains('student-group')) {
                const studentContainer = dropZone.querySelector('.student-container');
                if (dropPosition.x > dropZoneRect.width / 2) {
                    studentContainer.appendChild(draggableElement);
                } else {
                    studentContainer.insertBefore(draggableElement, studentContainer.firstChild);
                }
            } else {
                const studentsInRow = Array.from(dropZone.children).filter(child => child.classList.contains('student'));
                if (dropPosition.x > dropZoneRect.width / 2 && studentsInRow.length < 3) {
                    dropZone.appendChild(draggableElement);
                } else if (dropPosition.y > dropZoneRect.height / 2 && studentsInRow.length < 2) {
                    dropZone.appendChild(draggableElement);
                } else {
                    dropZone.insertBefore(draggableElement, dropZone.firstChild);
                }
            }

            draggableElement.classList.remove('dragging');
            saveCurrentGrid();
        }
    }

    // Funksjon for å håndtere dobbeltklikk på gruppe
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

    // Funksjon for å håndtere dobbeltklikk på elev
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

    // Funksjon for å håndtere sletting av gruppe
    function handleDeleteGroup(e) {
        const groupElement = e.target.closest('.student-group');
        if (groupElement) {
            groupElement.remove();
            saveCurrentGrid();
        }
    }

    // Funksjon for å håndtere sletting av elev
    function handleDeleteStudent(e) {
        const studentElement = e.target.closest('.student');
        if (studentElement) {
            studentElement.remove();
            saveCurrentGrid();
        }
    }

    // Funksjon for å opprette en gruppe
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

        // Juster gruppestørrelse basert på antall elever
        const baseHeight = 300; // Grunnhøyde for gruppen
        const studentHeight = 10; // Høyde for hver elev
        group.style.height = `${baseHeight + students.length * studentHeight}px`;

        return group;
    }

    // Funksjon for å opprette en elev
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

    // Funksjon for å lagre nåværende grid
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

    // Funksjon for å laste inn nåværende grid
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

    // Funksjon for å lagre nåværende grid-data
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

    // Funksjon for å laste inn grid-data
    function loadGridData(gridData) {
        gridData.forEach(cellData => {
            const cell = document.querySelector(`.seating-cell[data-row='${cellData.row}'][data-col='${cellData.col}']`);
            if (cell) {
                // Tøm eksisterende elementer i cellen
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

    // Legg til event listener for å legge til gruppe
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

    // Funksjon for å beregne antall rader som trengs
    function calculateRowsNeeded(studentCount, cols) {
        return Math.ceil(studentCount / cols) + 1; // Legg til en ekstra rad for kateteret
    }

    // Funksjon for å beregne antall kolonner som trengs
    function calculateColsNeeded(studentCount, rows) {
        return Math.ceil(studentCount / rows);
    }

    // Funksjon for å justere gridet for elever
    function adjustGridForStudents(studentCount, groupSize) {
        totalRows = calculateRowsNeeded(studentCount, totalCols);
        totalCols = calculateColsNeeded(studentCount, totalRows);
        kateterRow = totalRows; // Oppdater kateterRow til den nye nederste raden
        renderEmptyGrid();
        loadCurrentGrid(); // Last inn nåværende grid-data etter justering av gridet
    }

    // Funksjon for å render tomt grid
    function renderEmptyGrid() {
        seatingChartContainer.innerHTML = '';
        seatingChartContainer.style.gridTemplateColumns = `repeat(${totalCols}, 1fr)`; // Oppdater grid-kolonner
        seatingChartContainer.style.gap = '0.5rem'; // Juster gap ved generering
    
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
    

    // Legg til event listener for å legge til elev
    addStudentButton.addEventListener('click', () => {
        const currentGridData = saveCurrentGridData(); // Lagre nåværende grid-data
        const firstEmptyCell = Array.from(seatingChartContainer.querySelectorAll('.seating-cell')).find(cell => cell.children.length === 0 && !(parseInt(cell.dataset.row) === kateterRow && parseInt(cell.dataset.col) === kateterColumn));
        if (firstEmptyCell) {
            const studentDiv = createStudent('Ny elev');
            firstEmptyCell.appendChild(studentDiv);
        } else {
            totalRows = calculateRowsNeeded(students.length + 1, totalCols); // Beregn nødvendig antall rader
            totalCols = calculateColsNeeded(students.length + 1, totalRows); // Beregn nødvendig antall kolonner
            kateterRow = totalRows; // Oppdater kateterRow til den nye nederste raden
            renderEmptyGrid();
            loadGridData(currentGridData); // Last inn lagret grid-data
            const newFirstEmptyCell = Array.from(seatingChartContainer.querySelectorAll('.seating-cell')).find(cell => cell.children.length === 0 && !(parseInt(cell.dataset.row) === kateterRow && parseInt(cell.dataset.col) === kateterColumn));
            const studentDiv = createStudent('Ny elev');
            newFirstEmptyCell.appendChild(studentDiv);
        }
        saveCurrentGrid();
    });

    // Funksjon for automatisk generering av klassekart
    function autoGenerateSeatingChart() {
        const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
        students = names;
        localStorage.setItem('students', JSON.stringify(students));

        let seatingStyle = parseInt(seatingStyleInput.value);
        const sitOneByOne = document.getElementById('sit-one-by-one').checked;
        const sitTwoByTwo = document.getElementById('sit-two-by-two').checked;
        // Hvis "en og en" er valgt, tving seatingStyle til 1 og bruk kun én elev per plass
        if (sitOneByOne) {
            seatingStyle = 1;
        }
        adjustGridForStudents(students.length, seatingStyle);
        seatingChartContainer.innerHTML = '';

        renderEmptyGrid();

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
            if (parseInt(cell.dataset.row) === kateterRow) return;

            if (sitTwoByTwo) {
                const studentDiv1 = createStudent(shuffledStudents[currentIndex++]);
                cell.appendChild(studentDiv1);
                if (currentIndex < shuffledStudents.length) {
                    const studentDiv2 = createStudent(shuffledStudents[currentIndex++]);
                    cell.appendChild(studentDiv2);
                }
            } else if (sitOneByOne) {
                // Alltid én elev per plass, aldri grupper
                const studentDiv = createStudent(shuffledStudents[currentIndex++]);
                cell.appendChild(studentDiv);
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

        // Ensure elements remain hidden after generating the seating chart
        const elements = document.querySelectorAll('.grid-resizer.horizontal, .grid-resizer.vertical, #seating-cell');
        elements.forEach(element => {
            element.classList.add('hidden-lines');
        });

        const seatingCells = document.querySelectorAll('.seating-cell');
        seatingCells.forEach(cell => {
            cell.classList.add('hidden-border');
        });

        saveCurrentGrid();
    }

    // Legg til event listener for å fylle inn eksempelelever
    fillExampleButton.addEventListener('click', () => {
        fetch('elever.jsx')
            .then(response => response.text())
            .then(data => {
                studentTextarea.value = data.trim();
                const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
                students = names;
                localStorage.setItem('students', JSON.stringify(students));

                // Juster grid-størrelse basert på antall elever
                totalRows = Math.ceil(students.length / totalCols) + 1; // Legg til en ekstra rad for kateteret
                kateterRow = totalRows; // Oppdater kateterRow til den nye nederste raden

                if (showHorseshoeRadio.checked) {
                    renderHorseshoeLayout();
                    updateHorseshoeCounter();
                } else {
                    autoGenerateSeatingChart(); // Automatisk generering av klassekart
                }
            })
            .catch(error => {
                console.error('Feil ved henting av eksempelelever:', error);
            });
    });

    // Legg til event listener for å eksportere som PDF
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

    // Function to export seating chart as PNG
    function exportSeatingChartAsPng() {
        const seatingChart = document.getElementById('seating-chart');
        const horseshoeContainer = document.getElementById('horseshoe-container');
        const titleText = editableTitle.innerText.replaceAll(' ', '_');
        const roomNumberText = editableRoomNumber.innerText.replaceAll(' ', '_');
        const filename = `Klassekart ${titleText}-${roomNumberText}.png`;

        // Create a temporary container to hold the title and room number
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '0';
        tempContainer.style.left = '0';
        tempContainer.style.width = '100%';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '10px';
        tempContainer.style.textAlign = 'left';
        tempContainer.style.zIndex = '-1';

        const titleElement = document.createElement('h2');
        titleElement.innerText = editableTitle.innerText;
        tempContainer.appendChild(titleElement);

        const roomNumberElement = document.createElement('h3');
        roomNumberElement.innerText = editableRoomNumber.innerText;
        tempContainer.appendChild(roomNumberElement);

        document.body.appendChild(tempContainer);

        // Velg riktig container å eksportere
        let exportElement = seatingChart;
        if (!horseshoeContainer.classList.contains('hidden')) {
            exportElement = horseshoeContainer;
        }

        html2canvas(exportElement).then(canvas => {
            const context = canvas.getContext('2d');
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height + tempContainer.offsetHeight;
            const tempContext = tempCanvas.getContext('2d');

            tempContext.fillStyle = 'white';
            tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempContext.drawImage(canvas, 0, tempContainer.offsetHeight);

            html2canvas(tempContainer).then(tempCanvas2 => {
                tempContext.drawImage(tempCanvas2, 0, 0);

                const link = document.createElement('a');
                link.href = tempCanvas.toDataURL('image/png');
                link.download = filename;
                link.click();

                document.body.removeChild(tempContainer);
            });
        });
    }

    // Add event listener for export PNG button
    exportPngButton.addEventListener('click', exportSeatingChartAsPng);

    // Legg til event listener for å veksle avanserte krav
    toggleAdvancedRequirementsButton.addEventListener('click', () => {
        const isCollapsed = advancedRequirementsSection.classList.contains('collapsible');
        advancedRequirementsSection.classList.toggle('collapsible');
        toggleAdvancedRequirementsButton.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
    });

    // Funksjon for å opprette resizers
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

    // Funksjon for å starte drag
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

    // Legg til event listener for å legge til rad
    addRowButton.addEventListener('click', () => {
        const currentGridData = saveCurrentGridData(); // Lagre nåværende grid-data
        const lastRowCells = Array.from(seatingChartContainer.querySelectorAll(`.seating-cell[data-row='${totalRows}']`));
        
        if (lastRowCells.length < totalCols) {
            // Legg til ny celle i siste rad
            const newCell = document.createElement('div');
            newCell.className = 'seating-cell';
            newCell.dataset.row = totalRows;
            newCell.dataset.col = lastRowCells.length + 1;
            newCell.addEventListener('dragover', handleDragOver);
            newCell.addEventListener('drop', handleDrop);
            seatingChartContainer.appendChild(newCell);
        } else {
            // Legg til en ny rad hvis siste rad er fylt
            totalRows++;
            const newCell = document.createElement('div');
            newCell.className = 'seating-cell';
            newCell.dataset.row = totalRows;
            newCell.dataset.col = 1;
            newCell.addEventListener('dragover', handleDragOver);
            newCell.addEventListener('drop', handleDrop);
            seatingChartContainer.appendChild(newCell);
        }
        loadGridData(currentGridData); // Last inn lagret grid-data
        saveCurrentGrid();
    });

    // Legg til event listener for å fjerne rad
    removeRowButton.addEventListener('click', () => {
        const currentGridData = saveCurrentGridData(); // Lagre nåværende grid-data
        const cells = Array.from(seatingChartContainer.querySelectorAll('.seating-cell'));
        if (cells.length > 0) {
            // Fjern siste celle
            const lastCell = cells[cells.length - 1];
            lastCell.remove();
            
            // Reduser totalRows hvis siste rad blir tom
            const rowCells = cells.filter(cell => parseInt(cell.dataset.row) === totalRows);
            if (rowCells.length <= 1) {
                totalRows--;
            }
            
            loadGridData(currentGridData); // Last inn lagret grid-data
            saveCurrentGrid();
        } else {
            alert('Det er ingen flere celler å slette.');
        }
    });

    // Legg til event listener for å tilbakestille
    resetButton.addEventListener('click', () => {
        localStorage.removeItem('gridData');
        localStorage.removeItem('kateterText');
        localStorage.removeItem('editableTitle');
        localStorage.removeItem('editableRoomNumber');
        groupCounter = 1;
        studentCounter = 0;
        location.reload();
    });

    renderEmptyGrid();

    // Legg til event listener for å generere klassekart
    generateButton.addEventListener('click', () => {
        if (showHorseshoeCheckbox.checked) {
            // Hestesko: stokker elevene vilkårlig, men beholder antall på hver side
            let names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
            if (names.length === 0) {
                names = JSON.parse(localStorage.getItem('students') || '[]');
            }
            // Stokk rekkefølgen
            const shuffled = shuffle(names);
            localStorage.setItem('horseshoeOrder', JSON.stringify(shuffled));
            renderHorseshoeLayout();
        } else {
            const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
            students = names;
            localStorage.setItem('students', JSON.stringify(students));

            // Dynamically adjust the grid size based on the number of students
            totalRows = calculateRowsNeeded(students.length, totalCols);
            totalCols = calculateColsNeeded(students.length, totalRows);
            kateterRow = totalRows; // Oppdater kateterRow til den nye nederste raden

            const seatingStyle = parseInt(seatingStyleInput.value);
            const sitTwoByTwo = document.getElementById('sit-two-by-two').checked;
            seatingChartContainer.innerHTML = ''; // Tøm tidligere klassekart før ny rendering

            renderEmptyGrid(); // Render det justerte gridet

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
                if (parseInt(cell.dataset.row) === kateterRow) return; // Hopp over kateter-raden for elever

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

            // Ensure elements remain hidden after generating the seating chart
            const elements = document.querySelectorAll('.grid-resizer.horizontal, .grid-resizer.vertical, #seating-cell');
            elements.forEach(element => {
                element.classList.add('hidden-lines');
            });

            const seatingCells = document.querySelectorAll('.seating-cell');
            seatingCells.forEach(cell => {
                cell.classList.add('hidden-border');
            });
        }
    });

    // Legg til event listener for å redigere tittel
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

    // Legg til event listener for å redigere romnummer
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
                if (showHorseshoeRadio.checked) {
                    renderHorseshoeLayout();
                    updateHorseshoeCounter();
                } else {
                    autoGenerateSeatingChart(); // Automatisk generering av klassekart
                }
            };
            reader.readAsText(file);
        }
    });

    const toggleVisibilityButton = document.getElementById('toggle-visibility-button');
    toggleVisibilityButton.addEventListener('click', () => {
        const elements = document.querySelectorAll('.grid-resizer.horizontal, .grid-resizer.vertical, #seating-cell');
        elements.forEach(element => {
            element.classList.toggle('hidden-lines');
        });
       
        const seatingCells = document.querySelectorAll('.seating-cell');
        seatingCells.forEach(cell => {
            cell.classList.toggle('hidden-border');
        });
    });

    // Ensure elements are hidden by default
    const elements = document.querySelectorAll('.grid-resizer.horizontal, .grid-resizer.vertical, #seating-cell');
    elements.forEach(element => {
        element.classList.add('hidden-lines');
    });

    const seatingCells = document.querySelectorAll('.seating-cell');
    seatingCells.forEach(cell => {
        cell.classList.add('hidden-border');
    });

    // Log JavaScript errors to mapping.html
    window.onerror = function(message, source, lineno, colno, error) {
        const errorTableBody = document.querySelector('#error-table tbody');
        if (errorTableBody) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>JavaScript Error</td>
                <td class="error">${message} at ${source}:${lineno}:${colno}</td>
            `;
            errorTableBody.appendChild(row);
        }
    };

    function renderHorseshoeLayout() {
        horseshoeContainer.innerHTML = '';
        horseshoeContainer.classList.remove('hidden');
        seatingChartContainer.classList.add('hidden');

        // Get students from textarea or localStorage
        let names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
        if (names.length === 0) {
            names = JSON.parse(localStorage.getItem('students') || '[]');
        }
        if (names.length === 0) {
            horseshoeContainer.innerHTML = '<p>Ingen elever registrert.</p>';
            return;
        }

        // Calculate U-shape: left, bottom, right sides
        const total = names.length;
        let sideCount = parseInt(horseshoeLeftInput.value) || 0;
        let bottomCount = parseInt(horseshoeBottomInput.value) || 0;
        let rightCount = parseInt(horseshoeRightInput.value) || 0;
        // Juster hvis summen ikke stemmer
        if (sideCount + bottomCount + rightCount !== total) {
            sideCount = Math.floor(total / 3);
            bottomCount = total - sideCount * 2;
            rightCount = sideCount;
        }

        // Drag-and-drop helpers for horseshoe
        let horseshoeOrder = [];
        const savedOrder = localStorage.getItem('horseshoeOrder');
        if (savedOrder) {
            const arr = JSON.parse(savedOrder);
            // Bruk kun navn som finnes nå
            horseshoeOrder = arr.filter(n => names.includes(n));
            // Legg til eventuelle nye navn
            names.forEach(n => { if (!horseshoeOrder.includes(n)) horseshoeOrder.push(n); });
        } else {
            horseshoeOrder = names.slice();
        }
        function handleDragStart(e) {
            e.dataTransfer.setData('text/plain', e.target.dataset.index);
            e.target.classList.add('dragging');
        }
        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
        }
        function handleDragOver(e) {
            e.preventDefault();
        }
        function handleDrop(e) {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(e.target.dataset.index);
            if (fromIndex === toIndex) return;
            // Flytt i array
            const moved = horseshoeOrder.splice(fromIndex, 1)[0];
            horseshoeOrder.splice(toIndex, 0, moved);
            // Lagre rekkefølge
            localStorage.setItem('horseshoeOrder', JSON.stringify(horseshoeOrder));
            // Render på nytt
            renderHorseshoeLayoutWithOrder(horseshoeOrder);
        }

        function createStudentDiv(name, idx) {
            const studentDiv = document.createElement('div');
            studentDiv.className = 'student';
            studentDiv.innerText = name;
            studentDiv.draggable = true;
            studentDiv.dataset.index = idx;
            studentDiv.addEventListener('dragstart', handleDragStart);
            studentDiv.addEventListener('dragend', handleDragEnd);
            studentDiv.addEventListener('dragover', handleDragOver);
            studentDiv.addEventListener('drop', handleDrop);
            return studentDiv;
        }

        function renderHorseshoeLayoutWithOrder(order) {
            horseshoeContainer.innerHTML = '';
            const horseshoe = document.createElement('div');
            horseshoe.style.display = 'flex';
            horseshoe.style.flexDirection = 'row';
            horseshoe.style.justifyContent = 'center';
            horseshoe.style.alignItems = 'flex-end';
            horseshoe.style.gap = '2rem';

            // Left side
            let sideCount = parseInt(horseshoeLeftInput.value) || 0;
            let bottomCount = parseInt(horseshoeBottomInput.value) || 0;
            let rightCount = parseInt(horseshoeRightInput.value) || 0;
            const total = order.length;
            if (sideCount + bottomCount + rightCount !== total) {
                sideCount = Math.floor(total / 3);
                bottomCount = total - sideCount * 2;
                rightCount = sideCount;
            }
            const leftSide = document.createElement('div');
            leftSide.style.display = 'flex';
            leftSide.style.flexDirection = 'column';
            leftSide.style.justifyContent = 'flex-end';
            for (let i = 0; i < sideCount; i++) {
                leftSide.appendChild(createStudentDiv(order[i], i));
            }
            horseshoe.appendChild(leftSide);

            // Bottom side
            const bottomSide = document.createElement('div');
            bottomSide.style.display = 'flex';
            bottomSide.style.flexDirection = 'row';
            bottomSide.style.justifyContent = 'center';
            for (let i = sideCount; i < sideCount + bottomCount; i++) {
                bottomSide.appendChild(createStudentDiv(order[i], i));
            }
            horseshoe.appendChild(bottomSide);

            // Right side
            const rightSide = document.createElement('div');
            rightSide.style.display = 'flex';
            rightSide.style.flexDirection = 'column';
            rightSide.style.justifyContent = 'flex-end';
            for (let i = sideCount + bottomCount; i < sideCount + bottomCount + rightCount; i++) {
                rightSide.appendChild(createStudentDiv(order[i], i));
            }
            horseshoe.appendChild(rightSide);

            horseshoeContainer.appendChild(horseshoe);
        }

        renderHorseshoeLayoutWithOrder(horseshoeOrder);
    }

    showHorseshoeCheckbox.addEventListener('change', () => {
        if (showHorseshoeCheckbox.checked) {
            customizeHorseshoeBtn.style.display = '';
            horseshoeSettings.classList.add('hidden');
            horseshoeContainer.classList.remove('hidden');
            seatingChartContainer.classList.add('hidden');
            horseshoeContainer.innerHTML = '';
            horseshoeLeftInput.value = '';
            horseshoeBottomInput.value = '';
            horseshoeRightInput.value = '';
            // Oppdater hesteskokartet umiddelbart hvis det finnes elever
            const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
            if (names.length > 0) {
                renderHorseshoeLayout();
                updateHorseshoeCounter();
            }
        } else {
            customizeHorseshoeBtn.style.display = 'none';
            horseshoeSettings.classList.add('hidden');
            horseshoeContainer.classList.add('hidden');
            horseshoeContainer.innerHTML = '';
            seatingChartContainer.classList.remove('hidden');
        }
        localStorage.removeItem('horseshoeOrder');
    });

    // customizeHorseshoeBtn er allerede deklarert øverst
    customizeHorseshoeBtn.addEventListener('click', () => {
        horseshoeSettings.classList.toggle('hidden');
        // Sett antall elever pr side/rad ut fra elevlisten hvis elevene er lastet inn
        const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
        const total = names.length;
        if (total > 0) {
            const sideCount = Math.floor(total / 3);
            const bottomCount = total - sideCount * 2;
            horseshoeLeftInput.value = sideCount;
            horseshoeBottomInput.value = bottomCount;
            horseshoeRightInput.value = sideCount;
        }
    });


    // Helper to show warning if too many seats are distributed
    function showHorseshoeWarning(message) {
        let warningDiv = document.getElementById('horseshoe-warning');
        if (!warningDiv) {
            warningDiv = document.createElement('div');
            warningDiv.id = 'horseshoe-warning';
            warningDiv.style.color = 'red';
            warningDiv.style.fontWeight = 'bold';
            horseshoeSettings.parentNode.insertBefore(warningDiv, horseshoeSettings.nextSibling);
        }
        warningDiv.textContent = message;
    }
    function hideHorseshoeWarning() {
        const warningDiv = document.getElementById('horseshoe-warning');
        if (warningDiv) warningDiv.textContent = '';
    }

    function validateHorseshoeInputs() {
        const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
        const total = names.length;
        let left = parseInt(horseshoeLeftInput.value) || 0;
        let bottom = parseInt(horseshoeBottomInput.value) || 0;
        let right = parseInt(horseshoeRightInput.value) || 0;
        let sum = left + bottom + right;
        if (sum > total) {
            // Auto-correct the last changed input
            const over = sum - total;
            // Find which input triggered
            let active = document.activeElement;
            if ([horseshoeLeftInput, horseshoeBottomInput, horseshoeRightInput].includes(active)) {
                let val = parseInt(active.value) || 0;
                active.value = Math.max(0, val - over);
            } else {
                // fallback: reduce right
                horseshoeRightInput.value = Math.max(0, right - over);
            }
            showHorseshoeWarning('Du kan ikke fordele flere plasser enn det er elever.');
        } else {
            hideHorseshoeWarning();
        }
    }

    [horseshoeLeftInput, horseshoeBottomInput, horseshoeRightInput, studentTextarea].forEach(input => {
        input.addEventListener('input', () => {
            if (showHorseshoeCheckbox.checked) {
                validateHorseshoeInputs();
                renderHorseshoeLayout();
            }
        });
    });

    function updateHorseshoeCounter() {
        const names = studentTextarea.value.trim().split('\n').map(name => name.trim()).filter(name => name);
        const total = names.length;
        const left = parseInt(horseshoeLeftInput.value) || 0;
        const bottom = parseInt(horseshoeBottomInput.value) || 0;
        const right = parseInt(horseshoeRightInput.value) || 0;
        const fordelt = left + bottom + right;
        const gjenstar = total - fordelt;
        const counterDiv = document.getElementById('horseshoe-counter');
        counterDiv.textContent = `Plasser fordelt: ${fordelt} / ${total}  |  Gjenstår: ${gjenstar >= 0 ? gjenstar : 0}`;
    }

    [horseshoeLeftInput, horseshoeBottomInput, horseshoeRightInput, studentTextarea].forEach(input => {
        input.addEventListener('input', () => {
            if (showHorseshoeCheckbox.checked) {
                updateHorseshoeCounter();
            }
        });
    });
    // Oppdater hestesko-innstillinger når radioknappen for hestesko velges
    showHorseshoeRadio.addEventListener('change', () => {
        if (showHorseshoeRadio.checked) {
            updateHorseshoeCounter();
        }
    });
});