import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf, NgFor, UpperCasePipe } from '@angular/common';
import { PictureSelectionService} from './services/picture-selection.service';
import { DropDownData} from './model/DropDownData';
import { DropDownOption} from './model/DropDownOption';


@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet,NgIf, NgFor, UpperCasePipe]
})
export class AppComponent implements OnInit {
  title = 'Client';  
  public picData: DropDownData;
  selectedOption?: DropDownOption;
  
  // constructor : add injector
  constructor(private injector: Injector) {
  }

  ngOnInit(): void {
    // Use injector to dynamically get PictureSelectionService instance
    const pictureSelectionService = this.injector.get(PictureSelectionService);
    // Initializes socket connection
    pictureSelectionService.getPictureSelector(this.selectorCallback);
  }
  
  //call back function 
  private selectorCallback = (response: DropDownData): DropDownData => {
    this.picData = response || this.picData;
    return this.picData;
  }
  
  onSelect(selectedOption: DropDownOption): void {
    this.selectedOption = selectedOption;    
  }


}
