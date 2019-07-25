import * as Plotly from "plotly.js"

window.onload = event => {
    let root = document.getElementById('root');
    Plotly.plot(root, [{ x: [1, 2, 3, 4, 5], y: [1, 2, 4, 8, 16] }], { margin: { t: 0 } });
}