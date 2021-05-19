
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

export const prevEndDate = (value) => {
    var day =  value.getDate() - 1
    var month = value.getMonth()
    var year =   value.getFullYear() + 1
    var endDate = new Date(year,month,day)
    return endDate
}

export const currentEndDate = (value) => {
    if(value){
        var day =  value.getDate() - 1
        var month = value.getMonth()
        var year =   value.getFullYear() + 5
        var endDate = new Date(year,month,day)
        return endDate
    }
    
}
export const fourwheelerODEndDate = (value) => {
    if(value){
        var day =  value.getDate() - 1
        var month = value.getMonth()
        var year =   value.getFullYear() + 3
        var endDate = new Date(year,month,day)
        return endDate
    }
    
}

export const paymentGateways = (values,policyHolder,refNumber, productId) => {
    // if (values.gateway == 2) {
        // console.log("Vedvag_gateway")
        // window.location.href = `#/Vedvag_gateway/${productId}?access_id=${refNumber}`
    // }
    // else if(values.slug && values.gateway == 1) {
        // if(values.slug == "csc_wallet") {
            // payment(refNumber)
        // }
        // if(values.slug == "razorpay") {
            // Razor_payment(refNumber)
        // }
        // if(values.slug == "PPINL") {
            // paypoint_payment(refNumber)
        // }
        // if(values.slug == "sahi_wallet") {
            // window.location.href = `#/Sahipay_gateway/${productId}?access_id=${refNumber}` 
        // }
    // }
	
	if (values.slug == 'vedavaag_wallet') {
        console.log("Vedvag_gateway")
        window.location.href = `#/Vedvag_gateway/${productId}?access_id=${refNumber}`
    }
	if(values.slug == "csc_wallet") {
		payment(refNumber)
	}
	if(values.slug == "razorpay") {
		Razor_payment(refNumber)
	}
	if(values.slug == "PPINL") {
		paypoint_payment(refNumber)
	}
	if(values.slug == "sahi_wallet") {
		window.location.href = `#/Sahipay_gateway/${productId}?access_id=${refNumber}` 
    }
}

function payment(refNumber) {
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_motor.php?refrence_no=${refNumber}`
}

function Razor_payment(refNumber) {
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/pay.php?refrence_no=${refNumber}`
}

function paypoint_payment(refNumber) {
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${refNumber}`
}