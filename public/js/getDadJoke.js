const url = "https://icanhazdadjoke.com";

const options = {
  headers: {
    Accept: "application/json"
  }
};

window.onload = event => {
    fetch(url, options)
  .then( res => res.json() )
  .then( data => {

    joke = data.joke
    renderArea = document.querySelector("#dadJoke");

    renderArea.innerHTML = `<b>${joke}</b>`;
  });
}