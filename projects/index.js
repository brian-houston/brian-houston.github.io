import metadata from "./metadata.js";

document.querySelector("canvas").style.position = "fixed";
let container = document.querySelector(".projects-container");

metadata.sort((a,b) => a.sortWeight - b.sortWeight);

metadata.forEach(d => {
    let html = `
    <a href="${d.address}" target="_blank" rel="noopener noreferrer">
        <div class="project rounded mx-3 my-3 text-light">
            <img src="${d.thumbnail}" class="rounded">
            <div class="project-text-container d-flex flex-column justify-content-center align-items-center px-3">
                <h5 class="h5 text-center">${d.name}</h5>
                <p class="text-center">${d.description}</p>
            </div>
        </div>
    </a>`

    html.trim();

    let el = document.createElement("div");
    el.innerHTML = html;

    container.appendChild(el);
});
