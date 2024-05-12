import { DropDownOption } from "./DropDownOption";

export interface DropDownData {    
    options: DropDownOption[],
    selectedIndex: number,
    disabled: boolean
    
}