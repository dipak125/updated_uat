import swal from "sweetalert";
import Encryption from '../shared/payload-encryption';

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
export const vahanValidation =(value,values)=>{
    console.log("vahan_response",value,values)
    let vahan_response={
        error:"",
        msg:""
    }

    const { motorInsurance, PolicyArray, sliderVal,vahan_flag, add_more_coverage, geographical_extension,error,vahan_chasis_no,vahan_engine_no,vahan_message } = value
    if(error == true)
    {
        vahan_response.msg="Can not proceed";
        vahan_response.error=true; 
    }
    else if(motorInsurance.policytype_id == 1 && motorInsurance.registration_no === "NEW" ){
        vahan_response.msg="Success";
        vahan_response.error=false; 
    }
   else if(vahan_flag==1 ||  error == false )
    {
        // if( vahan_chasis_no && vahan_chasis_no == values.chasis_no)
        // {
        //     if( vahan_engine_no && vahan_engine_no == values.engine_no)
        //     {
        //         vahan_response.msg="Success";
        //         vahan_response.error=false; 
        //     }
        //     else{
        //         vahan_response.msg="Engine no is not matching";
        //         vahan_response.error=true; 
        //     }
        // }
        // else{
        //     vahan_response.msg="Chassis no is not matching";
        //     vahan_response.error=true;
        // }
        vahan_response.msg="Success";
        vahan_response.error=false; 
    }
    return vahan_response;
}
export const fourwheelerODEndDate =  (value,tenure) => {
    console.log("dyyy1",value,tenure)
    if(value && tenure){
        var day =  value.getDate() - 1
        var month = value.getMonth()
        var year =   value.getFullYear() + parseInt(tenure)
        var endDate = new Date(year,month,day)
        console.log("dyyy1",endDate)
        return endDate
    }
    
}

export const paymentGateways = (values,policyHolder,refNumber, productId) => {

    let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")): "";
    let user_id = ""
    let not_access_in = []
    var paymentFlag = true;
    let encryption = new Encryption();
    if (user_data) {
        user_id = JSON.parse(encryption.decrypt(user_data.user));
        console.log("inter",user_id)
        console.log("valuesvalues",values)
        not_access_in =  user_id.not_access_in
        not_access_in.length > 0 && not_access_in.map((accessValue, index) => {
            if(accessValue.name == "payment") {
                swal(accessValue.msg)
                paymentFlag = false
            }
        })
        if(paymentFlag) {
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
                if(values.slug == "PPINL") {
                    paypoint_payment(refNumber)
                }
                if(values.slug == "sahi_wallet") {
                    window.location.href = `#/Sahipay_gateway/${productId}?access_id=${refNumber}` 
                }
                if(values.slug == "transcrop_wallet") {
                    window.location.href = `#/Transcrop_gateway/${productId}?access_id=${refNumber}` 
                }
                if(values.slug == "fia_global") {
                    window.location.href = `#/Fia_gateway/${productId}?access_id=${refNumber}` 
                }

                if(values.slug == "Aisect_global") {
                    window.location.href = `#/Aisect_gateway/${productId}?access_id=${refNumber}` 
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
                if(values.slug == "transcrop_wallet") {
                    window.location.href = `#/Transcrop_gateway/${productId}?access_id=${refNumber}` 
                }
                if(values.slug == "fia_global") {
                    window.location.href = `#/Fia_gateway/${productId}?access_id=${refNumber}` 
                }

                if(values.slug == "Aisect_global") {
                    window.location.href = `#/Aisect_gateway/${productId}?access_id=${refNumber}` 
                }
            }
        }
    }
    else swal("User data not found")
}

function payment(refNumber, productId) {
	const motor_productIds = [1,2,3,4,6,7,8,11,15,16,17,18,19,27];
    const user_type = sessionStorage.getItem('type') ? sessionStorage.getItem('type') : ''
    productId = parseInt(productId)
	if(motor_productIds.includes(productId)){
		window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_motor.php?refrence_no=${refNumber}&type=${user_type}`
	}else{
		window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment.php?refrence_no=${refNumber}&type=${user_type}`
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