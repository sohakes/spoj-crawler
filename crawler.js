var request = require('request');
var jsdom = require("jsdom");
var fs = require('fs');
var readlineSync = require('readline-sync')

var cookieJar = request.jar();
request = request.defaults({jar: true})

link = "http://br.spoj.com"

writeToFile = function(link, outResponse) {
  request({url: link, header: outResponse.headers}, function(error, response, html){
    if(!error){
      jsdom.env({html: html, done: function (err, window) {
        txtarea = window.document.body.querySelector("#file").value
        name = window.document.body.querySelector("[name=problemcode]").value
        fs.writeFile("./submissions/"+name, txtarea, function(err) {
          if(err) {
            return console.log(err);
          }
        });
        console.log("The file " + name + " was saved.");

        // free memory associated with the window
        window.close();
      }});
    }
  })
}

getthing = function(outResponse, url){
  request({url: url, header: outResponse.headers}, function(error, response, html){
    if(!error){
      jsdom.env({html: html, done: function (err, window) {
        links = window.document.body.querySelectorAll(".kol1")
        for (i = 0; i < links.length; ++i) {
          if(links[i].textContent.search("accepted") != -1) {
            code = links[i].querySelectorAll(".statustext")[0].textContent.trim()
            problemName = /^.+\/(.+),/.exec(url)[1]
            realLink = "http://br.spoj.com/submit/" + problemName + "/id=" + code
            writeToFile(realLink, outResponse)
          }
        }
        window.close();
      }});
    }
  })
}

getPages = function(outResponse, url){
  request({url: url, header: outResponse.headers}, function(error, response, html){
    if(!error){
      jsdom.env({html: html, done: function (err, window) {
        pages = window.document.body.querySelectorAll("#content table a")
        for (i = 0; i < pages.length; ++i) {
          if (pages[i].innerHTML) {
            pageLink = pages[i].getAttribute("href")
            console.log(pageLink + " " + pages[i].innerHTML)
            getthing(outResponse, link + pageLink)
          }
        }
        getthing(outResponse, url)
        window.close();
      }});
    }
  })
}

var login;
var password;

if(process.argv.length < 4) {
  var login = readlineSync.question('login: ');
  var password = readlineSync.question('password: ', {
    hideEchoBack: true
  });
} else {
  login = process.argv[2]
  password = process.argv[3]
}

request.post({url: "http://www.spoj.com/login/", form: {login_user: login, password: password}}, function(error, response, body){
  if (error) {
    console.log("Error logging in");
  } else {
    getPages(response, "http://br.spoj.com/users/" + login + "/")
  }
})
