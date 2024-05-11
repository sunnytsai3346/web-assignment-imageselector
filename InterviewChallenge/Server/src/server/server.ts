import * as express from "express";
import * as http from 'http';
import * as WebSocket from 'ws';
import { ClientCommandProcessor } from "./command-processor";

// Sets up the listener on port 3000 and passes each new client connection
// to a ClientCommandProcessor to manage

class MainServer {
    private clientCommandProcessors: ClientCommandProcessor[];

    constructor() {
        this.clientCommandProcessors = [];
        this.initSocketConnection();
    }

    private initClientListener(socket: WebSocket) {
        // TODO: clean up old client connections
        // create a new command processor to handle the new client connection
        this.clientCommandProcessors.push(
            new ClientCommandProcessor( socket )
        );
    }

    private initSocketConnection() {
        // set up socket.io and bind it to our http server.
        const app = express();
        
        //initialize a simple http server
        const server = http.createServer(app);

        //initialize the WebSocket server instance
        const wss = new WebSocket.Server({ server });

        wss.on("connection", this.initClientListener.bind(this) );

        // start listening on port 3000
        server.listen(3000, 
            function() {
                console.log("Server listening on *:3000");
            }
        );
    }
}

const mainServer = new MainServer();