const fs = require("fs");
const html = fs.readFileSync("D:\\Projeto\\Desenvolvendo\\DinoSurvival\\tmp-current.html", "utf8");
const start = html.indexOf("<script>");
const end = html.indexOf("</script>", start + 8);
const js = html.substring(start + 8, end);
const lines = js.split("\n");
const patterns = [
    "DirectionalLight", "AmbientLight", "Hemi", "sunLight",
    "clearColor", "updateDayNight", "dayTime", "night",
    "keydown", "keyup", "attack", "eatOrDrink", "rideDino",
    "mouse", "addEventListener"
];
for (let i = 0; i < lines.length; i++) {
    for (const p of patterns) {
        if (lines[i].includes(p)) {
            console.log((i + 1) + ": " + lines[i].trim().substring(0, 120));
            break;
        }
    }
}
