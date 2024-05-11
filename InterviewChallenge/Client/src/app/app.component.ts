import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf, NgFor, UpperCasePipe } from '@angular/common';
import {
  DropDownData,
  DropDownOption,
  PictureSelectionService,
} from './services/picture-selection.service';



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
  constructor(private pictureSelectionSerice: PictureSelectionService) {
  }

  ngOnInit(): void {
    // Initializes socket connection
    this.pictureSelectionSerice.getPictureSelector(this.selectorCallback);
  }
  
  
  //call back function 
  private selectorCallback = (response: DropDownData): DropDownData => {
 //   console.log('Before modification:', this.picData);
    if (response) {     
      this.picData = response;        
    } 
 //   console.log('After modification:', this.picData);
    return this.picData;
  }
  
  onSelect(selectedOption: DropDownOption): void {
    this.selectedOption = selectedOption;
    
  }

  

  
  
  
  
}
