<?php

require('config.php');
require('timeTracker.php');
require('refund.php');
require('customer_msg.php');
require('razorpay-php/Razorpay.php');

use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

require_once 'db_connect.php';
session_start();

$success = true;
$error = "Payment Failed";
$acd_creation = false;
//timeTracker(__LINE__,basename(__FILE__),$_POST,$conn);

if (empty($_POST['razorpay_payment_id']) === false) {
   // echo '<pre>',print_r($_POST),'</pre>';

    $api = new Api($keyId, $keySecret);

    $payment_id = $_POST['razorpay_payment_id'];
    $data_array = $api->payment->fetch($payment_id);
    $order_id = $data_array['order_id'];

    try {
        $attributes = array(
            'razorpay_order_id' => $order_id,
            'razorpay_payment_id' => $_POST['razorpay_payment_id'],
            'razorpay_signature' => $_POST['razorpay_signature']
        );
        $api->utility->verifyPaymentSignature($attributes);
    } catch (SignatureVerificationError $e) {
        $success = false;
        $error = 'Razorpay Error : ' . $e->getMessage();
        $arr_values = array('attributes' => $attributes, 'error' => $error);
        //timeTracker(__LINE__,basename(__FILE__),$arr_values,$conn);
    }

    $policyholder_id = $data_array['notes']['policyholder_id'];
    $reference_no = $data_array['notes']['ref_no'];
    $product_id = $data_array['notes']['product_id'];
    $bcmaster_id = $data_array['notes']['bcmaster_id'];
    $bc_agent_id = $data_array['notes']['bc_agent_id'];
    $payment_merchant = 'razorpay';
    $request_data = $_SESSION['request_data'];
    $currency = $data_array['currency'];
    $amount = ($data_array['amount'] / 100);
    $transaction_date = date('Y-m-d H:i:s', $data_array['created_at']);
    $transaction_status = $data_array['captured'];
    $transaction_no = $data_array['id']; //payment_id

    if ($data_array['error_code'] == '') {
        $status_message = 'Successful';
    } else {
        $status_message = $data_array['error_description'];
    }

    //extra info
    $attributes['entity'] = $data_array['entity'];
    $attributes['status'] = $data_array['status'];
    $attributes['method'] = $data_array['method'];
    $attributes['notes'] = $data_array['notes'];
    $attributes['fee'] = $data_array['fee'];
    $attributes['error_code'] = $data_array['error_code'];
    $attributes['error_description'] = $data_array['error_description'];
    $attributes['error_source'] = $data_array['error_source'];
    $attributes['error_step'] = $data_array['error_step'];
    $attributes['error_reason'] = $data_array['error_reason'];

    $response = json_encode($attributes);
    $quote_id = $data_array['notes']['quote_id'];
	
	$policyStatus = "";
}
if ((isset($data_array['notes']['account_number']) && !empty($data_array['notes']['account_number']))) {
    $acd_creation = true;
}

if (!$acd_creation && isset($policyholder_id)) {
    $qno_sql = "SELECT requestdatas.id, requestdatas.quote_id, requestdatas.gross_premium, requestdatas.service_tax,requestdatas.payment_link_status,requestdatas.is_quote_call,policynotes.policy_no,policynotes.status,policynotes.policy_no_type FROM `requestdatas` INNER JOIN policynotes ON policynotes.requestdata_id = requestdatas.id 
      WHERE requestdatas.policyholder_id = $policyholder_id";

    $stmt = $conn->query($qno_sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $payment_link_status = $row['payment_link_status'];
    $is_quote_call = $row['is_quote_call'];
    $policy_no = $row['policy_no'];
    $policyStatus = $row['status'];
}

if ($success === true && $policyStatus == 0) {

    if (!$acd_creation) {

        $sql = "INSERT INTO payments (payment_merchant,policyholder_id, request_data,reference_no,order_id,transaction_no,currency,amount,transaction_date,transaction_status,status_message,response)
        VALUES ('$payment_merchant',$policyholder_id, '$request_data', '$reference_no','$order_id','$transaction_no', '$currency',$amount,'$transaction_date',$transaction_status,'$status_message','$response')";

        $stmt = $conn->query($sql);
        $qno_sql = "SELECT id, quote_id, gross_premium, service_tax,payment_link_status FROM `requestdatas` WHERE `policyholder_id` = '" . $policyholder_id . "'";

        $stmt = $conn->query($qno_sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $request_id = $row['id'];
        $payment_link_status = $row['payment_link_status'];
        $api_name = "Payment_success";
        $api_url = $_SESSION['api_url'];
        $api_request = $request_data;

        $log_sql = "INSERT INTO `apilogs` (`id`, `api_name`, `policyholder_id`, `api_url`, `api_request`, `api_response`, `updated_at`) VALUES (NULL, '" . $api_name . "', '" . $policyholder_id . "', '" . $api_url . "', '" . $api_request . "', '" . $response . "', NOW())";

    } else if ($success === true && $acd_creation) {
        $account_number = $data_array['notes']['account_number'];
        $current_date = date('d/m/Y');
        // $account_id = '26615';
        // $account_id = 'ACDR0010005902';
        $account_id = $data_array['notes']['account_id'];
        //call service for cash deposit
        $xmlRequest = '
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.esb.soa.pub.ebao.com/">
            <soapenv:Header/>
              <soapenv:Body>
               <ser:depositeReceipt>
                  <arg0>
                    <branchCode>00001</branchCode>
                    <busiSourcingBranCode>00001</busiSourcingBranCode>
                    <cdCode>'.$account_id.'</cdCode>
                    <currencyType>148</currencyType>
                    <depositType>1</depositType>
                    <eftBank>XIS BANK - UTI BANK</eftBank>
                    <eftBankId>211</eftBankId>
                    <eftDate>'.$current_date.'</eftDate>
                    <eftNo>'.$transaction_no.'</eftNo>
                    <partyCode>PH-0000347301</partyCode>
                    <payMode>212</payMode>
                    <payerType>1</payerType>
                    <payor>IDFC BAnk</payor>
                    <pickUpDate>'.$current_date.'</pickUpDate>
                    <receiptAmount>'.$amount.'</receiptAmount>
                    <receiptDate>'.$current_date.'</receiptDate>
                    <remitBankAccount>600350087513</remitBankAccount>
                    <sbilProposalID>24242</sbilProposalID>
                  </arg0>
               </ser:depositeReceipt>
            </soapenv:Body>
        </soapenv:Envelope>';

        $apiRequest = array();
        $data = array();
        $sql = "SELECT url FROM `wsurls` WHERE name = 'depositeReceipt' ORDER BY `wsURLId`  DESC";

        $stmt = $conn->query($sql);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $fetchWsUrl = !empty($row) ? $row['url'] : '';
       

        $formattedResponse = "";
        $apiRequest['api_name'] = 'depositeReceipt';
        $apiRequest['api_url'] = $fetchWsUrl;
        $apiRequest['api_request'] = $xmlRequest;
        $headers = array(
            "Content-type: text/xml;charset=\"utf-8\"",
            "Accept: text/xml",
            "Cache-Control: no-cache",
            "Pragma: no-cache",
            "Content-length: " . strlen($xmlRequest),
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $fetchWsUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlRequest); // the SOAP request
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $xmlResponse = curl_exec($ch);
        curl_close($ch);

        $apiRequest['api_response'] = $xmlResponse;

        $result = array();
        $data = "";
        $error = false;
        $msg = '';

        if (strpos($xmlResponse, 'xmlns') == true) {
            $xmlResponse = preg_replace('#<!\[CDATA\[(.+?)\]\]>#s', '$1', $xmlResponse);
            $xml = preg_replace("/(<\/?)(\w+):([^>]*>)/", "$1$2$3", $xmlResponse);
            $xml = simplexml_load_string($xml);
            $json = json_encode($xml);
            $responseArray = json_decode($json, true);
            if (!empty($responseArray['soapBody']['ns1depositeReceiptResponse']['return']['receiptTTNo'])) {
                $data = $responseArray['soapBody']['ns1depositeReceiptResponse']['return']['receiptTTNo'];
            } else {
                $error = true;
                $msg = 'Invalid Response';
            }
        } else {
            $error = true;
            $msg = 'Invalid Response';
        }

        $result['error'] = $error;
        $result['data'] = $data;
        $result['msg'] = $msg;
        $formattedResponse = $result;
        if ($error) {
            header('Location: ' . PROJECT_REDIRECT_URL . 'AgentCashDeposit/?account_number=' . $account_number . '&status=pay_fail');
        }

        $api_name = $apiRequest['api_name'];
        $policyholder_id = isset($apiRequest['policyholder_id']) ? $apiRequest['policyholder_id'] : 0;
        $api_url = $apiRequest['api_url'];
        $api_request = $apiRequest['api_request'];
        $api_response = $apiRequest['api_response'];

        $log_sql_api = "INSERT INTO `apilogs` (`id`, `api_name`, `policyholder_id`, `api_url`, `api_request`, `api_response`, `updated_at`) VALUES (NULL, '" . $api_name . "', '" . $policyholder_id . "', '" . $api_url . "', '" . $api_request . "', '" . $api_response . "', NOW())";

        $stmt = $conn->query($log_sql_api);


        $acd_sql = "SELECT id,user_id, deposit_ammount FROM `intermidiaryacds` WHERE `account_number` = '" . $account_number . "'";
        $stmt = $conn->query($acd_sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $acd_id = !empty($row) ? $row['id'] : '';
        $account_balance = !empty($row) ? $row['deposit_ammount'] : '';
        $deposit_amount = $account_balance + $amount;
		$user_id = !empty($row) ? $row['user_id'] : '';
        //insert razorpay request/response and payment details into DB
        $sql = "INSERT INTO intermidiaryacdpayments (payment_merchant,acd_id,request_data,account_number,order_id,transaction_no,currency,amount,transaction_date,transaction_status,status_message,response,deposit_receipt)
        VALUES ('$payment_merchant', '$acd_id', '$request_data', '$account_number','$order_id','$transaction_no', '$currency',$amount,'$transaction_date',$transaction_status,'$status_message','$response','$data')";
        $stmt = $conn->query($sql);
		
		// ACD Reconcilliation ---------
		
		$prev_balance = $account_balance;
		$debit = 0;
		$balance = $deposit_amount;
		
		$sql1 = "INSERT INTO acdstatement (user_id,account_number,prev_balance,credit,debit,balance,updated_at,created_at)
        VALUES ('$user_id', '$account_number', '$prev_balance', '$amount','$debit','$balance',NOW(),NOW())";
        $stmt = $conn->query($sql1);
		
		// -------------------------------

        if(!empty($data) || !is_null($data) || $data != '') // ACD Deposite number not blank
        {
          $update_acd_sql = "UPDATE intermidiaryacds SET deposit_ammount = '$deposit_amount' WHERE account_number= '$account_number' AND id ='$acd_id'";
          $conn->query($update_acd_sql);
        }

        header('Location: ' . PROJECT_REDIRECT_URL . 'AgentCashDeposit/?account_number=' . $account_number . '&status=pay_success');
    }

    if ($conn->query($log_sql)) {
        unset($_SESSION['api_url']);
        unset($_SESSION['api_request']);

        //$fetchWsUrl = 'https://devapi.sbigeneral.in/cld/v1/token';
        $fetchWsUrl = 'http://172.18.233.97:8443/cld/v1/token';
        // $header_array = array('Content-Type:application/json','X-IBM-Client-Id:62eb022d-88fc-4ce0-a6ba-83047dd437e9','X-IBM-Client-Secret:J0rR2lX6sT6eB6xC6xO2sE2fH6jI5rQ0fK5hX7lT6mG2wE3kR3');

        $header_array = array('Content-Type:application/json', 'X-IBM-Client-Id:f6bb3f6d-cc75-4281-8fc0-72bef08bdf5a', 'X-IBM-Client-Secret:qC1gL7xL5iS8gD3tT1yU8hD4lN5dC2mQ2aX5kC5yA6gY6jW8mT');

        $header = json_encode($header_array);
        $strRequest = "#####" . $header . "#####" . $fetchWsUrl;
        $link_array = explode('/', $fetchWsUrl);
        $type = end($link_array);
        $proxy = 'http://172.18.101.14:80';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_URL, $fetchWsUrl);
        curl_setopt($ch, CURLOPT_SSLVERSION, 6);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header_array);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            $result = "Curl Error - " . curl_errno($ch) . ": " . curl_error($ch);
            echo $result;
        }
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpcode == 200) {
            $tokenResult = json_decode($result, TRUE);
            // echo $tokenResult['access_token'];
            $data = '{
                "RequestHeader": {
                  "requestID": "' . mt_rand(100000, 999999) . '",
                  "action": "getIssurance",
                  "channel": "SBIGIC",
                  "transactionTimestamp": "' . date("d-M-Y-h:i:s") . '"
                },
                "RequestBody": {
                  "QuotationNo": "' . $row['quote_id'] . '",
                  "Amount": ' . round($amount) . ',
                  "CurrencyId": 1,
                  "PayMode": 212,
                  "FeeType": 11,
                  "Payer": "payer",
                  "TransactionDate": "' . date("Y-m-d") . '",
                  "PaymentReferNo": "' . $payment_id . '",
                  "InstrumentNumber": "500045",
                  "InstrumentDate": "' . date("Y-m-d") . '",
                  "BankCode": "211",
                  "BankName": "AXIS BANK",
                  "BankBranchName": "KHED-SHIVAPUR",
                  "BankBranchCode": "7000003582",
                  "LocationType": "1",
                  "RemitBankAccount": "8",
                  "ReceiptCreatedBy": "ReceiptCreatedBy",
                  "PickupDate": "' . date("Y-m-d") . '",
                  "IFSCCode": "IFSCCode",
                  "MICRNumber": "MICRNumber",
                  "PANNumber": "PANNumber",
                  "ReceiptBranch": "ReceiptBranch",
                  "ReceiptTransactionDate": "' . date("Y-m-d") . '",
                  "ReceiptDate": "' . date("Y-m-d") . '",
                  "EscalationDepartment": "EscalationDepartment",
                  "Comment": "Comment",
                  "AccountNumber": "AccountNumber",
                  "AccountName": "AccountName"
                }
              }';

            // echo $data; exit;
            //$url = 'https://devapi.sbigeneral.in/cld/v1/issurance';
            $url = 'http://172.18.233.97:8443/cld/v1/issurance';
            $header = "Content-Type: application/json";
            $strRequest = $data . "#####" . $header . "#####" . $url;
            $api_name = 'issurance';

            $log_sql = "INSERT INTO apilogs (api_name, policyholder_id, api_url,api_request,api_response)
            VALUES ('$api_name', $policyholder_id, '$url', '$strRequest','')";
            $conn->query($log_sql);

            // $last_id = $conn->insert_id;



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
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            // curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:application/json","Authorization:Bearer $Authorization","X-IBM-Client-Id:62eb022d-88fc-4ce0-a6ba-83047dd437e9","X-IBM-Client-Secret:J0rR2lX6sT6eB6xC6xO2sE2fH6jI5rQ0fK5hX7lT6mG2wE3kR3"));

            curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:application/json", "Authorization:Bearer $Authorization", "X-IBM-Client-Id:f6bb3f6d-cc75-4281-8fc0-72bef08bdf5a", "X-IBM-Client-Secret:qC1gL7xL5iS8gD3tT1yU8hD4lN5dC2mQ2aX5kC5yA6gY6jW8mT"));

            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            //curl_setopt($ch, CURLOPT_PROXY, $proxy);
            $result = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            $PolicyIssue = json_decode($result, TRUE);
            $apiRequest = array();
            $api_name = 'issurance';
            $api_url = $url;
            $api_request = $strRequest;
            $api_response = $result;
            //timeTracker(__LINE__,basename(__FILE__),$PolicyIssue,$conn);

            /*$log_sql = "INSERT INTO apilogs (api_name, policyholder_id, api_url,api_request,api_response)
            VALUES ('$api_name', $policyholder_id, '$api_url', '$api_request','$api_response')";
            $conn->query($log_sql);*/

            // die($api_response);

            $update_log_sql = "UPDATE apilogs SET api_response = '$api_response' WHERE policyholder_id=$policyholder_id AND api_name='$api_name'";
            $conn->query($update_log_sql);

            $update_policy_sql = "UPDATE requestdatas SET is_quote_call=1 WHERE id=$request_id";
            $conn->query($update_policy_sql);

            if (isset($PolicyIssue['PolicyNo'])) {
                $created_time = date('Y-m-d H:i:s');
                $policyNo = $PolicyIssue['PolicyNo'];
                //sendCustomerMsg($policyNo);
                $update_policy_sql = "UPDATE policynotes SET policy_no ='$policyNo',status=1, policy_no_type=2, created_at='$created_time' WHERE requestdata_id=$request_id";
                $conn->query($update_policy_sql);

                // KSB

                $sql_query = "SELECT policyholder_id FROM `ksbinfos` WHERE `policyholder_id` = '" . $policyholder_id . "'";
                $stmt = $conn->query($sql_query);
                $is_ksb_policy = $stmt->fetch(PDO::FETCH_ASSOC);

                if (count($is_ksb_policy) > 0) {
                    $update_ksb = "UPDATE ksbinfos SET insurance_response='$api_response' WHERE policyholder_id = '$policyholder_id'";
                    $conn->query($update_ksb);
                }

                if ($payment_link_status == 1) {
                    $payment_response_link = $domain_url . '/razorpay/external_payment_response.php' . '?refrence_no=' . $reference_no;
                    header('Location: ' . $payment_response_link);
                } else {
                    $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL . 'ThankYou/' . $PolicyIssue['PolicyNo'] . '?access_id=' . $reference_no);
                    //timeTracker(__LINE__,basename(__FILE__),$url_redirect,$conn);
                    unset($_SESSION['razorpay_order_id']);
                    unset($_SESSION['request_data']);
                    header('Location: ' . PROJECT_REDIRECT_URL . 'ThankYou/' . $PolicyIssue['PolicyNo'] . '?access_id=' . $reference_no);
                }
            } else {
                $fetch_policy_no = '';
                $ws_url_sql = "SELECT * FROM `apilogs` WHERE api_name='issurance' AND `policyholder_id` =$policyholder_id ORDER BY id DESC";
                $stmt = $conn->query($ws_url_sql);
                $ws_row = $stmt->fetch(PDO::FETCH_ASSOC);
                $insuranceMoCount = $stmt->rowCount();
                if ($insuranceMoCount > 0) {
                    $api_response = json_decode($ws_row['api_response']);

                    if (isset($api_response->ValidateResult->code)) {
                        if ($api_response->ValidateResult->code == 'RepeatedIssuance') {
                            $sql_query = "
                                SELECT 
                                policyholders.id,
                                policyholders.csc_id,
                                policyholders.reference_no, 
                                requestdatas.net_premium,
                                policynotes.policy_no_type,
                                policynotes.status,
                                policynotes.policy_no 
                                FROM policyholders INNER JOIN 
                                requestdatas ON 
                                policyholders.id = requestdatas.policyholder_id
                                INNER JOIN policynotes ON
                                policynotes.requestdata_id = requestdatas.id 
                                WHERE policyholders.id=$policyholder_id 
                                AND policy_no_type=2";

                            $stmt = $conn->query($sql_query);
                            $policyDataCount = $stmt->rowCount();
                            if ($policyDataCount > 0) {
                                $policyData = $stmt->fetch(PDO::FETCH_ASSOC);
                                $fetch_policy_no = $policyData['policy_no'];
                                //sendCustomerMsg($fetch_policy_no);
                            }
                        }
                    }
                }

                if ($fetch_policy_no != '') {
                    $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL . 'ThankYou/' . $fetch_policy_no . '?access_id=' . $reference_no);
                    //timeTracker(__LINE__,basename(__FILE__),$url_redirect,$conn);
                    unset($_SESSION['razorpay_order_id']);
                    unset($_SESSION['request_data']);
                    header('Location: ' . PROJECT_REDIRECT_URL . 'ThankYou/' . $fetch_policy_no . '?access_id=' . $reference_no);
                } else {
                    //http://14.140.119.44:5001/#/Error
                    $refundResponse = refundPrecess($payment_id, $api, $payment_merchant, $policyholder_id, $api_url, $conn);

                    $RefundArr = json_decode($refundResponse);
                    $refund_text = '';
                    if (isset($RefundArr->id)) {
                        $refund_text = ' Refund Requested Successfully. Refund id:' . $RefundArr->id;
                    }

                    $api_response_data = json_decode($api_response);

                    if (isset($api_response_data->ValidateResult->message)) {
                        $api_response_data->ValidateResult->message .= $refund_text;
                    }

                    if (isset($api_response_data->moreInformation)) {
                        $api_response_data->moreInformation .= $refund_text;
                    }

                    $api_response = json_encode($api_response_data);

                    //echo '<pre>',print_r($api_response);die();

                    $update_policy_sql = "UPDATE policynotes SET additional_info ='$api_response' WHERE requestdata_id=$request_id";
                    $conn->query($update_policy_sql);

                    $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL . 'Error?access_id=' . $reference_no);
                    //timeTracker(__LINE__,basename(__FILE__),$url_redirect,$conn);

                    if ($payment_link_status == 1) {
                        $payment_response_link = $domain_url . '/razorpay/external_payment_response.php' . '?refrence_no=' . $reference_no;
                        header('Location: ' . $payment_response_link);
                    } else {
                        header('Location: ' . PROJECT_REDIRECT_URL . 'Error?access_id=' . $reference_no);
                    }
                }
            }


            // header('Location: http://14.140.119.44:5001/#/ThankYou/'.$PolicyIssue['PolicyNo']);
            exit;
        } else {
            $errorMsg = "Curl Error - " . curl_errno($ch) . ": " . curl_error($ch);
            $refundResponse = refundPrecess($payment_id, $api, $payment_merchant, $policyholder_id, $api_url, $conn);

            $RefundArr = json_decode($refundResponse);
            $refund_text = '';
            if (isset($RefundArr->id)) {
                $refund_text = ' Refund Requested Successfully. Refund id:' . $RefundArr->id;
            }

            $errorMsg .= $refund_text;
            $api_response = '{"ValidateResult":{"code":"UWFailedonQuotation","message":' . $errorMsg . '}}';

            $update_policy_sql = "UPDATE policynotes SET additional_info ='$api_response' WHERE requestdata_id=$request_id";
            $conn->query($update_policy_sql);

            $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL . 'Error?access_id=' . $reference_no);
            timeTracker(__LINE__, basename(__FILE__), $url_redirect, $conn);

            header('Location: ' . PROJECT_REDIRECT_URL . 'Error?access_id=' . $reference_no);
        }
        exit;
    } else {
        $sql_query = "
            SELECT 
            policyholders.id,
            policyholders.csc_id,
            policyholders.reference_no, 
            requestdatas.net_premium,
            policynotes.policy_no_type,
            policynotes.status,
            policynotes.policy_no 
            FROM policyholders INNER JOIN 
            requestdatas ON 
            policyholders.id = requestdatas.policyholder_id
            INNER JOIN policynotes ON
            policynotes.requestdata_id = requestdatas.id 
            WHERE policyholders.id=$policyholder_id 
            AND policy_no_type=2";

        $stmt = $conn->query($sql_query);
        $policyDataCount = $stmt->rowCount();
        if ($policyDataCount > 0) {
            $policyData = $stmt->fetch(PDO::FETCH_ASSOC);
            $fetch_policy_no = $policyData['policy_no'];
            $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL . 'ThankYou/' . $fetch_policy_no . '?access_id=' . $reference_no);
            timeTracker(__LINE__, basename(__FILE__), $url_redirect, $conn);

            header('Location: ' . PROJECT_REDIRECT_URL . 'ThankYou/' . $fetch_policy_no . '?access_id=' . $reference_no);
        } else {
            $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL . 'Error?access_id=' . $reference_no);
            timeTracker(__LINE__, basename(__FILE__), $url_redirect, $conn);

            header('Location: ' . PROJECT_REDIRECT_URL . 'Error?access_id=' . $reference_no);
        }
    }
    exit;
} else {
    if ($policyStatus == 1) {
        $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL . 'ThankYou/' . $policy_no . '?access_id=' . $reference_no);
        header('Location: ' . PROJECT_REDIRECT_URL . 'ThankYou/' . $policy_no . '?access_id=' . $reference_no);
    } else {
        $payment_url = 'razorpay/pay.php?refrence_no=' . $reference_no;

        $qno_sql = "SELECT id, quote_id, gross_premium, service_tax FROM `requestdatas` WHERE `policyholder_id` = '" . $policyholder_id . "'";

        $stmt = $conn->query($qno_sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $request_id = $row['id'];

        $api_response = '{"httpCode":"404","httpMessage":"Payment Failed","moreInformation":"Payment Failed","retry":1,"payment_url":' . '"' . $payment_url . '"' . '}';

        //echo '<pre>',print_r($api_response);die();

        $update_policy_sql = "UPDATE policynotes SET additional_info ='$api_response' WHERE requestdata_id=$request_id";
        $conn->query($update_policy_sql);

        $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL . 'Error?access_id=' . $reference_no);
        //timeTracker(__LINE__,basename(__FILE__),$url_redirect,$conn);

        if ($payment_link_status == 1) {
            $payment_response_link = $domain_url . '/razorpay/external_payment_response.php' . '?refrence_no=' . $reference_no;
            header('Location: ' . $payment_response_link);
        } else {
            header('Location: ' . PROJECT_REDIRECT_URL . 'Error?access_id=' . $reference_no);
        }
    }
}
