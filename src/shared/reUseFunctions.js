
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

	if(policyHolder.hasOwnProperty("renewalinfo")) {
        if (values.slug == 'vedavaag_wallet') {
            window.location.href = `#/Vedvag_gateway/${productId}?access_id=${refNumber}`
        }
        if(values.slug == "csc_wallet") {
            payment_renewal(refNumber, productId)
        }
        if(values.slug == "razorpay") {
            Razor_payment_renewal(refNumber)
        }
        if(values.slug == "sahi_wallet") {
            window.location.href = `#/Sahipay_gateway/${productId}?access_id=${refNumber}` 
        }
        
    }
    else {
        if (values.slug == 'vedavaag_wallet') {
            window.location.href = `#/Vedvag_gateway/${productId}?access_id=${refNumber}`
        }
        if(values.slug == "csc_wallet") {
            payment(refNumber, productId)
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
}

function payment(refNumber, productId) {
	const motor_productIds = [2,3,4,6,7,8,11,15,16,17,18];
    productId = parseInt(productId)
	if(motor_productIds.includes(productId)){
		window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_motor.php?refrence_no=${refNumber}`
	}else{
		window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment.php?refrence_no=${refNumber}`
	} 
}

function Razor_payment(refNumber) {
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/pay.php?refrence_no=${refNumber}`
}

function paypoint_payment(refNumber) {
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${refNumber}`
}

// -------------------------- Renewal Gateway -----------------------------------------------
function payment_renewal(refNumber, productId) {

    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_renewal.php?refrence_no=${refNumber}`
}

function Razor_payment_renewal(refNumber) {
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/renewal_pay.php?refrence_no=${refNumber}`
}