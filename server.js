var fs = require("fs");
var mkdirp = require("mkdirp");
var zmq = require("zmq");
var responder = zmq.socket("asyncrep");
 
var argv = require('optimist')
    .default({ 
      bind: 'tcp://*:6666',
      pidFolder: "/tmp/process_manager" 
    })
    .argv;

console.log("listening on " + argv.bind);

responder.bind(argv.bind);
var spawn = require("child_process").spawn;

responder.on("message", function(data, response) {
  
  var message = JSON.parse(data.toString());
  console.log("Data from requester" + " " + JSON.stringify(message));
  
  
  var child = spawn(message.cmd, message.params,{ detached: true });
  response.send("OK child services running" + child.pid);  
  console.log("Process pid: " + child.pid);

  mkdirp(argv.pidFolder + "/" + message.id, function(error) {
    if(error) console.error(error);
    else{
      console.log("folders have been created");
      fs.writeFile(argv.pidFolder + "/" +  message.id + "/" + child.pid, "", function(error) {
        if (error) console.error(error)
        else console.log("file created!");
      });
    }
  
  child.unref();
  });
});

