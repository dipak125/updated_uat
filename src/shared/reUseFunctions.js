
export const registrationNoFormat = (e, numLength) => {
    
    let regno = e
    let formatVal = ""
    let regnoLength = regno.length
    var letter = /^[a-zA-Z]+$/;
    var number = /^[0-9]+$/;
    let subString = regno.substring(regnoLength-1, regnoLength)
    let preSubString = regno.substring(regnoLength-2, regnoLength-1)

    if(subString.match(letter) && preSubString.match(letter)) {
        formatVal = regno
    }
    else if(subString.match(number) && preSubString.match(number) && regnoLength == 6 && numLength == 8) {
        formatVal = formatVal = regno.substring(0, regnoLength-1) + " " +subString
    } 
    else if(subString.match(number) && preSubString.match(letter)) {        
        formatVal = regno.substring(0, regnoLength-1) + " " +subString      
    } 
    else if(subString.match(letter) && preSubString.match(number)) {
        formatVal = regno.substring(0, regnoLength-1) + " " +subString   
    } 

    else formatVal = regno.toUpperCase()
    
    return formatVal

}