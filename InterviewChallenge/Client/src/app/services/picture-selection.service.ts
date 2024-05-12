import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommandHandler, CommandFactory } from './command-factory';

import { BackendCommunicationService } from './backend-communication.service';

export class DropDownOption {
    constructor(
        public index: number,
        public label: string, 
        public value: string
    ) { }
}

export class DropDownData {
    constructor(
        public options: DropDownOption[],
        public selectedIndex: number,
        public disabled: boolean
    ) { }
}

@Injectable({
    providedIn: 'root',
})

// Manages any communication related to the picture selector
// Components should use this service to get/request their picture related data
// This is the layer between the backend-communication.service and the components

export class PictureSelectionService {
    public static GET_PICTURE_SELECTOR: string = 'pictures:getSelector';

    private commandCollection: Map<string, CommandHandler<any>>;

    constructor(
        private communicationServer: BackendCommunicationService
    ) {
        this.commandCollection = new Map<string, CommandHandler<any>>();
    }
    // Add public methods here (you may also need to add code to the constructor)
    public getPictureSelector(selectorCallback: (response: DropDownData) => DropDownData ) {
      this.subscribeToUpdates(
        PictureSelectionService.GET_PICTURE_SELECTOR,
        selectorCallback.bind(this)
      );
      this.communicationServer.sendCommand(
        PictureSelectionService.GET_PICTURE_SELECTOR
      );
    }    

    private subscribeToUpdates( command: string, callback: (response: any) => void ): Subscription {
        let updatingCommand: CommandHandler<any> = this.commandCollection.get(command)!;
        // Lazy load
        if ( updatingCommand == null ) {
            updatingCommand = this.createCommand( command );
        }

        return updatingCommand.responseUpdates.subscribe( callback );
    }

    private createCommand( command: string ): CommandHandler<any> {
        const newCommand: CommandHandler<any> = CommandFactory.Create( command )!;
        this.commandCollection.set( command, newCommand );
        this.communicationServer.registerUpdateHandler(
            command, newCommand.handleResponse.bind(newCommand)
        );

        return newCommand;
    }
}
