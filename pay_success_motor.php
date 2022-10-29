<?php
@session_start();
require_once 'includes/BridgePGUtil.php';
require_once 'includes/db_connect.php';
require_once 'includes/connect_config.php';
require('../razorpay/timeTracker.php');
require('refund.php');

$bconn = new BridgePGUtil ();
$bridge_message = $bconn->get_bridge_message();
$data_array = $bconn->decrypt_message($bridge_message);

timeTracker(__LINE__,basename(__FILE__),$data_array,$conn);

if(!empty($data_array))
{
    $menumaster_id = isset($_SESSION['menumaster_id']) ? $_SESSION['menumaster_id']:'';
    $param_4_str = $data_array['param_4'];
    //$param_4_arr = explode("###", $param_4_str);
    //$reference_no = $param_4_arr[0];
    //$policyholder_id = $param_4_arr[1];
    //$csc_user_type = $param_4_arr[5];
    //$policyholder_id = $data_array['param_2'];
    $request_data = isset($_SESSION['request_data']) ? $_SESSION['request_data']:'';
    $transaction_no= $data_array['merchant_txn'];
    $currency= $data_array['currency'];
    $amount= $data_array['txn_amount'];
    $csc_id= $data_array['csc_id'];
    $transaction_date= $data_array['merchant_txn_date_time'];
    $transaction_status= $data_array['txn_status'];
    $status_message= $data_array['status_message'];
    $response= json_encode($data_array);

    $txn_amount= intval($data_array['txn_amount']);

    //for refund data
    $csc_txn= $data_array['csc_txn'];
    $product_id= $data_array['product_id'];
    $merchant_id= $data_array['merchant_id'];
    $txn_status_message= $data_array['txn_status_message'];

    $qno_sql = "SELECT policyholder_id FROM `payments` WHERE `transaction_no` = '".$transaction_no."'";
    $result = $conn->query($qno_sql);
    $row = $result->fetch_assoc();
    $policyholder_id = $row['policyholder_id'];

    $qno_sql = "SELECT reference_no FROM `policyholders` WHERE `id` = '".$policyholder_id."'";
    $result = $conn->query($qno_sql);
    $row = $result->fetch_assoc();
    $reference_no = $row['reference_no'];

    /*$sql = "INSERT INTO payments (policyholder_id, request_data, reference_no,csc_txn,transaction_no,currency,amount,transaction_date,transaction_status,status_message,response)
        VALUES ($policyholder_id, '$request_data', '$reference_no','$csc_txn','$transaction_no', '$currency',$amount,'$transaction_date',$transaction_status,'$status_message','$response')";*/
    $update_payment_sql = "UPDATE payments SET transaction_status='$transaction_status',status_message='$status_message',response='$response',csc_txn='$csc_txn',currency='INR',amount=$amount WHERE transaction_no ='$transaction_no'";

    $update_policy_sql = "UPDATE apilogs SET api_response='$response' WHERE policyholder_id =$policyholder_id AND api_name='PaymentAPI' ";
    $conn->query($update_policy_sql);
        

    $qno_sql = "SELECT id, quote_id, gross_premium, service_tax FROM `requestdatas` WHERE `policyholder_id` = '".$policyholder_id."'";
    $result = $conn->query($qno_sql);
    $row = $result->fetch_assoc();
    $request_id = $row['id'];

    $api_name = "Payment_success";
    $api_url = isset($_SESSION['api_url']) ? $_SESSION['api_url']:'';
    $api_request = isset($_SESSION['api_request']) ? $_SESSION['api_request']:'';

    $log_sql = "INSERT INTO `apilogs` (`id`, `api_name`, `policyholder_id`, `api_url`, `api_request`, `api_response`, `updated_at`) VALUES (NULL, '".$api_name."', '".$policyholder_id."', '".$api_url."', '".$api_request."', '".$response."', NOW())";
    if($conn->query($log_sql))
    {
        unset($_SESSION['api_url']);
        unset($_SESSION['api_request']);
    }

    // $amount = $row['gross_premium']+$row['service_tax'];

    if($conn->query($update_payment_sql))
    {
        $fetchWsUrl = 'https://172.20.201.168/cld/v1/token';
        $header_array = array('Content-Type:application/json','X-IBM-Client-Id:333be032-563a-4606-a07f-d37301200055','X-IBM-Client-Secret:hL7kM1nD3uC7aI5fC2sL1dQ1pB4kL3hH3fV1qM0tR3aE0sO7vN');
        $header = json_encode($header_array);   
        $strRequest ="#####" . $header . "#####" . $fetchWsUrl;
        $link_array = explode('/', $fetchWsUrl);
        $type = end($link_array);       
        $proxy = 'http://172.18.101.14:80';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $fetchWsUrl);
        curl_setopt($ch, CURLOPT_SSLVERSION, 6);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header_array);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		
		$apiRequest = array();
		$api_name = 'issurance_token';
		$api_url = $fetchWsUrl;
		$api_request = $strRequest;
		$log_sql = "INSERT INTO `apilogs` (`id`, `api_name`, `policyholder_id`, `api_url`, `api_request`, `api_response`, `updated_at`) VALUES (NULL, '".$api_name."', '".$policyholder_id."', '".$api_url."', '".$api_request."', '', NOW())";
		$conn->query($log_sql);
        $result = curl_exec($ch);
		$api_response = $result;
		$update_log_sql = "UPDATE apilogs SET api_response ='".$api_response."' WHERE policyholder_id='".$policyholder_id."' AND api_name='".$api_name."'";
        $conn->query($update_log_sql);
		
        if (curl_errno($ch)) {
            $result = "Curl Error - " . curl_errno($ch) . ": " . curl_error($ch);
            echo $result;

        }
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        /*$refund_data['merchant_id'] = $merchant_id ;
        $refund_data['bconn'] = $bconn ;
        $refund_data['transaction_no'] = $transaction_no;
        $refund_data['csc_txn'] = $csc_txn;
        $refund_data['product_id'] = $product_id;
        $refund_data['txn_status_message'] = $txn_status_message;
        $refund_data['txn_amount'] = $txn_amount;
        $refund_data['policyholder_id'] = $policyholder_id;
        $refund_data['conn'] = $conn;*/

        if($httpcode == 200)
        {
            $tokenResult = json_decode($result, TRUE);
            // echo $tokenResult['access_token'];


            $data = '{
                "RequestHeader": {
                  "requestID": "'.mt_rand(100000, 999999).'",
                  "action": "getIssurance",
                  "channel": "SBIGIC",
                  "transactionTimestamp": "'.date("d-M-Y-h:i:s").'"
                },
                "RequestBody": {
                  "QuotationNo": "'.$row['quote_id'].'",
                  "Amount": '.round($amount).',
                  "CurrencyId": 1,
                  "PayMode": 212,
                  "FeeType": 11,
                  "Payer": "Customer",
                  "TransactionDate": "'.date("Y-m-d").'",
                  "PaymentReferNo": "'.$csc_txn.'",
                  "InstrumentNumber": "'.$csc_txn.'",
                  "InstrumentDate": "'.date("Y-m-d").'",
                  "BankCode": "2",
                  "BankName": "STATE BANK OF INDIA",
                  "LocationType": "2",
                  "RemitBankAccount": "30",
                  "PickupDate": "'.date("Y-m-d").'",
                  "ReceiptBranch": "ReceiptBranch",
                  "ReceiptTransactionDate": "'.date("Y-m-d").'",
                  "ReceiptDate": "'.date("Y-m-d").'",
                  "Comment": "Comment"
                }
              }';
    
            // echo $data; exit;
            $url = 'https://172.20.201.168/cld/v1/issurance';
            $header = "Content-Type: application/json";
            $strRequest = $data . "#####" . $header . "#####" . $url;
            $link_array = explode('/', $url);
            $type = end($link_array);
            // $apiRequest = array();
            // $apiRequest['api_name'] = 'issurance';
            // $apiRequest['api_url'] = $url;
            // $apiRequest['api_request'] = $strRequest;
    
            $Authorization = $tokenResult['access_token'];
    
            //production
            $proxy = 'http://172.16.101.14:80';
               
    
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json','Authorization:Bearer '.$Authorization,'X-IBM-Client-Id:333be032-563a-4606-a07f-d37301200055','X-IBM-Client-Secret:hL7kM1nD3uC7aI5fC2sL1dQ1pB4kL3hH3fV1qM0tR3aE0sO7vN'));
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
            //curl_setopt($ch, CURLOPT_PROXY, $proxy);
			$apiRequest = array();
            $api_name = 'issurance';
            $api_url = $url;
            $api_request = $strRequest;
            $api_response = $result;
            $log_sql = "INSERT INTO apilogs (api_name, policyholder_id, api_url,api_request,api_response, `updated_at`)
                    VALUES ('$api_name', $policyholder_id, '$api_url', '$api_request','', NOW())";
            $conn->query($log_sql);
            $result = curl_exec($ch);
			$api_response = $result;
			$update_log_sql = "UPDATE apilogs SET api_response ='".$api_response."' WHERE policyholder_id='".$policyholder_id."' AND api_name='".$api_name."'";
			$conn->query($update_log_sql);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            $PolicyIssue = json_decode($result, TRUE);

            unset($_SESSION['policyholder_id']);
            unset($_SESSION['request_data']);
            unset($_SESSION['menumaster_id']);

            timeTracker(__LINE__,basename(__FILE__),$PolicyIssue,$conn);

            if(isset($PolicyIssue['PolicyNo']))
            {
                $created_time = date('Y-m-d H:i:s');
                $policyNo = $PolicyIssue['PolicyNo'];
                $update_policy_sql = "UPDATE policynotes SET policy_no ='$policyNo',status=1, policy_no_type=2,created_at='$created_time' WHERE requestdata_id=$request_id";
                $conn->query($update_policy_sql);

                $csc_user_type = 'RAP';
                /*$cscmaster_query = "SELECT * FROM cscmasters WHERE csc_digital_seva_id='$csc_id'";
                $result = $conn->query($cscmaster_query);
                $cscMasterData = $result->fetch(PDO::FETCH_ASSOC);
                if(!empty($cscMasterData))
                {
                  $csc_user_type = $cscMasterData['type'];
                }*/
                // $vehicle_product_id=0;
                // $sql_query = "SELECT * FROM vehiclebrandmodels WHERE policyholder_id='".$policyholder_id."'";
                // $result = $conn->query($sql_query);
                // $masterData = $result->fetch(PDO::FETCH_ASSOC);
                // if(!empty($masterData))
                // {
                 // $vehicle_product_id = $masterData['vehicletype_id'];
                // }
                
				// $renewal_sql = "INSERT INTO renewalmasters (policy_no,user_id,user_type,csc_user_type,product_id,is_rural)
                // VALUES ('".$policyNo."','".$csc_id."','csc','".$csc_user_type."','".$vehicle_product_id."',1)";
                //$stmt = $conn->query($renewal_sql);
				
                $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL.'ThankYou/'.$PolicyIssue['PolicyNo'].'?access_id='.$reference_no);
                timeTracker(__LINE__,basename(__FILE__),$url_redirect,$conn);

                header('Location: '.PROJECT_REDIRECT_URL.'ThankYou/'.$PolicyIssue['PolicyNo'].'?access_id='.$reference_no);
            }
            /*else
            {
                //http://14.140.119.44:5001/#/Error

                $refundData = refundPrecess($refund_data);
                $refundData = json_decode($refundData, true);
                //print_r($refundData); die();
                $res = (explode('|',$refundData['response_data'])); 
                //print_r($res); die();           

                if(isset($refundData['response_status'])=='Success')
                {
                    $refund_text = ".".$refundData['response_message']." CSC Transaction No:".$csc_txn." and ".$res[4];
                }
               
                $api_response_data = json_decode($api_response);

                if(isset($api_response_data->ValidateResult->message))
                {
                    $api_response_data->ValidateResult->message .= $refund_text;
                }
                
                if(isset($api_response_data->moreInformation))
                {
                    $api_response_data->moreInformation .= $refund_text;
                }

                $api_response = json_encode($api_response_data); 

                $update_policy_sql = "UPDATE policynotes SET additional_info ='$api_response' WHERE requestdata_id=$request_id";
                $conn->query($update_policy_sql);
                
                $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL.'Error?access_id='.$reference_no);
                timeTracker(__LINE__,basename(__FILE__),$url_redirect,$conn);
                
                header('Location: '.PROJECT_REDIRECT_URL.'Error?access_id='.$reference_no);
            }*/
            
            exit;            
        }
        else
        {
              //refundPrecess($refund_data);
              $location_url = PROJECT_REDIRECT_URL;
              switch ($product_id) {
              case '2':
                  $location_url = $location_url.'Premium/2';
                  break;
              case '3':
                  $location_url = $location_url.'two_wheeler_policy_premium_detailsTP/3';
                  break;
                case '4':
                  $location_url = $location_url.'two_wheeler_policy_premium_details/4';
                  break;
                case '5':
                  $location_url = $location_url.'PolicyDetails/5';
                  break;
                case '6':
                  $location_url = $location_url.'four_wheeler_policy_premium_detailsTP/6';
                  break;   
              default:
                  # code...
                  break;
              }
              header('Location:'.$location_url."?access_id=".$refrence_no);

        }
        exit;
    }
    exit;

}
else
{
    echo 'error redirect';
    timeTracker(__LINE__,basename(__FILE__),$_POST,$conn);
    timeTracker(__LINE__,basename(__FILE__),$_SESSION,$conn);
}




?>