function createLoadingsTable(loadings) {
    // get the container for the table
    const container = document.querySelector("#loadings");

    // create a table element and add it to the container
    const table = document.createElement("table");
    container.appendChild(table);

    // create thead element and add it to the table
    const thead = document.createElement("thead");
    table.appendChild(thead);

    // create a table header row and add it to the thead
    const headerRow = thead.insertRow();
    const headers = ["Attribute", "PC1", "PC2", "PC3", "PC4", "Sum of Squared Loadings"];
    for (let i = 0; i < headers.length; i++) {
        const cell = headerRow.insertCell();
        cell.textContent = headers[i];
    }

    // create a table body and add it to the table
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    // loop through each variable and add a row to the table
    for (let i = 0; i < loadings.length; i++) {
        const row = tbody.insertRow();
        const variableCell = row.insertCell();
        variableCell.textContent = loadings[i][0];
        for (let j = 1; j <= 4; j++) {
            const cell = row.insertCell();
            if (typeof loadings[i][j] === 'number') {
                cell.textContent = loadings[i][j].toFixed(3);
            } else {
                cell.textContent = loadings[i][j];
            }
        }
        const ssqCell = row.insertCell();
        if (typeof loadings[i][5] === 'number') {
            ssqCell.textContent = loadings[i][5].toFixed(3);
        } else {
            ssqCell.textContent = loadings[i][5];
        }

        if (i < 4) {
            row.classList.add("highlight");
        }
    }

}
