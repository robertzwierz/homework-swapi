class People {
  constructor(name, height, mass, created) {
    this.name = name;
    this.height = height;
    this.mass = mass;
    this.created = created;
  }
}

class Planet {
  constructor(name, climate, population, created) {
    (this.name = name),
      (this.climate = climate),
      (this.population = population),
      (this.created = created);
  }
}

class Film {
  constructor(title, director, release_date, created) {
    this.title = title;
    this.director = director;
    this.release_date = release_date;
    this.created = created;
  }
}

class Species {
  constructor(name, classification, average_height, created) {
    (this.name = name),
      (this.classification = classification),
      (this.average_height = average_height),
      (this.created = created);
  }
}

class Vehicles {
  constructor(name, model, manufacture, created) {
    (this.name = name),
      (this.model = model),
      (this.manufacture = manufacture),
      (this.created = created);
  }
}

class Starships {
  constructor(name, model, manufacturer, created) {
    (this.name = name),
      (this.model = model),
      (this.manufacturer = manufacturer),
      (this.created = created);
  }
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchAvailableDataLinks() {
  const BASE_URL = "https://swapi.dev/api/";
  try {
    const data = await fetchData(BASE_URL);
    return data;
  } catch (error) {
    console.error("Error fetching:", error);
  }
}

async function displayDataButtons() {
  const dataLinks = await fetchAvailableDataLinks();
  const buttonsContainer = document.querySelector(".buttons-container");

  for (const key in dataLinks) {
    if (dataLinks.hasOwnProperty(key)) {
      const button = document.createElement("button");
      button.textContent = key.toUpperCase();
      button.addEventListener("click", () =>
        fetchAndDisplayData(dataLinks[key])
      );
      buttonsContainer.appendChild(button);
    }
  }
}

async function fetchAndDisplayData(endpoint) {
  const dataList = await fetchAllPages(endpoint);

  const processedDataList = dataList.map((item) => {
    if (endpoint.includes("films")) {
      return new Film(
        item.title,
        item.director,
        item.release_date,
        item.created
      );
    } else if (endpoint.includes("people")) {
      return new People(item.name, item.height, item.mass, item.created);
    } else if (endpoint.includes("planet")) {
      return new Planet(item.name, item.climate, item.population, item.created);
    } else if (endpoint.includes("species")) {
      return new Species(
        item.name,
        item.classification,
        item.average_height,
        item.created
      );
    } else if (endpoint.includes("vehicles")) {
      return new Vehicles(
        item.name,
        item.model,
        item.manufacture,
        item.created
      );
    } else if (endpoint.includes("starships")) {
      return new Starships(
        item.name,
        item.model,
        item.manufacturer,
        item.created
      );
    }
  });

  currentDataList = processedDataList;

  implementPagination(currentDataList, 7);
}

async function fetchAllPages(endpoint) {
  let results = [];
  let nextPage = endpoint;

  while (nextPage) {
    const data = await fetchData(nextPage);
    results = results.concat(data.results);
    nextPage = data.next;
  }

  return results;
}

function displayDetails(dataItem) {
  const sidebar = document.createElement("div");
  sidebar.classList.add("sidebar");

  const detailsList = document.createElement("ul");
  for (const key in dataItem) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<strong>${key}:</strong> ${dataItem[key]}`;
    detailsList.appendChild(listItem);
  }
  sidebar.appendChild(detailsList);

  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => sidebar.remove());
  sidebar.appendChild(closeButton);

  document.body.appendChild(sidebar);
}

function displayDeleteModal(index) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `
    <p>Are you sure you want to delete this item?</p>
    <button id="modal-yes">YES</button>
    <button id="modal-no">NO</button>
  `;
  modal.appendChild(modalContent);

  modalContent.querySelector("#modal-yes").addEventListener("click", () => {
    deleteItem(index);
    modal.remove();
  });

  modalContent
    .querySelector("#modal-no")
    .addEventListener("click", () => modal.remove());

  document.body.appendChild(modal);
}

function deleteItem(index) {
  console.log("Deleting item at index:", index);
}

function implementPagination(dataList, itemsPerPage) {
  const paginationContainer = document.querySelector(".pagination-container");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(dataList.length / itemsPerPage);

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.addEventListener("click", () => changePage(-1));

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.addEventListener("click", () => changePage(1));

  const pageNumberInput = document.createElement("input");
  pageNumberInput.type = "number";
  pageNumberInput.min = 1;
  pageNumberInput.max = totalPages;
  pageNumberInput.value = 1;

  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(nextButton);
  paginationContainer.appendChild(pageNumberInput);

  function changePage(offset) {
    let currentPage = parseInt(pageNumberInput.value) + offset;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    pageNumberInput.value = currentPage;
    displayDataTablePage(dataList, currentPage, itemsPerPage);
  }

  displayDataTablePage(dataList, 1, itemsPerPage);
}

function displayDataTablePage(dataList, page, itemsPerPage) {
  const table = document.getElementById("data-table");
  table.innerHTML = "";

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, dataList.length);

  const headers = Object.keys(dataList[0]);
  const headerRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  for (let i = startIndex; i < endIndex; i++) {
    const dataItem = dataList[i];
    const row = document.createElement("tr");
    headers.forEach((header) => {
      const cell = document.createElement("td");
      cell.textContent = dataItem[header];
      row.appendChild(cell);
    });

    const detailsButton = document.createElement("button");
    detailsButton.textContent = "DETAILS";
    detailsButton.addEventListener("click", () => displayDetails(dataItem));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "DELETE";
    deleteButton.addEventListener("click", () => displayDeleteModal(i));

    row.appendChild(detailsButton);
    row.appendChild(deleteButton);

    table.appendChild(row);
  }
}

async function init() {
  await displayDataButtons();
}

init();
