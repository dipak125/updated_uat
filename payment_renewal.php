<?php 
    @session_start();
    require_once 'includes/BridgePGUtil.php';
	require_once 'includes/db_connect.php';
	require_once 'includes/connect_config.php';
	require('../razorpay/timeTracker.php');

    $error=false;
    $msg='';
	if(isset($_GET['refrence_no']))
	{
		$refrence_no = trim($_GET['refrence_no']);
		$sql_query = "
		SELECT 
		policyholders.id,
		policyholders.menumaster_id,
		policyholders.csc_id,
		policyholders.reference_no,
		requestdatas.own_damage,
		requestdatas.liability_third_party, 
		requestdatas.sum_insured,
		requestdatas.service_tax,
		requestdatas.gross_premium,
		requestdatas.csc_share_amount,
		requestdatas.net_premium,
		requestdatas.start_date,
		requestdatas.payable_premium,
		requestdatas.commission_json,
		cscmasters.type,
		menumasters.name,
		vehiclebrandmodels.vehicletype_id,
		vehicletypes.name as product_name,
		vehicletypes.is_helth as is_helth,
		policynotes.policy_no_type,
		policynotes.policy_no,
        policynotes.status,
        payments.status_message,
		vehicletypes.csc_product_id 
		FROM policyholders INNER JOIN 
		requestdatas ON 
		policyholders.id = requestdatas.policyholder_id
		INNER JOIN vehiclebrandmodels ON
		policyholders.id = vehiclebrandmodels.policyholder_id
		INNER JOIN vehicletypes ON
		vehicletypes.id = vehiclebrandmodels.vehicletype_id
		LEFT JOIN payments ON
		policyholders.id = payments.policyholder_id
		INNER JOIN cscmasters ON
		policyholders.csc_id = cscmasters.csc_digital_seva_id
		INNER JOIN policynotes ON
        policynotes.requestdata_id = requestdatas.id 
		INNER JOIN menumasters ON
		policyholders.menumaster_id = menumasters.id
		WHERE policyholders.reference_no='$refrence_no'";

		$result = $conn->query($sql_query);
		$policyData = $result->fetch_assoc();
	
		if (count($policyData) > 0) {		
			
			/*if($policyData['sum_insured']>0)
			{*/
				$id = $policyData['id'];
				$menumaster_id = $policyData['menumaster_id'];
				$sum_insured = $policyData['sum_insured'];
				$reference_no = $policyData['reference_no'];
				$gross_premium = $policyData['gross_premium'];
				$service_tax = $policyData['service_tax'];
				$csc_share_amount = $policyData['csc_share_amount'];
				$net_premium = $policyData['net_premium'];
				$payable_premium = $policyData['payable_premium'];
				$product_name = $policyData['product_name'];
				$csc_id = $policyData['csc_id'];
				$product_id = $policyData['csc_product_id'];
				$type = $policyData['type'];
				$policy_no_type = $policyData['policy_no_type'];
				$policy_no = $policyData['policy_no'];
				$status_message = $policyData['status_message'];
				$vehicletype_id = $policyData['vehicletype_id'];
				$is_helth = $policyData['is_helth'];
				$commission_json = $policyData['commission_json'];
				$own_damage = $policyData['own_damage'];
				$liability_third_party = $policyData['liability_third_party'];

				$policy_start_date = $policyData['start_date'];
	            $policy_start_date = date('Y-m-d',strtotime("$policy_start_date"));
	            $current_date_time = date('Y-m-d');
	            $d1 = strtotime($policy_start_date);
	            $d2 = strtotime($current_date_time);

	            $param_1 = '';
	            $param_2 = '';
	            $param_3 = '';
	            $param_4 = '';
	            $bill_param = $commission_json;

	            if($is_helth == 0)
	            {
	            	$json_value = json_decode($commission_json);
	            	$arr['ODrate'] = $json_value->ODRate; 
					$arr['TParate'] = $json_value->TPRate;
					$od_tp_comission = json_encode($arr);

	            	$param_1 = $own_damage;
		            $param_2 = $liability_third_party;
		            $param_3 = $od_tp_comission;
		            $param_4 = $service_tax;
	            }

	            if($is_helth == 1)
	            {
	            	$arr['ODrate'] = 0; 
					$arr['TParate'] = 0;
					$od_tp_comission = json_encode($arr);

	            	$param_1 = $gross_premium;
		            $param_2 = $liability_third_party;
		            $param_3 = $od_tp_comission;
		            $param_4 = $service_tax;
	            }

	            if($d1 <= $d2)
	            {
	                $error=true;
	                $msg='Payment Process Expired';
	            }

				if($policy_no_type == 2)
				{
					$error=true;
					$msg='Policy Already Created';
				}

				if($csc_id=='')
				{
					$error=true;
					$msg='CSC Id Not found';
				}

				if($status_message =='Successful')
				{
					$error=true;
					$msg='Payment Already Done';
				}
				

				// $product_id = '5221643668';
				// if($type == 'POSP')
				// {
				// 	$product_id = $policyData['csc_product_id'];
				// }
				if($type=='POSP')
				{
					$product_id = $policyData['csc_product_id'];
				}
				else
				{
					/*
					5221643668	Health Insurance RAP
					5221671739	Motor two wheeler Comprehensive Insurance
					5221671739	Motor Four Wheeler Comp
					5221685518	Motor two wheeler Third Party Insurance
					5221685518	Motor four wheeler Third Party Insurance*/

					//die($vehicletype_id);

					switch ($vehicletype_id) {
						case 1:
							$product_id ='5221671739';
							break;
						case 2:
							$product_id ='5221671739';
							break;
						case 3:
							$product_id ='5221685518';
							break;	
						case 4:
							$product_id ='5221671739';
							break;		
						case 6:
							$product_id ='5221685518';
							break;
						case 7:
							$product_id ='5221685518';
							break;	
						case 8:
							$product_id ='5221671739';
							break;	
						case 11:
							$product_id ='5221671739';
							break;	
						case 15:
							$product_id ='5221624682';
							break;
						case 16:
							$product_id ='5221624682';
							break;
						case 17:
							$product_id ='5221671739';
							break;
						case 18:
							$product_id ='5221671739';
							break;
						case 19:
							$product_id ='5221638772';
							break;	
						case 27:
							$product_id ='5221671739';
							break;				
						default:
							# code...
							break;
					}
				}
				$_SESSION['reference_no'] = $reference_no;
				$_SESSION['policyholder_id'] = $id;
				$_SESSION['menumaster_id'] = $menumaster_id;
			/*}
			else
			{
				$error=true;
				$msg='Insurance amount Not found';
			}*/
		}
		else
		{
			$error=true;
			$msg='No data found';
		}
		
	}
	else
	{
		$error=true;
		$msg='Reference No not found';
	}

	if(!$error)
	{
	date_default_timezone_set('Asia/Kolkata');

	//$share_amount = ($gross_premium*15)/100;
	//$csc_share_amount = number_format((float)$share_amount, 2, '.', '');

	$merchant_txn = 'MW' . rand(111111111111,999999999999);

	$bconn = new BridgePGUtil();
	$p = array('csc_id' => $csc_id,
        'merchant_id' => '52216',
        'merchant_txn' => $merchant_txn,
        'merchant_txn_date_time' => date('Y-m-d H:i:s'),
        'product_id' => $product_id,
        'product_name' => $product_name,
        'txn_amount' => $payable_premium,
        'amount_parameter' => 'NA',
        'txn_mode' => 'D',
        'txn_type' => 'D ',
        'merchant_receipt_no' => date('Y-m-d H:i:s'),
        'csc_share_amount' => $csc_share_amount,
        'pay_to_email' => 'NA',
        'return_url' => PROJECT_URL.'ConnectPG/pay_success_renewal.php',
        'cancel_url' => PROJECT_URL.'ConnectPG/pay_cancel_renewal.php',
        'Currency' => 'INR',
        'Discount' => 0,
        'param_1' => $param_1,
        'param_2' => $param_2,
        'param_3' => $param_3,
        'param_4' => $param_4,
        'bill_param' => $bill_param);

	//echo '<pre>',print_r($p);die();

	$request_data = json_encode($p);
	$_SESSION['request_data'] = $request_data;
	$bconn->set_params($p);
	$enc_text = $bconn->get_parameter_string(); 
	$frac = $bconn->get_fraction();
	$_SESSION['api_url'] = PAYMENT_URL.$frac;
	$_SESSION['api_request'] = json_encode($p);
	$transaction_date = date("Y-m-d H:i:s");
	

	$cancel_sql = "INSERT INTO payments (policyholder_id,request_data,reference_no, transaction_no,transaction_date)
        VALUES ($id, '$request_data','$reference_no','$merchant_txn','$transaction_date')";

    $conn->query($cancel_sql);


	$api_name = 'Payment API';
	$api_url = $_SERVER['REQUEST_URI'];
	$response = '';

	$log_sql = "INSERT INTO `apilogs` (`id`, `api_name`, `policyholder_id`, `api_url`, `api_request`, `api_response`, `updated_at`) VALUES (NULL, '".$api_name."', '".$id."', '".$api_url."', '".$request_data."', '".$response."', NOW())";
	$conn->query($log_sql);
	$conn->close();
	
?>
<html>
<head></head>
<body>
	<form name="member_signup" method="post" action="<?php echo $_SESSION['api_url'];?>">
	   <input type="hidden" name="message" value="<?=$enc_text;?>" />          
	</form>
</body>
</html>
<script>
	window.onload = function(){
  		document.forms['member_signup'].submit();
    }
</script>
<?php }
else 
	{
		
		if($status_message =='Successful')
		{
			$url_redirect = array('url_redirect' => PROJECT_REDIRECT_URL.'ThankYouRenewal?access_id='.$reference_no);

        	timeTracker(__LINE__,basename(__FILE__),$url_redirect,$conn);
        	header('Location: '.PROJECT_REDIRECT_URL.'ThankYouRenewal?access_id='.$reference_no);
		}
		else
		{
			echo $msg;die();
		}
		

	}?>