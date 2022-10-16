let name = document.getElementById('name');


let i = 0;
const text = 'Rijat Alizade';
const speed = 100;

function typing() {
    if (i < text.length) {
    document.getElementById('name').innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
}

setInterval(() => {
    typing()

}, 1000)