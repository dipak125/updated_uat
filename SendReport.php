<?php

namespace App\Helpers;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\apiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;

class SendReport
{
	public static function processUpdate()
	{
		
		$is_cron_active = DB::table('portal_crons')->where('cron_name', 'send_bulk_email_sms')->where('cron_status','1')->count();

		if($is_cron_active > 0)
		{
			$cron_data = DB::table('portal_crons')->where('cron_name', 'send_bulk_email_sms')->where('cron_status','1')->first();

			$cron_details = DB::table('cron_activities')->where('cron_id', $cron_data->id)->orderBy('id', 'DESC')->first();
			if(!is_null($cron_details))
			{
				if(!is_null($cron_details->execuation_end_at) && !empty($cron_details->execuation_end_at))
				{
					self::sendPolicyEmailSms($cron_data->id);
					
					echo "Job Done....1";
				}
			}
			else
			{
				self::sendPolicyEmailSms($cron_data->id);
				echo "Job Done-----2";
			}
		}
		else
		{
			echo "Cron is inactive";
		}

	}

	public static function registraionCheck()
	{
		$is_cron_active = DB::table('portal_crons')->where('cron_name', 'registration_matching')->where('cron_status','1')->count();
		
		if($is_cron_active > 0)
		{
			$cron_details = DB::table('cron_activities')->where('cron_id', 13)->orderBy('id', 'DESC')->first();
			if(!empty($cron_details))
			{
				if(!is_null($cron_details->execuation_end_at) && !empty($cron_details->execuation_end_at))
				{
					self::registraion();
					echo "check Complete";
				}
			}
			else
			{
				self::registraion();
				echo "check Complete";
			}
		}
		else
		{
			echo "Cron is inactive";
		}

	}


	public static function registraion()
	{
		$start_date = date('Y-m-d');
		//$start_date  = date('Y-m-d',(strtotime ( '-1 day' , strtotime ($start_date))));
		//print_r($start_date);die();
		// $getPolicyStatus = DB::table('policynotes')->where('status',1)->where('policy_no_type',2)
		// ->whereDate('created_at', '=', $start_date)
		// //->limit(15)
		// ->orderBy('id','desc')->get();
		// print_r("hi".$getPolicyStatus);die();


		$datas = DB::table('policynotes')
			->leftJoin('requestdatas','policynotes.requestdata_id','=','requestdatas.id')
			->leftJoin('policyholders','requestdatas.policyholder_id','=','policyholders.id')
			->leftJoin('motorinsurances','requestdatas.policyholder_id','=','motorinsurances.policyholder_id')
			->where('policynotes.status', 1)
			->limit(2)
			->where('policynotes.policy_no_type', 2)
			->where('policynotes.fraud_status', 0)
			->whereDate('policynotes.created_at', '=', $start_date)->get();
			//->whereDate('policynotes.created_at','>=',$param['from_date'])->whereDate('policynotes.created_at','<=', $param['to_date'])

			// $reg_no=$datas[2]->registration_no;
			// $reg_part_no=$datas[2]->registration_part_numbers;
			// $reg_part_obj = json_decode($reg_part_no);
			
			// $part1=$reg_part_obj->reg_number_part_one;
			// $part2=$reg_part_obj->reg_number_part_two;
			// $part3=$reg_part_obj->reg_number_part_three;
			// $part4=$reg_part_obj->reg_number_part_four;

			

			// $reg_concat= $part1."".$part2."".$part3."".$part4;
			// $status=strcmp($reg_no,$reg_concat);
			
			$a=array();
			
			
			foreach ($datas as $data) {
				
				if(isset($data->registration_no) && isset($data->registration_part_numbers))
				{
					$reg_no= isset($data->registration_no) ? $data->registration_no : "";
					$reg_part_no=$data->registration_part_numbers;
					$reg_part_obj = json_decode($reg_part_no);
				
					$part1=isset($reg_part_obj->reg_number_part_one) ? $reg_part_obj->reg_number_part_one :"";
					$part2=isset($reg_part_obj->reg_number_part_two) ? $reg_part_obj->reg_number_part_two : "";
					$part3=isset($reg_part_obj->reg_number_part_three) ? $reg_part_obj->reg_number_part_three: "";
					$part4=isset($reg_part_obj->reg_number_part_four) ? $reg_part_obj->reg_number_part_four:"";

					$reg_concat= $part1."".$part2."".$part3."".$part4;
					
					
					$status=strcmp($reg_no,$reg_concat);

					// if("49765"==$data->policyholder_id)
					// {
					// 	print_r(strcmp($reg_no,$reg_concat));die();
					// 	print_r($reg_no==$reg_concat);die();
					// }
					if($status!=0 && isset($data->policy_no))
					{
						array_push($a,$data->policy_no);
					}
					
				}
				if(isset($data->requestdata_id))
				{
						$affected = DB::table('policynotes')
								->where('requestdata_id', $data->requestdata_id)
								->update(['fraud_status' => 1]);
				}
				
			}
			print_r($a);die();
			
			
	}
	public static function sendPolicyEmailSms($cron_data_id)
	{
		$getPolicyStatus = DB::table('policynotes')->where('status',1)->where('policy_no_type',2)->where('is_report_send',0)
		->whereDate('created_at', '=', date('Y-m-d'))
		->limit(15)
		->orderBy('id','desc')->get();
		if(!empty($getPolicyStatus))
		{
			$i=1;
			$start_date_time = date('Y-m-d h:s:a');
			//$dashboardController = new DashboardController();
        	//$response = $dashboardController->callPolicyCustomerMsg('POPMCAR00100016214');
        	
			foreach ($getPolicyStatus as $key => $value) 
			{
				$policy_no = $value->policy_no;
				
        		$paymentController = new PaymentController();
        		$call_email_sms = $paymentController->sendFiaPaymentReport($policy_no);

        		$paymentController = new PaymentController();
        		$call_email_sms = $paymentController->jkBimaSendReport($policy_no);
        		
        		$i++;
			}

			$end_date_time = date('Y-m-d h:s:a');
            DB::table('cron_activities')->insert([
                'cron_id'=>$cron_data_id,
                'execuation_start_at' => $start_date_time,
                'execuation_end_at' => $end_date_time
            ]);
		}
		return true;
	}
	
}