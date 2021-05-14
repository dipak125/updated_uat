// ************ Developed By: Sumanta ************
// ********** Last Modified By: Sumanta **********

export const validateImageExtension = (file) => {
    if (file != '') {
        //let alowedExtns = ["jpg","pdf","jpeg","gif","png","doc","docx","xls","xlsx","ppt","txt"];
        let alowedExtns = ["jpg","jpeg","gif","png"];

        let fileExtIs = file.substring(file.lastIndexOf('.') + 1);
        if(alowedExtns.indexOf(fileExtIs) != '-1') {
            return true;
        }
    }
    return false;
}

export const validateImageDocPdfExtension = (file) => {
    if (file != '') {
        let alowedExtns = ["jpg","jpeg","gif","png","doc","docx","pdf"];

        let fileExtIs = file.substring(file.lastIndexOf('.') + 1);
        if(alowedExtns.indexOf(fileExtIs) != '-1') {
            return true;
        }
    }
    return false;
}

export const validateCsvExtension = (file) => {
    if (file != '') {
        let alowedExtns = ["csv"];
        
        let fileExtIs = file.substring(file.lastIndexOf('.') + 1);
        if(alowedExtns.indexOf(fileExtIs) != '-1') {
            return true;
        }
    }
    return false;
}

export const checkWorkingHour10to5 = (value) => {
    if (value != '') {
        let hour = value.getHours();
        //let hour = parseInt(value.getHours());
        if(hour >= 10 && hour <= 17) {
            if(hour == 17) {
                let minute = value.getMinutes();
                if(minute != '00') {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

export const checkWithInServiceHours = (value) => {
    if (value != '') {
        let time = new Date(value);
        let hour = time.getHours();
        //let hour = parseInt(value.getHours());
        if(hour >= 5 && hour <= 21) {
            if(hour == 21) {
                let minute = time.getMinutes();
                if(minute != '00') {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

export const checkGreaterTimes = (time1, time2) => {
    if (time1 != '' && time2 != '') {
        let time3 = new Date(time1);
        let time4 = new Date(time2);
        
        if (time3.getTime() > time4.getTime()) {
            return true;
        }
    }
    return false;
}

export const checkGreaterStartEndTimes = (time1, time2) => {
    if (time1 != '' && time2 != '') {
        let time3 = new Date(time1);
        let time4 = new Date(time2);
        
        if (time3.getTime() < time4.getTime()) {
            return true;
        }
    }
    
    if(typeof time2 == 'undefined'){
        return true;
    }

    return false;
}

export const compareStartEndYear = (time1, time2) => {
    if (time1 != '' && time2 != '') {
        let time3 = new Date(time1)
        let time4 = new Date(time2)
        if (time3.getFullYear() <= time4.getFullYear()) {
            return true;
        }
    }
    
    if(typeof time2 == 'undefined'){
        return true;
    }

    return false;
}

export const checkDateLessOrEqual = (time1, time2) => {
    if (time1 != '' && time2 != '') {
        let time3 = new Date(time1);
        let time4 = new Date(time2);
        
        if (time3.getTime() <= time4.getTime()) {
            return true;
        }
    }
    return false;
}

export const checkDateEqual = (time1, time2) => {
    if (time1 != '' && time2 != '') {
        let time3 = new Date(time1);
        let time4 = new Date(time2);
      
        if (time3.getTime() != time4.getTime()) {
            return true;
        }
    }
    return false;
}

export const validateTotalServiceHours = (serviceRange, totalHours) => {
    totalHours = totalHours || 8;

    if (serviceRange) {
        if(gettingHours(serviceRange[0], serviceRange[1]) <= totalHours) {
            return true;
        }
    }
    return false;
}

// The format time1 and time2 must be like 5:30 or 21:00
const gettingHours = (time1, time2) => {
    const time1Arr = time1.split(':');
    const time2Arr = time2.split(':');

    const constHourDiff = time2Arr[0] - time1Arr[0];
    const constMinDiff = time2Arr[1] - time1Arr[1];
    if(constMinDiff <= 0) {
        return constHourDiff;
    } else {
        return constHourDiff+1;
    }
}

export const checkWithInServiceHoursRange = (value) => {
    if (value != '') {
        const time1Arr = value[0].split(':');
        const time2Arr = value[0].split(':');

        if(time1Arr[0] >= 5 && time1Arr[0] <= 21 && time2Arr[0] >= 5 && time2Arr[0] <= 21) {
            if(time2Arr[0] == 21) {
                if(time2Arr[1] != '00') {
                    return false; 
                }
            }
            return true;
        }
    }
    return false;
}

export const validServiceHourRange = (value) => {
    if (value != '') {
        const time1Arr = value[0].split(':');
        const time2Arr = value[1].split(':');

        const constHourDiff = time2Arr[0] - time1Arr[0];
        const constMinDiff = time2Arr[1] - time1Arr[1];

        if(constHourDiff >= 0) {
            if(constHourDiff == 0 && constMinDiff < 0) {
                return false;
            }
            return true;
        }
    }
    return false;
}


export const validRegistrationNumber = (value) => {
    var str = /^[A-Z]{2}(?:[A-Z])?(?:[0-9]{1,2})?(?:[ABCDEFGHJKLMNPQRSTUVWXYZ])?(?:[ABCDEFGHJKLMNPQRSTUVWXYZ]{2})?[0-9]{4}$/;
    
    if ( value && value != "NEW" && (value != '' || value != undefined) ) {  
        if(value.match(str)) {    
            let regnoLength = value && value !="" && value.length > 4 ? value.length : 0
            let subString = regnoLength > 4 ? value.substring(regnoLength-4, regnoLength) : 0
            if (subString <= 0) {
                return false;
            }         
            else return true;  
        }
        else return false;
    }
     return true;
}

export const registrationNumberLastBlock = (value) => {
    var str = /^[0-9]*$/;
        if(value && value.match(str)) {    
            if (value == 0) {
                return false;
            }         
            else return true;  
        }
        else return false;
}

export const validRegistrationNumberOD = (value) => {
    var str = /^[A-Z]{2}(?:[A-Z])?(?:[0-9]{1,2})?(?:[ABCDEFGHJKLMNPQRSTUVWXYZ])?(?:[ABCDEFGHJKLMNPQRSTUVWXYZ]{2})?[0-9]{4}$/;
    
    if ( value && (value != '' || value != undefined) ) {  
        if(value.match(str)) {    
            let regnoLength = value && value !="" && value.length > 4 ? value.length : 0
            let subString = regnoLength > 4 ? value.substring(regnoLength-4, regnoLength) : 0
            if (subString <= 0) {
                return false;
            }         
            else return true;  
        }
        else return false;
    }
     return false;
}

export const validSGTINcheck = (value) => {
    var str = /^[0-9]{2}[A-Z]{3}[A,B,C,F,G,H,L,J,P,T]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
    
    if ( value && (value != '' || value != undefined) ) {  
        if(value.match(str)) {    
            let gstLength = value && value !="" && value.length > 4 ? value.length : 0
            let subString = gstLength > 4 ? value.substring(0, 2) : 0
            if (subString < 1 || subString > 37 ) {
                return false;
            }         
            else return true;  
        }
        else return false;
    }
     return true;
}

export const alphanumericCheck = (value) => {
    var str = /((^[0-9]+[a-zA-Z.,-\s]+)|(^[a-zA-Z.,-\s]+[0-9]+))+[0-9a-zA-Z.,-\s]+$/i ;
    // var str = /^(?=.*?[a-zA-Z.,-\s])(?=.*?\d)[a-zA-Z.,-\s\d]+$/i

    if(value.match(str)) {    
            return true;
        }   
    else return false;  
}

export const fullNameValidation = (value) => {
    
    if ( value && (value != '' || value != undefined) ) {  
        var dataArr = value.split(" ")
        if(dataArr.length > 1 && dataArr[1] != "")
        return true
    }
     return false;
}

export const addressValidation = (value) => {
    var str1 = /^[0-9]*$/g ;
    var str2 = /^[a-zA-Z]*$/g ;
    var str3 = /^([a-zA-Z0-9]+[-,./]?\s?)*[a-zA-Z0-9-,./]+$/g
    var a = 0
    var b = 0
    
    if ( value && (value != '' || value != undefined) && value.match(str3)) {  
        var dataArr = value.split("")     
        for(var i =0 ; i<dataArr.length; i++) {
            if( dataArr[i].match(str1) ) {
                a++
            }   
            else if( dataArr[i].match(str2) ) {
                b++
            }   
        }  
        if(b > 0 || (a > 0 && b > 0) ){
            return true;
        }    
    }
     return false;
}
