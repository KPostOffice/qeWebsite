
container = document.getElementById("content");

function updateImage () {

  if( ! document.getElementById("pngFromSvg")) {
    img = new Image();
    document.body.appendChild(img);
    img.setAttribute('id', "pngFromSvg");
    img.style.visibility = "hidden";
    aTag = document.createElement('a');
    aTag.innerHTML = '<button>Download SVG</button>' ;
    aTag.setAttribute("download", "myGraph");
    container.appendChild(aTag);
    input = document.createElement("input");
    input.type = "text";
    input.setAttribute("placeholder", "Enter file name");
    input.setAttribute("onchange", "updateDownload();");
    container.append(input);
  }

}

function updateDownload() {
   var svg = document.getElementById('graph'),
      xml = new XMLSerializer().serializeToString(svg),
      data="data:image/svg+xml;base64," + btoa(xml);

  if( ! document.getElementById("pngFromSvg")) {
    img = new Image();
    document.body.appendChild(img);
    img.setAttribute('id', "pngFromSvg");
    img.style.visibility = "hidden";
    aTag = document.createElement('a');
    aTag.innerHTML = '<button>Download SVG</button>' ;
    aTag.setAttribute("download", "myGraph");
    container.appendChild(aTag);
    input = document.createElement("input");
    input.type = "text";
    input.setAttribute("placeholder", "Enter file name");
    input.setAttribute("onchange", "updateDownload();");
    container.append(input);
  }

  aTag.setAttribute("href", data);
  img.setAttribute('src', data);

  aTag.setAttribute("download", input.value);
}
