
<?php


require('config.php');
require('razorpay-php/Razorpay.php');
use Razorpay\Api\Api;
require_once 'db_connect.php';
require('timeTracker.php');

session_start();
timeTracker(__LINE__,basename(__FILE__),$_GET,$conn);
$error=false;
$msg='';

// sleep(15);

if(isset($_GET['refrence_no']))
{
    $refrence_no = trim($_GET['refrence_no']);
    $sql_query = "
    SELECT 
    policyholders.id,
    policyholders.bcmaster_id,
    policyholders.bc_agent_id,
    policyholders.menumaster_id,
    policyholders.first_name,
    policyholders.email_id,
    policyholders.mobile,
    policyholders.reference_no,
    requestdatas.quote_id, 
    requestdatas.sum_insured,
    requestdatas.start_date,
    requestdatas.service_tax,
    requestdatas.payment_link_status,
    requestdatas.gross_premium,
    requestdatas.net_premium,
    requestdatas.csc_share_amount,
    policynotes.policy_no_type,
    policynotes.policy_no,
    policynotes.status,
    menumasters.name,
    vehiclebrandmodels.vehicletype_id,
    bcmasters.logo 
    FROM policyholders INNER JOIN 
    requestdatas ON 
    policyholders.id = requestdatas.policyholder_id
    INNER JOIN policynotes ON
    policynotes.requestdata_id = requestdatas.id
    LEFT JOIN vehiclebrandmodels ON
    policyholders.id = vehiclebrandmodels.policyholder_id
    LEFT JOIN bcmasters ON
    policyholders.bcmaster_id = bcmasters.id 
    INNER JOIN menumasters ON
    policyholders.menumaster_id = menumasters.id 
    WHERE policyholders.reference_no='$refrence_no'";

    $stmt = $conn->query($sql_query);
    $policyDataCount = $stmt->rowCount();
   
    if ($policyDataCount > 0) {       
        
         $policyData = $stmt->fetch(PDO::FETCH_ASSOC);
         
        if($policyData['net_premium']>0)
        {
            $id = $policyData['id'];
            $product_id = $policyData['vehicletype_id'];
            $menumaster_id = $policyData['menumaster_id'];
            $sum_insured = $policyData['sum_insured'];
            $name = $policyData['first_name'];
            $email_id = $policyData['email_id'];
            $mobile = $policyData['mobile'];
            $sum_insured = $policyData['sum_insured'];
            $reference_no = $policyData['reference_no'];
            $gross_premium = $policyData['gross_premium'];
            $service_tax = $policyData['service_tax'];
            $net_premium = $policyData['net_premium'];
            $share_amount = $policyData['csc_share_amount'];
            $product_name = $policyData['name']." Insurance";
            $quote_id = $policyData['quote_id'];
            $bc_logo = "logo/".$policyData['logo'];
            $bcmaster_id = $policyData['bcmaster_id'];
            $bc_agent_id = $policyData['bc_agent_id'];
            $payment_link_status = $policyData['payment_link_status'];

            $policy_no_type = $policyData['policy_no_type'];
            $policy_no = $policyData['policy_no'];

            $policy_start_date = $policyData['start_date'];
            $policy_start_date = date('Y-m-d',strtotime("$policy_start_date"));
            $current_date_time = date('Y-m-d');

            $d1 = strtotime($policy_start_date);
            $d2 = strtotime($current_date_time);

            if($d1 < $d2)
            {
             
                $error=true;
                $msg='Payment Process Expired';
            }
           
            if($policy_no_type == 2)
            {
             
                $error=true;
                $msg='Policy Already Created';
            }

            if($payment_link_status==1)
            {
              
                $product_id='ex';
            }

            $_SESSION['policyholder_id'] = $id;
            $_SESSION['menumaster_id'] = $menumaster_id;

            // if($bcmaster_id==0)
            // {
            //     $error=true;
            //     $msg='Access is denied. Only available for Non CSC user';
            // }
           
        }
        else
        {
            $error=true;
            $msg='Insurance amount Not found';
        }
    }
    else
    {
        $error=true;
        $msg='No data found';
    }
    //$conn=null;
}
else
{
    $error=true;
    $msg='Reference No not found';
}

if(!$error)
{
  
    $additional_info = [
        'policyholder_id' => $id,
        'ref_no' => $refrence_no,
        'environment' => 'RuralPortal',
        'gross_premium' => $gross_premium,
        'quote_id' => $quote_id,
        'product_id' => $product_id,
        'menumaster_id' => $menumaster_id,
        'domain_url' => $domain_url,
        'bcmaster_id'=> $bcmaster_id,
        'bc_agent_id'=> $bc_agent_id,
        'redirect_url' => PROJECT_REDIRECT_URL,
    ];

    $api = new Api($keyId, $keySecret);
    $orderData = [
        'receipt'         => 'rcptid_'.rand(11111111111,99999999999),
        'amount'          => $net_premium * 100,
        'currency'        => 'INR',
        'payment_capture' => 1, // auto capture
        'notes'           => $additional_info
    ];

    $_SESSION['request_data'] = json_encode($orderData);
    $_SESSION['api_url'] = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
    
    $razorpayOrder = $api->order->create($orderData);
    $razorpayOrderId = $razorpayOrder['id'];
    $_SESSION['razorpay_order_id'] = $razorpayOrderId;
    $displayAmount = $amount = $orderData['amount'];

    if ($displayCurrency !== 'INR')
    {
        $url = "https://api.fixer.io/latest?symbols=$displayCurrency&base=INR";
        $exchange = json_decode(file_get_contents($url), true);
        $displayAmount = $exchange['rates'][$displayCurrency] * $amount / 100;
    }

    $data = [
        "key"               => $keyId,
        "amount"            => $amount,
        "name"              => $name,
        "description"       => $product_name,
        "image"             => $bc_logo,
        "prefill"           => [
            "name"              => $name,
            "email"             => $email_id,
            "contact"           => $mobile,
        ],
        "notes"             => $additional_info,
        "theme"             => [
        "color"             => "#F37254"
        ],
        "order_id"          => $razorpayOrderId,
    ];

    if ($displayCurrency !== 'INR')
    {
        $data['display_currency']  = $displayCurrency;
        $data['display_amount']    = $displayAmount;
    }

    $json = json_encode($data);

    $api_name = "Payment_initiated";

    $log_sql = "INSERT INTO `apilogs` (`id`, `api_name`, `policyholder_id`, `api_url`, `api_request`, `api_response`, `updated_at`) VALUES (NULL, '".$api_name."', '".$id."', '', '".$json."', '', NOW())";
    $lstmt = $conn->query($log_sql);

    timeTracker(__LINE__,basename(__FILE__),$data,$conn);
  
   
    require("checkout/{$checkout}.php");
   
}
else
{
    echo $msg;die();
    if($policy_no_type == 2)
    {
        if($payment_link_status==1)
        {
            $payment_response_link = $domain_url.'/razorpay/external_payment_response.php'.'?refrence_no='.$reference_no;
            header('Location: '.$payment_response_link);
        }
        else
        {
            $url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL.'ThankYou/'.$policy_no.'?access_id='.$reference_no);
            timeTracker(__LINE__,basename(__FILE__),$url_redirect,$conn);
            header('Location: '.PROJECT_REDIRECT_URL.'ThankYou/'.$policy_no.'?access_id='.$reference_no);

        }
        
    }
    elseif(isset($id))
    {
        $policyholder_id = $id;
        $status_message= $msg;
        $transaction_date = date('Y-m-d');
        $transaction_status = 0;
        $sql = "INSERT INTO payments (policyholder_id,transaction_date,transaction_status,status_message)
        VALUES ($policyholder_id,'$transaction_date',$transaction_status,'$status_message')";
        $stmt = $conn->query($sql);
        unset($_SESSION['policyholder_id']);
        $conn=null;
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
              case '7':
                $location_url = $location_url ."Premium_GCV_TP/7"; 
                  break;
              case '8':
                $location_url = $location_url ."Premium_GCV/8"; 
                break;   
              case '9':
                $location_url = $location_url ."Premium_SME/9"; 
                break;  
              case '10':
                $location_url = $location_url.'PolicyDetails_KSB/10';
                break;
              case '11':
                $location_url = $location_url ."Premium_MISCD/11"; 
                break;
              case '12':
                $location_url = $location_url ."arogya_PolicyDetails/12"; 
                break;
              case '13':
                $location_url = $location_url ."AccidentAdditionalPremium/13"; 
                break;
              case '14':
                $location_url = $location_url ."PolicyDetails_GSB/14"; 
                break; 
              case '15':
                $location_url = $location_url ."PremiumOD/15"; 
                break; 
              case '16':
                $location_url = $location_url ."two_wheeler_policy_premium_detailsOD/16"; 
                break;   
            default:
                # code...
                break;
        }

        header('Location:'.$location_url."?access_id=".$refrence_no);
    }
    echo $msg;die();
}


