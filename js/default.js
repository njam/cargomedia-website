const fluidvids = require('fluidvids.js')();

fluidvids.init({
  selector: ['iframe'], // runs querySelectorAll()
  players: ['www.youtube.com', 'player.vimeo.com'] // players to support
});

var url ='/img/icons.svg';
var c=new XMLHttpRequest(); c.open('GET', url, false); c.setRequestHeader('Content-Type', 'text/xml'); c.send();
document.body.insertBefore(c.responseXML.firstChild, document.body.firstChild);

