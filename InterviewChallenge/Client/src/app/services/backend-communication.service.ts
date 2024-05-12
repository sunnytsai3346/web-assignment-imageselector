import { Injectable } from '@angular/core';

// This service is intended to be used by other services, not
// directly by components; create other services that provide
// access to the backend API for components and have those services
// use this layer to actually perform the communication

// callback to match up explicit client calls with their backend response
export type ResponseProcessor = (response: any) => void;

// callbacks that accept push notifications from the backend
// params: { paramName1: paramValue1, paramName2: paramValue2, ... }
export type UpdateProcessor = ( params: any ) => void;

// class for holding the JSON-RPC command in a format that stringifies well
class JsonRpcCommand {
    public jsonrpc: string = '2.0';

    constructor(
        public id: number,
        public method: string,
        public params: any = {}
    ) {}
}

@Injectable({
    providedIn: 'root',
})

// Actually manages talking over the socket with the backend
// Keeps collections of callbacks to match responses with client
// calls/subscriptions, so data gets where it was intended

export class BackendCommunicationService {
    private socket: WebSocket;

    private messageID: number;

    // matches up responses with the message that made the request
    private responseCallbacks: Map<number, ResponseProcessor>;

    // used for updates initiated from the backend
    private updateCallbacks: Map<string, UpdateProcessor>;

    constructor() {
        this.updateCallbacks = new Map<string, UpdateProcessor>();
        this.responseCallbacks = new Map<number, ResponseProcessor>();
        this.messageID = 0;

        this.initSocketConnection();
    }

    public initSocketConnection() {
        this.socket = new WebSocket('ws://localhost:3000');
        this.socket.onmessage = this.processServerMessage.bind(this);
    }

    public registerUpdateHandler( command: string, callback: UpdateProcessor ) {
        this.updateCallbacks.set( command, callback );     // register the callback
    }

    // actually send the message through the socket
    // params need to be an object of the form
    // { paramName1: paramValue1, paramName2: paramValue2, ... }
    public sendCommand( method: string, params?: any ): Promise<any> {
        return new Promise(
            (resolve, reject) => {
                if ( this.socket.readyState === this.socket.CLOSED
                    || this.socket.readyState === this.socket.CLOSING
                ) {
                    reject('Websocket no longer available');
                } else {
                    
                    if ( method == null || method.length < 1 ) {
                        reject('Method (command name) is required!');
                    }

                    // store a temporary callback to process this response
                    // using the message.id to identify the call/response pair
                    const messageID: number = this.messageID++;
                    this.responseCallbacks.set( messageID,
                        (response: any) => {
                            resolve(response);
                        }
                    );
                    let queryString = JSON.stringify( new JsonRpcCommand( messageID, method, params ) )
                    if (this.socket.readyState === this.socket.CONNECTING) {
                        // if websocket is in connecting stage, pause for 400ms before sending the message through it
                        setTimeout(() => {
                          if (this.socket.readyState === this.socket.OPEN) {
                            this.socket.send(queryString);
                          } else {
                            reject('Method (command name) is required!');
                          }
                        }, 400);
                      } else {
                        this.socket.send(queryString);
                      }
                  
                }
            }
        );
    }

    // handle a message the has come in from the backend
    private processServerMessage(event: MessageEvent) {
        // Extract the message
        const message: any = JSON.parse(event.data);
        if ( message != null && message.hasOwnProperty('method')
        ) {
            // Response to a request we made to the backend
            if ( message.hasOwnProperty('id') && message.id != null ) {
                // find the appropriate callback to process the response to the client's request
                const callback: ResponseProcessor = this.responseCallbacks.get( message.id )!;
                if ( callback != null ) {
                    callback( message.result );
                }
                this.responseCallbacks.delete(message.id);  // unregister the callback
            } else {
                // updates (push notifications) from the backend do not have an id
                // find/use the appropriate callback to pass the update to the CommandHandler,
                // who will inform its subscribers of the update
                const callback: UpdateProcessor = this.updateCallbacks.get( message.method )!;
                if ( callback != null ) {
                    callback( message.result );
                }
            }
        }
    }
}
