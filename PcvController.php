<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Policyholder;
use App\Models\Requestdata;
use App\Models\Nominee;
use App\Models\Vehiclemodel;
use App\Models\Vehiclebrandmodel;
use App\Models\Varientmodel;
use App\Models\Previouspolicy;
use App\Models\Insurancecompany;
use App\Models\Motorinsurance;
use App\Models\Vehicle;
use App\Models\Brand;
use App\Models\Bankdetail;
use App\Models\Cancelcarmodel;
use App\Models\Pincode;
use App\Models\Rtolocation;
use Carbon\Carbon;
use App\Models\Otpporcess;
use Illuminate\Support\Facades\Config;
use App\Http\Controllers\apiController;
use Illuminate\Support\Facades\Mail;
use App\Models\Shorttermnewpolicy;
use App\Models\Apilog;
use App\Models\PreviouspoliciesClaim;
use DateTime;
use App\Models\Policynote;

class PcvController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        date_default_timezone_set('Asia/Kolkata');
        $apiKey = Config::get('auth.apiKey');
        defined('CLIENT_ID') or define('CLIENT_ID', $apiKey['client_id']);
        defined('CLIENT_SECRET') or define('CLIENT_SECRET', $apiKey['client_secret']);
    }

    public function registration(Request $request)
    {
        $data=array();
        $error=false;
        $msg='';

        $this->validate($request, [
            'policy_type_id' => 'required',
            'policy_for' => 'required',
            'subclass_id' => 'required',
            'vehicle_type_id' => 'required',
            'page_name'=>'required',
        ]);

        $registration_no = $request->input('registration_no');
        $csc_id = $request->input('csc_id');
        $agent_name = $request->input('agent_name');
        $bcmaster_id = $request->input('bcmaster_id');
        $bc_token = $request->input('bc_token');
        $check_registration = $request->input('check_registration');
        $policy_for = $request->input('policy_for');// individual , corporate
        $policy_type_id = $request->input('policy_type_id'); // rollover..laps
        $bc_agent_id = $request->input('bc_agent_id');
        $subclass_id = $request->input('subclass_id');//sub product
        $page_name = $request->input('page_name');
        $registration_part_numbers = $request->input('registration_part_numbers');
        $vehicle_type_id = $request->input('vehicle_type_id');
        $menumaster_id = 12;
        $product_id = $request->input('vehicle_type_id');
        $lapse_duration = $request->input('lapse_duration');

        if($check_registration==2)
        {
            $formatted_registation_no = str_replace(" ","-",$registration_no);
            $rto_code = substr($formatted_registation_no,0,2);
            $check_location_count = Rtolocation::where('RTO_CODE',$rto_code)->count();
            if(!$error)
            {
                $chkArr = $this->checkRegistration($registration_no);
                if($chkArr['error'])
                {
                    $error = true;
                    $msg = $chkArr['msg'];
                }
            }
        }

        
        if(!$error)
        {
            $vehicle_data_count = Vehicle::where('status', 1)->where('id',$vehicle_type_id)->count();
            if($vehicle_data_count > 0)
            {
                //$reference_no = md5(time());
                $reference_no = '';
                $policyHolder = Policyholder::firstOrNew(array('reference_no' => $request->input('reference_no')));
                $policyHolder->reference_no =  $reference_no;
                $policyHolder->step_no = 1;
                $policyHolder->status =1;
                $policyHolder->csc_id = $csc_id;
                $policyHolder->product_id = $product_id;
                $policyHolder->agent_name = $agent_name;
                $policyHolder->bcmaster_id = $bcmaster_id;
                $policyHolder->bc_token = $bc_token;
                $policyHolder->bc_agent_id = $bc_agent_id;
                $policyHolder->menumaster_id =$menumaster_id;
                $policyHolder->page_name = $page_name;
                $policyHolder->user_id = $this->guard()->user()->id;
                $policyHolder->save();
                $policyHolder_id = $policyHolder->id;
                if($policyHolder_id)
                {
                    //$vehiclebrandmodel = Vehiclebrandmodel::firstOrNew(array('policyholder_id' => $policyHolder_id));
                    $vehiclebrandmodel = new Vehiclebrandmodel;
                    $vehiclebrandmodel->policyholder_id = $policyHolder_id;
                    $vehiclebrandmodel->vehicletype_id = $vehicle_type_id;
                    $vehiclebrandmodel->save();
                    $vehiclebrandmodel_id = $vehiclebrandmodel->id;

                    //Insert into motor insurance

                    $motorinsurance = new Motorinsurance;
                    $motorinsurance->policyholder_id = $policyHolder_id;
                    $motorinsurance->registration_no = $registration_no;
                    $motorinsurance->registration_part_numbers = $registration_part_numbers;
                    $motorinsurance->policy_for = $policy_for;
                    $motorinsurance->policytype_id = $policy_type_id;
                    $motorinsurance->subclass_id = $subclass_id;
                    $motorinsurance->lapse_duration = $lapse_duration;
                    $motorinsurance->save();
                    $motorinsurance_id = $motorinsurance->id;

                    $requestData = new Requestdata;
                    $requestData->policyholder_id = $policyHolder_id;
                    $requestData->status = 1;
                    $requestData->request_for = 'self';
                    $requestData->save();
                    $request_data_id = $requestData->id;


                    if($motorinsurance_id)
                    {
                        $reference_no = $this->updateAgentName($policyHolder_id);
                        $msg='Success! Policyholder successfully created';
                        $data['policyHolder_id'] = $policyHolder_id;
                        $data['policyHolder_refNo'] = $reference_no;
                        $data['vehiclebrandmodel_id'] = $vehiclebrandmodel_id;
                        $data['motorinsurance_id'] = $motorinsurance_id;
                        $data['menumaster_id'] = $menumaster_id;
                        $data['request_data_id'] = $request_data_id;
                        $data['completedStep'] = 1;
                    }
                }
            }
            else
            {
                $error=true;
                $msg='Error! Vehicle id is not exist';
            }

        }
        

        return $this->apiRespone($data,$error,$msg);
        
    }

    public function updateRegistration(Request $request)
    {
        $data=array();
        $error=false;
        $msg='';

        $this->validate($request, [
            'policy_holder_id'=>'required|integer',
            'policy_type_id' => 'required',
            'policy_for' => 'required',
            'subclass_id' => 'required',
        ]);

        $policyholder_id = $request->input('policy_holder_id');
        $registration_no = $request->input('registration_no');
        $check_registration = $request->input('check_registration');
        $policy_for = $request->input('policy_for');
        $policy_type_id = $request->input('policy_type_id');
        $subclass_id = $request->input('subclass_id');
        $registration_part_numbers = $request->input('registration_part_numbers');
        $menumaster_id = 12;
        $lapse_duration = $request->input('lapse_duration');

        if($check_registration==2)
        {
            $formatted_registation_no = str_replace(" ","-",$registration_no);
            $rto_code = substr($formatted_registation_no,0,2);
            $check_location_count = Rtolocation::where('RTO_CODE',$rto_code)->count();
            /*if($check_location_count == 0)
            {
                $error=true;
                $msg='Error! Invalid Registration No';
            }*/

            if(!$error)
            {
                $chkArr = $this->checkRegistration($registration_no);
                if($chkArr['error'])
                {
                    $error = true;
                    $msg = $chkArr['msg'];
                }
            }
        }

        if(!$error)
        {
            $policy_data_id = Policyholder::where('status', 1)->where('id',$policyholder_id)->where('menumaster_id',$menumaster_id)->count();
            if($policy_data_id > 0)
            {
                $policy_data = Policyholder::where('status', 1)->where('id',$policyholder_id)->first();
                $motorinsurance_data_id = $policy_data->motorinsurance->id;
                $motorinsurance_data = Motorinsurance::find($motorinsurance_data_id);
                if($policy_for != $motorinsurance_data->policy_for)
                {
                    $motorinsurance_data->add_more_coverage = null;
                    $motorinsurance_data->add_more_coverage_request_json = null;
                }
                $motorinsurance_data->registration_no = $registration_no;
                $motorinsurance_data->registration_part_numbers = $registration_part_numbers;
                $motorinsurance_data->policy_for = $policy_for;
                $motorinsurance_data->policytype_id = $policy_type_id;
                $motorinsurance_data->subclass_id = $subclass_id;
                $motorinsurance_data->lapse_duration = $lapse_duration;
                $response  = $motorinsurance_data->save();
                if($response)
                {
                    $msg='Success! Registration no successfully updated';
                }
                else
                {
                    $error=true;
                    $msg='Error! Update Error';
                }
            }
            else
            {
                $error=true;
                $msg='Error! Policy Holder id not exist';
            }

        }

        

        return $this->apiRespone($data,$error,$msg);
    }


    public function insertBrandModelVarient(Request $request)
    {
        $data=array();
        $error=false;
        $msg='';

        $this->validate($request, [
            'policy_holder_id'=>'required|integer',
            'brand_id'=>'required|integer',
            'brand_model_id'=>'required|integer',
            'model_varient_id'=>'required|integer',
            'page_name'=>'required',
        ]);

        $policyholder_id = $request->input('policy_holder_id');
        $brand_id = $request->input('brand_id');
        $brand_model_id = $request->input('brand_model_id');
        $menumaster_id = 12;
        $model_varient_id = $request->input('model_varient_id');
        $page_name = $request->input('page_name');

        $policy_data_count = Policyholder::where('status', 1)->where('id',$policyholder_id)->where('menumaster_id',$menumaster_id)->count();
        if($policy_data_count > 0)
        {
            $brans_data_count = Brand::where('status', 1)->where('id',$brand_id)->count();
            if($brans_data_count>0)
            {
                $policy_data = Policyholder::where('status', 1)->where('id',$policyholder_id)->first();
                
                $vehiclebrandmodel_id = $policy_data->vehiclebrandmodel->id;
                $vehiclebrandmodel = Vehiclebrandmodel::find($vehiclebrandmodel_id);
                $vehiclebrandmodel->vehiclebrand_id = $brand_id;
                $vehiclebrandmodel->vehiclemodel_id = $brand_model_id;
                $vehiclebrandmodel->varientmodel_id = $model_varient_id;
                $response = $vehiclebrandmodel->save();
                if($response)
                {
                    $msg='Success! Data successfully updated';
                    $step_no = 2;
                    $this->updatePolicyHolderStep($policyholder_id,$step_no,$page_name);
                    $data['completedStep'] = $step_no;
                }
                else
                {
                    $error=true;
                    $msg='Error! Update Error';
                }
            }
            else
            {
                $error=true;
                $msg='Error! brand id not exist';
            }
        }
        else
        {
            $error=true;
            $msg='Error! Policy Holder id not exist';
        }

        return $this->apiRespone($data,$error,$msg);
    }

    public function insertVehicleDetails(Request $request)
    {
        $data=array();
        $error=false;
        $msg='';

        $this->validate($request, [
            'policy_holder_id'=>'required|integer',
            'registration_date'=>'required|date_format:Y-m-d',
            'location_id'=>'required|integer',
            'vehicleAge'=>'required|integer',
            'policy_type'=>'required|integer',
            'prev_policy_flag'=>'required',
            'previous_is_claim'=>'required|integer',
            'averagemonthlyusage_id' => 'required',
            'proposed_used_id'=>'required|integer',
            'permittype_id' => 'required',
            'page_name'=>'required',
        ]);

        $policyholder_id = $request->input('policy_holder_id');
        $menumaster_id = 12;
        $registration_date = $request->input('registration_date');
        $proposed_used_id = $request->input('proposed_used_id');
        $registration_city = $request->input('registration_city');
        $location_id = $request->input('location_id');
        $previous_start_date = $request->input('previous_start_date');
        $previous_end_date = $request->input('previous_end_date');
        $previous_policy_name = $request->input('previous_policy_name');
        $insurance_company_id = $request->input('insurance_company_id');
        $previous_city = $request->input('previous_city');
        $previous_is_claim = $request->input('previous_is_claim');
        $previous_claim_bonus = $request->input('previous_claim_bonus');
        $previous_claim_for = $request->input('previous_claim_for');
        $previous_policy_no = $request->input('previous_policy_no');
        $vehicle_age = $request->input('vehicleAge');
        $policy_type = $request->input('policy_type');
        $prev_policy_flag = $request->input('prev_policy_flag');
        $valid_previous_policy = $request->input('valid_previous_policy');
        $claim_array = !empty($request->input('claim_array')) ? json_decode($request->input('claim_array'), true) : [];
        $page_name = $request->input('page_name');

        $pol_start_date = $request->input('pol_start_date');
        $pol_end_date = $request->input('pol_end_date');

        $averagemonthlyusage_id = $request->input('averagemonthlyusage_id');
        $permittype_id = $request->input('permittype_id');

        $duration = $request->input('duration');
        $is_new_policy = $request->input('is_new_policy');
        $new_policy_duration = $request->input('new_policy_duration');
        $new_policy_start_date = $request->input('new_policy_start_date');
        $new_policy_end_date = $request->input('new_policy_end_date');

        $start_date = date('Y-m-d');
        $next_year_date = date('Y-m-d',(strtotime ( '+1 year' , strtotime ( $start_date) ) ));
        $expiry_date = date('Y-m-d',(strtotime ( '-1 day' , strtotime ( $next_year_date) ) ));

        $policy_data_count = Policyholder::where('status', 1)->where('id',$policyholder_id)->where('menumaster_id',$menumaster_id)->count();
        if($policy_data_count > 0)
        {
            if($previous_start_date!='')
            {
                $previous_start_date = Carbon::createFromFormat('Y-m-d', $previous_start_date);
                $previous_end_date = Carbon::createFromFormat('Y-m-d', $previous_end_date);

                if(date('Y-m-d') <= date('Y-m-d',(strtotime($previous_end_date)))){
                    $start_date = date('Y-m-d',(strtotime ( '+1 day' , strtotime ($previous_end_date))));
                    $next_year_date = date('Y-m-d',(strtotime ( '+1 year' , strtotime ( $start_date) ) ));
                    $expiry_date = date('Y-m-d',(strtotime ( '-1 day' , strtotime ( $next_year_date) ) ));
                }

                if($previous_start_date > $previous_end_date)
                {
                    $error=true;
                    $msg='Error!End date always bigger than start date';
                }
            }

            if($policy_type == '6')
            {
                $expiry_date = date('Y-m-d',(strtotime ( '+2 year' , strtotime ($expiry_date) ) ));
            }

            if(!$error) 
            {
                $policy_data = Policyholder::where('status', 1)->where('id',$policyholder_id)->first();
                $motorinsurance_data_id = $policy_data->motorinsurance->id;
                $vehiclebrandmodel_id = $policy_data->vehiclebrandmodel->id;

                $motorinsurance_data = Motorinsurance::find($motorinsurance_data_id);
                $motorinsurance_data->registration_date = $registration_date;
                $motorinsurance_data->vehicle_age = $vehicle_age;
                $motorinsurance_data->policy_type = $policy_type;
                $motorinsurance_data->city_id = $registration_city;
                $motorinsurance_data->location_id = $location_id;
                $motorinsurance_data->averagemonthlyusage_id = $averagemonthlyusage_id;
                $motorinsurance_data->permittype_id = $permittype_id;
                $motorinsurance_data->valid_previous_policy = !empty($valid_previous_policy) ? $valid_previous_policy : 0;
                $response = $motorinsurance_data->save();

                // save policy date range.
                $request_data_id = $policy_data->requestData->id;
                $requestData = Requestdata::find($request_data_id);
                $requestData->start_date = $start_date;
                $requestData->end_date = $expiry_date;
                $requestData->save();

                $vehiclebrandmodel = Vehiclebrandmodel::find($vehiclebrandmodel_id);;
                $vehiclebrandmodel->proposed_used_id = $proposed_used_id;
                $vehiclebrandmodel->save();

                if($is_new_policy==1)
                {
                    $request_data_id = $policy_data->requestData->id;
                    $requestData = Requestdata::find($request_data_id);
                    $requestData->start_date = $new_policy_start_date;
                    $requestData->end_date = $new_policy_end_date;
                    $requestData->duration = $new_policy_duration;
                    $requestData->save();
                }
                
                if($response && $previous_start_date!='')
                {
                    //insert or update data on previous policies
                    $previouspolicy_data = Previouspolicy::firstOrNew(array('policyholder_id' => $policyholder_id));
                    $previouspolicy_data->policyholder_id = $policyholder_id;
                    $previouspolicy_data->policy_no =$previous_policy_no;
                    $previouspolicy_data->start_date = $previous_start_date;
                    $previouspolicy_data->end_date = $previous_end_date;
                    $previouspolicy_data->name = $previous_policy_name;
                    $previouspolicy_data->insurancecompany_id = $insurance_company_id;
                    $previouspolicy_data->city = $previous_city;
                    $previouspolicy_data->duration = $duration;
                    $previouspolicy_data->is_claim = $previous_is_claim;
                    $previouspolicy_data->claim_bonus = $previous_claim_bonus;
                    $previouspolicy_data->claim_for = $previous_claim_for;
                    $response = $previouspolicy_data->save();

                    $previouspolicy_claims = PreviouspoliciesClaim::where('previouspolicy_id',$previouspolicy_data->id)->delete();

                    foreach ($claim_array as $key => $claim) {
                        $previouspolicy_claims = new PreviouspoliciesClaim;
                        $previouspolicy_claims->previouspolicy_id = $previouspolicy_data->id;
                        $previouspolicy_claims->claim_amount = $claim['claim_amount'];
                        $previouspolicy_claims->claim_year = $claim['claim_year'];
                        $previouspolicy_claims->type_of_claim = $claim['type_of_claim'];
                        $previouspolicy_claims->save();
                    }
                }

                if($prev_policy_flag==0)
                {
                    $previous_policy_count = Previouspolicy::where('policyholder_id',$policyholder_id)->count();
                    if($previous_policy_count > 0)
                    {
                        $previous_policy_count = Previouspolicy::where('policyholder_id',$policyholder_id)->delete();
                    }
                }

                if($response)
                {
                    $msg='Success! Vehicle details successfully updated';
                    $step_no = 4;
                    $this->updatePolicyHolderStep($policyholder_id,$step_no,$page_name);
                    $data['completedStep'] = $step_no;
                }
            }
            
            
        }
        else
        {
            $error=true;
            $msg='Error! Policy Holder id not exist';
        }

         return $this->apiRespone($data,$error,$msg);
    }

    public function updateInsuredValue(Request $request)
    {
        $data=array();
        $error=false;
        $msg='';

        $this->validate($request, [
            'policy_holder_id'=>'required|integer',
            'menumaster_id'=>'required|integer|min:12|max:12',
            // 'registration_no' => 'required|string',
            'idv_value' => 'required|string',
            'engine_no' => 'required|string',
            'chasis_no'=>'required|string',
            'chasis_no_last_part'=>'required|string',
            'page_name'=>'required',
        ]);

        $coverage_plans='';

        $policyholder_id = $request->input('policy_holder_id');
        $menumaster_id = $request->input('menumaster_id');
        $registration_no = $request->input('registration_no');
        $chasis_no = $request->input('chasis_no');
        $engine_no = $request->input('engine_no');
        $cng_kit = $request->input('cng_kit');
        $cngkit_cost = $request->input('cngkit_cost');
        $chasis_no_last_part = $request->input('chasis_no_last_part');
        $idv_value = $request->input('idv_value');
        $add_more_coverage = $request->input('add_more_coverage');
        $coverage_data = $request->input('coverage_data');
        $pa_cover = $request->input('pa_cover');
        $pa_flag = $request->input('pa_flag');
        $body_idv_value = $request->input('body_idv_value');
        $fuel_type = !is_null($request->input('fuel_type')) ? $request->input('fuel_type') : 0;
        $trailer_array = $request->input('trailer_array');
        $page_name = $request->input('page_name');

        if(!empty($add_more_coverage))
        {
            $coverage_plans = implode(",",$add_more_coverage);
        }

        $chkArr = $this->checkRegistration($registration_no);
        if($chkArr['error'])
        {
            $error = true;
            $msg = $chkArr['msg'];
        }

        if(isset($trailer_array) && !empty($trailer_array)){
            foreach($trailer_array as $key=>$tr){           
                $chkArr = $this->checkRegistration($tr->regNo);
                if($chkArr['error'])
                {
                    $error = true;
                    $tr_num = intval($key)+1;
                    $msg = 'Error : Invalid registration number given in Trailer - '.$tr_num;
                    break;
                }
            }
        }

        /*
        $krishi_kalayan_cess = $request->input('krishi_kalayan_cess');
        $net_premium = $request->input('net_premium');*/

        if(!$error)
        {
            $policy_data_count = Policyholder::where('status', 1)->where('id',$policyholder_id)->where('menumaster_id',$menumaster_id)->count();
            if($policy_data_count > 0)
            {
                $policy_data = Policyholder::where('status', 1)->where('id',$policyholder_id)->first();
                $motorinsurance_data_id = $policy_data->motorinsurance->id;
                $motorinsurance_data = Motorinsurance::find($motorinsurance_data_id);
                $motorinsurance_data->registration_no = $registration_no;
                $motorinsurance_data->chasis_no = $chasis_no;
                $motorinsurance_data->idv_value = $idv_value;
                $motorinsurance_data->chasis_no_last_part = $chasis_no_last_part;
                $motorinsurance_data->engine_no = $engine_no;
                $motorinsurance_data->cng_kit = $cng_kit;
                $motorinsurance_data->cngkit_cost = $cngkit_cost;
                $motorinsurance_data->add_more_coverage = $coverage_plans;
                $motorinsurance_data->pa_cover = $pa_cover;
                $motorinsurance_data->add_more_coverage_request_json = $coverage_data;
                $motorinsurance_data->pa_flag = $pa_flag;
                $motorinsurance_data->body_idv_value = $body_idv_value;
                $motorinsurance_data->trailers = $trailer_array;

                $response  = $motorinsurance_data->save();
                if($response)
                {
                    $requestData = Requestdata::firstOrNew(array('policyholder_id' => $policyholder_id));
                    $requestData->policyholder_id = $policyholder_id;
                    $requestData->status = 1;
                    $requestData->request_for = 'self';
                    $requestData->save();
                    $vehiclebrandmodel = Vehiclebrandmodel::where('policyholder_id', $policyholder_id)->update(['external_fueltype_id' => $fuel_type ]);
                    $requestData_id = $requestData->id;
                    if($requestData_id)
                    {
                        $msg='Success! Insured Value Details successfully updated';
                        $step_no = 6;
                        $this->updatePolicyHolderStep($policyholder_id,$step_no,$page_name);
                        $data['completedStep'] = $step_no;
                    }
                }

            }
            else
            {
                $error=true;
                $msg='Error! Policy Holder id not exist';
            }
        }
        



        return $this->apiRespone($data,$error,$msg);
    }

    public function updateOwnerDetails(Request $request)
    {
        $data=array();
        $error=false;
        $msg='';

        $this->validate($request, [
            'policy_holder_id'=>'required|integer',
            'pincode_id'=>'required',
            'menumaster_id'=>'required|integer|min:12|max:12',
            'first_name'=>'required|string',
            'email'=>'required|email',
            'phone'=>'required|string',
            'pincode' => 'required|string',
            'is_carloan' => 'required|boolean',
            // 'salutation_id' => 'required|integer',
            // 'nominee_title_id' => 'required|integer',
            'page_name'=>'required',
        ]);

        $policyholder_id = $request->input('policy_holder_id');
        $pincode_id = $request->input('pincode_id');
        $menumaster_id = $request->input('menumaster_id');
        $first_name = $request->input('first_name');
        $last_name = $request->input('last_name');
        $gender = $request->input('gender');
        $dob = $request->input('dob');
        $location = $request->input('location');
        $pancard = $request->input('pancard');
        $district = $request->input('district');
        $state = $request->input('state');
        $city = $request->input('city');
        $pincode = $request->input('pincode');
        $is_carloan = $request->input('is_carloan');
        $bank_name = $request->input('bank_name');
        $bank_branch = $request->input('bank_branch');
        $nominee_relation_with = $request->input('nominee_relation_with');
        $nominee_first_name = $request->input('nominee_first_name');
        $nominee_last_name = $request->input('nominee_last_name');
        $nominee_gender = $request->input('nominee_gender');
        $nominee_dob = $request->input('nominee_dob');
        $is_appointee = $request->input('is_appointee');
        $appointee_name = $request->input('appointee_name');
        $appointee_dob = $request->input('appointee_dob');
        $email = $request->input('email');
        $phone = $request->input('phone');
        $is_eia_account = $request->input('is_eia_account');
        $eia_no = $request->input('eia_no');
        $address = $request->input('address');
        $gstn_no = $request->input('gstn_no');
        $date_of_incorporation = $request->input('date_of_incorporation');
        $org_level = $request->input('org_level');
        $appointee_relation_with = $request->input('appointee_relation_with');
        $page_name = $request->input('page_name');
        // $page_name = 'AdditionalDetails_GCV/8';
        $salutation_id = $request->input('salutation_id');
        $nominee_title_id = $request->input('nominee_title_id');
		
		$T_Insurance_Repository_id = $request->input('tpaInsurance');
		$create_eia_account = $request->input('create_eia_account');

        $pincode_count = Pincode::where('id', $pincode_id)->count();
        if($pincode_count > 0)
        {
            $pincode_response = Pincode::with(['pincity','pindistrict','pinstate','statedetails'])
                                ->where('id', $pincode_id)
                                ->first();

            $location =  $pincode_response->LCLTY_SUBRB_TALUK_TEHSL_NM;
            $district =  $pincode_response->pindistrict->DISTRICT_NM;
            $state =  $pincode_response->pinstate->STATE_NM;
            $city =   $pincode_response->pincity->CITY_NM;                
        }
        else
        {
            $error=true;
            $msg='Invalid Pincode id';

        }

        $salutation_id = !empty($salutation_id) ? $salutation_id : 0;
        $nominee_title_id = !empty($nominee_title_id) ? $nominee_title_id : 0;
        $address = trim(preg_replace('/\t+/', '', $address));
        $first_name = trim(preg_replace('/\t+/', '', $first_name));
        $last_name = trim(preg_replace('/\t+/', '', $last_name));
        $nominee_first_name = trim(preg_replace('/\t+/', '', $nominee_first_name));
        $nominee_last_name = trim(preg_replace('/\t+/', '', $nominee_last_name));
        $appointee_name = trim(preg_replace('/\t+/', '', $appointee_name));

        if(!$error)
        {
            $policy_data_count = Policyholder::where('status', 1)->where('id',$policyholder_id)->count();
            if($policy_data_count > 0)
            {
                $policy_data = Policyholder::where('status', 1)->where('id',$policyholder_id)->first();
                $policy_data->first_name = $first_name;
                $policy_data->last_name = $last_name;
                $policy_data->gender = $gender;
                $policy_data->dob = $dob;
                $policy_data->city =$city;
                $policy_data->location =$location;
                $policy_data->district = $district;
                $policy_data->state = $state;
                $policy_data->pancard = $pancard;
                $policy_data->gstn_no = $gstn_no;
                $policy_data->pincode = $pincode;
                $policy_data->pincode_response = json_encode($pincode_response);
                $policy_data->mobile = $phone;
                $policy_data->email_id = $email;
                $policy_data->date_of_incorporation = $date_of_incorporation;
                $policy_data->org_level = $org_level;
                $policy_data->is_eia_account = $is_eia_account;
                $policy_data->eia_no = $eia_no;
                $policy_data->address = $address;
                $policy_data->is_carloan = $is_carloan;
                $policy_data->salutation_id = $salutation_id;
				$policy_data->T_Insurance_Repository_id = $T_Insurance_Repository_id;
				$policy_data->create_eia_account = $create_eia_account;	
                $response  = $policy_data->save();


                if($response)
                {
                    //bank details
                    if(!$is_carloan)
                    {
                        if(!empty($policy_data->bankdetail))
                        {
                            $res = Bankdetail::where('policyholder_id',$policyholder_id)->delete();
                        }
                    }
                    else
                    {
                        $bankDetailsData = Bankdetail::firstOrNew(array('policyholder_id' => $policyholder_id));
                        $bankDetailsData->policyholder_id = $policyholder_id;
                        $bankDetailsData->bank_name = $bank_name;
                        $bankDetailsData->bank_branch = $bank_branch;
                        $bankDetailsData->save();
                    }

                    //Insert Nominee

                    $request_data_id = $policy_data->requestData->id;
                    $nomineeData = Nominee::firstOrNew(array('requestdata_id' => $request_data_id));
                    $nomineeData->title_id = $nominee_title_id;
                    $nomineeData->requestdata_id = $request_data_id;
                    $nomineeData->relation_with = $nominee_relation_with;
                    $nomineeData->first_name = $nominee_first_name;
                    $nomineeData->last_name = $nominee_last_name;
                    $nomineeData->gender = $nominee_gender;
                    $nomineeData->dob = $nominee_dob;
                    $nomineeData->is_appointee = $is_appointee;
                    $nomineeData->appointee_name = $appointee_name;
                    $nomineeData->appointee_relation_with = $appointee_relation_with;
                    $final_response = $nomineeData->save();

                    $requestData = Requestdata::find($request_data_id);
                    $requestData->payment_link_status = 4;
                    $requestData->save();

                    if($final_response){
                        $step_no = 5;
                        $this->updatePolicyHolderStep($policyholder_id,$step_no,$page_name);
                        $data['completedStep'] = $step_no;
                        $msg='Success! Data successfully updated';
                    }
                }
            }
            else
            {
                $error=true;
                $msg='Error! Policy Holder id not exist';
            }

        }
        

        return $this->apiRespone($data,$error,$msg);
    }

    public function updatePolicyHolderStep($policyholder_id,$step_no,$page_name)
    {
        $policyHolder = Policyholder::find($policyholder_id);
        $policyHolder->step_no = $step_no;
        $policyHolder->page_name = $page_name;
        $response  = $policyHolder->save();
        return '1';
    }

    public function sentOTPbackup($policy_holder_id=null)
    {

        $data=array();
        $error=false;
        $msg='OTP sent successfully';

        if($policy_holder_id == null){
            $error=true;
            $msg='policy_holder_id required';
        }

        if(!$error)
        {
            $digits = Config::get('auth.defaults.otp_digit');
            $otp_code = str_pad(rand(0, pow(10, $digits)-1), $digits, '0', STR_PAD_LEFT);

            $already_generated = Otpporcess::where('policyholder_id', $policy_holder_id)->first();
            if(!is_null($already_generated)){
                $already_generated->update([
                    'code' => $otp_code,
                    'status' => 0,
                ]);

                $error=false;
            } else {
                $otp_process = new Otpporcess;
                $otp_process->policyholder_id = $policy_holder_id;
                $otp_process->menumaster_id = 4;
                $otp_process->code = $otp_code;
                $otp_process->status = 0;
                $otp_process->save();
                $error=false;
            }

            $mailFrom = env("MAIL_FROM_ADDRESS");
            date_default_timezone_set('Asia/Kolkata');
            $dateTime = date('d-m-Y H:i:s a');
            $timestamp = date('d-m-Y H:i:s A', (strtotime ( '+1 hour' , strtotime ($dateTime) ) ));

            $email_body = '

            Dear Customer,

                Thank you for choosing SBI General Insurance MOTOR GCV Policy.your Premium for year is
                Rs. XXX &lt;Total Premium&gt;
                The Policy App Code for your SBI General Insurance MOTOR GCV policy is '.$otp_code.'.
                Please provide this to your agent to provide your consent or Click here to review the proposal
                form and Accept using policy App code.
                In case you find any discrepancy in the proposal form, please click on Modify, with remarks.
                *Disclaimer: The Policy App Code is valid till '.$timestamp.';Current Date –
                23:59:59&gt;
                For more information, contact your agent.

            Warm Regards,
            SBI General Insurance';

            Mail::raw($email_body, function($msg) use ($mailFrom){ 
                $msg->subject('SBI General Insurance OTP');
                $msg->to(['arnab.bhattacharya@indusnet.co.in']); 
                $msg->from($mailFrom, 'SBI General Insurance');
            });
            $data['otp_code'] = $otp_code;
        }

        return $this->apiRespone($data,$error,$msg);
    }

    public function fullQuotePCVComp(Request $request)
    {
        $this->validate($request, [
            'id' => 'required',
        ]);

        $policyholder_id = $request->input('id');
        $policy_data = Policyholder::where('status', 1)->where('id', $policyholder_id)->first();

        if(!is_null($policy_data))
        {
            $responseData = $policy_data;
            $responseData->salutation;
            $responseData->breakin;
            $responseData->menumaster;
            $responseData->otpporcess;
            $responseData->motorinsurance;
            $responseData->bcmaster;
            $responseData->bankdetail;
            if(isset($responseData->requestData))
            {
                $responseData->requestData;
                $responseData->requestData->policyNote;
                if(isset($responseData->requestData->nominee))
                {
                   $responseData->requestData->nominee;
                }
            }
            $responseData->vehiclebrandmodel->vehicletype;
            $responseData->vehiclebrandmodel->vehiclebrand;
            $responseData->vehiclebrandmodel->vehiclemodel;
            $responseData->vehiclebrandmodel->varientmodel;
            $responseData->vehiclebrandmodel->varientmodel->bodystyle;
            if(isset($responseData->previouspolicy->insurancecompany))
            {
                $responseData->previouspolicy->insurancecompany;
            }

            if(isset($responseData->motorinsurance))
            {
                $responseData->motorinsurance;
                $responseData->motorinsurance->rtolocation;
            }
        }

        $responseData = $responseData->toArray();

        $apiContoller = new apiController();
        $Authorization_str = $apiContoller->callTokenService();
        $Authorization_arr = json_decode($Authorization_str);
        $Authorization = $Authorization_arr->access_token;
        $policy_for = $policy_data->motorinsurance->policy_for;
        $parts = explode('-', $policy_data->motorinsurance->registration_date);
        $ManufactureYear = $parts[0];

        $gstin = '';
        $gstin_str = '';
        $gSTRegistrationNum = '';
        $hasprepolicy_str = '"HasPrePolicy": "0",';
        $IsOrgParty = ($policy_for == '2' ? 'Y' : 'N');
        $TrailerCount = 0;
        $EmployeeCount = 0;
        $PaidDriverCount = 0;
        $LLCleanerConductor = 0;
        $NFPPCount = 0;
        $PACleanerConductor = 0;
        $AdditionalTowingCharges = 0;
        $trailer = '';
        $Ccc_suminsured = 0;
        $Ccc_count = 0;
        $bodyidv = '';
        $idv = '';
        $ncb_str = '';
        $prev_pol_str = '';
        $IMT23 = 0;
        $PolicyCoverageListOwnDamage = '';
        $PolicyCoverageListLegalLiability = '';
        $PolicyCoverageListPACover = '';
        $PolicyCoverageListEnhancedPACover = '';
        $PolicyCoverageListHospitalCashCover = '';

        $PolicyCoverageListOwnDamageAddOn = '';
        $PolicyCoverageListLegalLiabilityAddOn = '';
        $PolicyCoverageListPACoverAddOn = '';
        $PolicyCoverageListEnhancedPACoverAddOn = '';
        $PolicyCoverageListHospitalCashCoverAddOn = '';

        $nominee_str = '
            "NomineeName": "nominee name",
            "NomineeRelToProposer": "1",
            "NomineeDOB": "1988-04-19",
            "NomineeAge": 50,
            "AppointeeName": "AppointeeName",
            "AppointeeRelToNominee": "2"';

        if(isset($responseData['request_data']['nominee']) && count($responseData['request_data']['nominee']) > 0)
        {

          $nomibday = new DateTime($responseData['request_data']['nominee'][0]['dob']);
          $today = new Datetime(date('Y-m-d'));
          $diff = $today->diff($nomibday);
          $nominee_age= $diff->y;
          $nominee_str = '"NomineeName": "'.$responseData['request_data']['nominee'][0]['first_name'].'",
          "NomineeRelToProposer": "'.$responseData['request_data']['nominee'][0]['relation_with'].'",
          "NomineeDOB": "'.$responseData['request_data']['nominee'][0]['dob'].'",
          "NomineeAge": '.$nominee_age;

          if($responseData['request_data']['nominee'][0]['is_appointee'] == '1'){
            $appointee_str = ',"AppointeeName": "'.$responseData['request_data']['nominee'][0]['appointee_name'].'",
            "AppointeeRelToNominee": "'.$responseData['request_data']['nominee'][0]['appointee_relation_with'].'"';

            $nominee_str.= $appointee_str;
          }
        }

        $add_more_coverage_request_json = $request->input('coverage_data');
        $coverage_array = explode(",",$request->input('add_more_coverage'));
        $coverage_array[] = 'B00008';
        $coverage_array[] = 'B00002';

        $add_more_coverage_request_json = !empty($add_more_coverage_request_json) ? json_decode($add_more_coverage_request_json, true) : [];

        foreach ($coverage_array as &$value) {

          if(trim($value) == 'B00002'){

                if($PolicyCoverageListOwnDamageAddOn!=''){
                  $PolicyCoverageListOwnDamageAddOn.=',';
                }

                $PolicyCoverageListOwnDamageAddOn.='{
                  "ProductElementCode": "B00002"
                }';
          }

          if(trim($value) == 'B00003'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                if($PolicyCoverageListOwnDamageAddOn!=''){
                  $PolicyCoverageListOwnDamageAddOn.=',';
                }

                $PolicyCoverageListOwnDamageAddOn.= '{
                  "SumInsured": '.$data['value'].',
                  "Description": "'.$data['description'].'",
                  "ProductElementCode": "B00003"
                }';
          }

          if(trim($value) == 'B00004'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                if($PolicyCoverageListOwnDamageAddOn!=''){
                  $PolicyCoverageListOwnDamageAddOn.=',';
                }

                $PolicyCoverageListOwnDamageAddOn.= '{
                  "SumInsured": '.$data['value'].',
                  "Description": "'.$data['description'].'",
                  "ProductElementCode": "B00004"
                }';
          }

          if(trim($value) == 'B00005'){ // CNG/LPG Kit - Own Damage

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);

                if($PolicyCoverageListOwnDamageAddOn!=''){
                  $PolicyCoverageListOwnDamageAddOn.=',';
                }

                $PolicyCoverageListOwnDamageAddOn.='{
                  "Description": "Description",
                  "SumInsured": "'.$data['value'].'",
                  "ProductElementCode": "B00005"
                }';
          }

          if(trim($value) == 'B00006'){ // inbuit CNG/LPG Kit - Own Damage

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                if($PolicyCoverageListOwnDamageAddOn!=''){
                  $PolicyCoverageListOwnDamageAddOn.=',';
                }

                $PolicyCoverageListOwnDamageAddOn.='{
                  "SumInsured": 30000,
                  "Description": "Description",
                  "ProductElementCode": "B00006"
                }';
          }

          if(trim($value) == 'B00007'){
                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $TrailerCount = $data['value']; // number of trailer -OD
                $trailers_array = !empty($request->input('trailer_array')) ? $request->input('trailer_array') : [];

                if(!empty($trailers_array)){

                    foreach ($trailers_array as $key => $trailer) {

                        if($PolicyCoverageListOwnDamageAddOn!=''){
                          $PolicyCoverageListOwnDamageAddOn.=',';
                        }

                        $chassisNo = !empty($trailer->chassisNo) ? $trailer->chassisNo : '';
                        $regNo = !empty($trailer->regNo) ? $trailer->regNo : '';

                        $PolicyCoverageListOwnDamageAddOn.='{
                          "SumInsured": '.$data['description'].',
                          "ChassisNo": "'.$chassisNo.'",
                          "RegistrationNo": "'.$regNo.'",
                          "ProductElementCode": "B00007"
                        }';
                    }

                    if($PolicyCoverageListLegalLiabilityAddOn!=''){
                       $PolicyCoverageListLegalLiabilityAddOn.=',';
                    }

                    $PolicyCoverageListLegalLiabilityAddOn.='{
                      "ProductElementCode": "B00011",
                      "RegistrationNo": "'.$responseData['motorinsurance']['registration_no'].'"
                    }';

                    $trailer = '"TrailerCount": '.$TrailerCount.',
                              "TrailerType": "2",';
                }
          }

          if(trim($value) == 'B00008'){

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 9999999,
                  "ProductElementCode": "B00008"
                }';
          }

          if(trim($value) == 'B00009'){

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

            $PolicyCoverageListLegalLiabilityAddOn.='{
              "SumInsured": 750000,
              "ProductElementCode": "B00009"
            }';
            
          }

          if(trim($value) == 'B00010'){ // CNG/LPG Kit - Liability
                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 9999999,
                  "ProductElementCode": "B00010",
                  "Description": "Description"
                }';
          }

          if(trim($value) == 'B00012'){

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $EmployeeCount = $data['value'];

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "ProductElementCode": "B00012"
                }';
          }

          if(trim($value) == 'B00013'){
                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $PaidDriverCount = $data['value'];
                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                "ProductElementCode": "B00013"
                }';
          }

          if(trim($value) == 'B00069'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $LLCleanerConductor = $data['value']; // number of

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 9999999,
                  "ProductElementCode": "B00069"
                }';
          }

          if(trim($value) == 'B00071'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                // $NFPPCount = $data['value'];
                $NFPPCount = 1;

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 9999999,
                  "ProductElementCode": "B00071"
                }';
          }

          /*PA COVER START*/

          if($policy_for != 2){ // 2 = Corporate
                if(trim($value) == 'B00015'){

                  if(!empty($PolicyCoverageListPACoverAddOn)){
                    $PolicyCoverageListPACoverAddOn.= ',';
                  }

                  $PolicyCoverageListPACoverAddOn.='{
                    "SumInsured": 1500000,
                    "ProductElementCode": "B00015",
                    '.$nominee_str.'
                  }';
                }
          }

          if(trim($value) == 'B00073'){
                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $Ccc_count = $data['description'];
                $Ccc_suminsured = $data['value'];
          }

          /*PA COVER END*/

          if($policy_for != 2){ // 2 = Corporate
                if(trim($value) == 'B00018'){

                  $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                  if($PolicyCoverageListEnhancedPACoverAddOn!=''){
                    $PolicyCoverageListEnhancedPACoverAddOn.=',';
                  }

                  $PolicyCoverageListEnhancedPACoverAddOn.='{
                    "SumInsured": '.$data['value'].',
                    "ProductElementCode": "B00018"
                  }';
                }
          }

          if(trim($value) == 'B00019'){
                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                if($PolicyCoverageListEnhancedPACoverAddOn!=''){
                  $PolicyCoverageListEnhancedPACoverAddOn.=',';
                }
                $PolicyCoverageListEnhancedPACoverAddOn.='{
                  "SumInsuredPerUnit": '.$data['value'].',
                  "TotalSumInsured": 500000,
                  "ProductElementCode": "B00019"
                }';
          }

          if(trim($value) == 'B00020'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                if($PolicyCoverageListHospitalCashCoverAddOn!=''){
                  $PolicyCoverageListHospitalCashCoverAddOn.= ',';
                }

                 $PolicyCoverageListHospitalCashCoverAddOn.='{
                    "SumInsuredPerUnit": '.$data['value'].',
                    "SumInsured": 5000,
                    "ProductElementCode": "B00020"
                  }';
          }
          if(trim($value) == 'IMT23'){
            $IMT23 = 1;
          }

          if(trim($value) == 'B00022'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);

                if($PolicyCoverageListHospitalCashCoverAddOn!=''){
                  $PolicyCoverageListHospitalCashCoverAddOn.= ',';
                }

                $PolicyCoverageListHospitalCashCoverAddOn.='{
                  "SumInsuredPerUnit": '.$data['value'].',
                  "TotalSumInsured": 30000,
                  "ProductElementCode": "B00022"
                }';
          }

        } // Loop end

        if(!empty($Ccc_count)){

            $PACleanerConductor = ($Ccc_count + $PaidDriverCount); // total number of PA coolie and LLPD
            $total_suminsured_ccc = intval($Ccc_suminsured) * $PACleanerConductor;

            if(!empty($PolicyCoverageListPACoverAddOn)){
              $PolicyCoverageListPACoverAddOn.= ',';
            }

            $PolicyCoverageListPACoverAddOn.='{
              "SumInsuredPerUnit": "'.$Ccc_suminsured.'",
              "TotalSumInsured": '.$total_suminsured_ccc.',
              "ProductElementCode": "B00073"
            }';
        }

        $start_date = date('Y-m-d');
        //$start_date=date('Y-m-d',(strtotime('+1 day',strtotime($start_date))));
        $start_time = date("H:i:s");
        $next_year_date = date('Y-m-d',(strtotime ( '+1 year' , strtotime ( $start_date) ) ));
        $expiry_date = date('Y-m-d',(strtotime ( '-1 day' , strtotime ( $next_year_date) ) ));
        $pincode_arr = json_decode($policy_data->pincode_response);
        

        if($policy_for == '1')
        {
            if(!is_null($responseData['salutation']))
            {
                $title = $responseData['salutation']['salutation_id'];
            }
            else 
            {
              $title = '9000000001';
            }
        }
        else
        {
            $title = '9000000003';
        }

        if(!empty($responseData['eia_no'])){
            $eia_no = $responseData['eia_no'];
        }
        else{
            $eia_no = 'EIANumber';
        }

        if($policy_for == '2')
        {
          $gstin = $responseData['gstn_no'];
          $date_of_interpolation = $responseData['date_of_incorporation'];
          $gSTRegistrationNum = $responseData['gstn_no'];
        }

        if(isset($responseData['previouspolicy']) && count($responseData['previouspolicy']) > 0 && $responseData['previouspolicy']['is_claim'] !=1){

          if($responseData['previouspolicy']['claim_bonus'] !='1'){

            switch ($responseData['previouspolicy']['claim_bonus'])
            {
              case "0":
                $ncb = 20;
                break;
              case "20":
                $ncb = 25;
                break;
              case "25":
                $ncb = 35;
                break;
              case "35":
                $ncb = 45;
                break;
              case "45":
                $ncb = 50;
                break;
              case "50":
                $ncb = 50;
                break;
            }

            $ncb_str = '"IsNCB": 1,
            "NCB": "'.round(($ncb/100), 2).'",
            "NCBPrePolicy": "1",
            "NCBLetterDate": "2017-09-09T00:00:00.000",
            "NCBProof": "2",';
          }

          if(!is_null($responseData['previouspolicy']['name'])){
            $kindofPolicy = $responseData['previouspolicy']['name'] == 3 ? 1 : $responseData['previouspolicy']['name'];
          }

          $hasprepolicy_str = '"HasPrePolicy": "1",';
          $prev_pol_str = '"KindofPolicy": "'.$kindofPolicy.'",
          "PreInsuranceComAddr": "'.$responseData['previouspolicy']['city'].'",
          "PreInsuranceComName": "'.$responseData['previouspolicy']['insurancecompany_id'].'",
          "PrePolicyEndDate": "'.$responseData['previouspolicy']['end_date'].'T23:59:59",
          "PrePolicyNo": "'.$responseData['previouspolicy']['policy_no'].'",
          "PrePolicyStartDate": "'.$responseData['previouspolicy']['start_date'].'T00:00:00",';

          
          if(date('Y-m-d') <= date('Y-m-d',(strtotime ($responseData['previouspolicy']['end_date']) ))){
            $start_date = date('Y-m-d',(strtotime ( '+1 day' , strtotime ($responseData['previouspolicy']['end_date']))));
            $next_year_date = date('Y-m-d',(strtotime ( '+1 year' , strtotime ( $start_date) ) ));
            $expiry_date = date('Y-m-d',(strtotime ( '-1 day' , strtotime ( $next_year_date) ) ));
            $start_time = '00:00:00';
          }else{
            $start_date = date('Y-m-d');
            $start_time = date("H:i:s");
            if($responseData['vehiclebrandmodel']['vehicletype']['id'] == '1'){
                $start_date = date('Y-m-d',(strtotime ( '+1 day' , strtotime ($start_date))));
            }
            $next_year_date = date('Y-m-d',(strtotime ( '+1 year' , strtotime ( $start_date) ) ));
            $expiry_date = date('Y-m-d',(strtotime ( '-1 day' , strtotime ($next_year_date))));
          }

        }

        $policy_start_date = $start_date.'T'.$start_time;

        $customer_details_str = '';
        $nightParkloc = '';

        if(!empty($responseData['pincode'])){
            $nightParkloc = '"NightParkLoc": "1",
            "NightParkLocPinCode": "'.$responseData['pincode'].'",
            "DayParkLoc": "1",
            "DayParkLocPinCode": "'.$responseData['pincode'].'",';
        }

        if($policy_for == '2'){
          $IsOrgParty = 'Y';
        } else {
          $IsOrgParty = 'N';
        }

        $pincode_arr = json_decode($responseData['pincode_response']);
        $address = json_decode($responseData['address'], true);

        $customer_details_str = '
          "ContactEmail": "'.$responseData['email_id'].'",
          "Email" : "'.$responseData['email_id'].'",
          "Title": "'.$title.'",
          "CustomerName": "'.$responseData['first_name'].'",
          "RegistrationName": "'.$responseData['first_name'].'",
          "Mobile": "'.$responseData['mobile'].'",
          "PlotNo": "'.$responseData['address'].'",
          "BuildingHouseName": "'.(!empty($address['address2']) ? $address['address2'] : '').'",
          "StreetName": "'.$responseData['location'].'",
          "PostCode": "'.(!empty($responseData['pincode']) ? $responseData['pincode'] : '700001').'",
          "City": "'.(!empty($pincode_arr->CITY_CD) ? $pincode_arr->CITY_CD : '').'",
          "District": "'.(!empty($pincode_arr->DISTRICT_CD) ? $pincode_arr->DISTRICT_CD : '').'",
          "State": "'.(!empty($pincode_arr->statedetails->State_Code) ? $pincode_arr->statedetails->State_Code : '').'",
          "CountryCode": "'.(!empty($pincode_arr->statedetails->Country_Code) ? $pincode_arr->statedetails->Country_Code : '').'",
          "Locality": "'.(!empty($pincode_arr->LCLTY_SUBRB_TALUK_TEHSL_NM) ? $pincode_arr->LCLTY_SUBRB_TALUK_TEHSL_NM : '').'", 
          "EIANumber": "'.$eia_no.'",
          "PAN": "'.$responseData['pancard'].'",';

        if($policy_for == '1'){
            $customer_details_str.= '
            "GenderCode": "'.strtoupper($policy_data->gender).'",
            "DateOfBirth": "'.$policy_data->dob.'",
            "IdNo": "'.$policy_data->pancard.'",
            "IdType": "1",';
        }

        if($policy_for == '2'){
            $gstin = '"CustomerGSTINNo": "'.$policy_data->gstn_no.'",';
            $gstin_str = '
            "DateOfIncorporation": "'.$policy_data->date_of_incorporation.'",
            "GSTRegistrationNum": "'.$policy_data->gstn_no.'",
            "GSTInputState": "",';
        }

        if(empty($responseData['first_name']) && empty($responseData['pincode']))
        {
            $customer_details_str = '
                "CustomerName": "FirstName LastName",
                "Title": "'.$title.'",
                "PostCode": "712222",
                "State" : "MH",
                "GenderCode" : "M",';
        }

        $quote_valid_to = date('Y-m-d',(strtotime ( '+1 month' , strtotime ($start_date))));

        $hypothecation_name = count($responseData['bankdetail']) > 0 ? $responseData['bankdetail'][0]['bank_name'] : 'FNName';
        $hypothecation_branch = count($responseData['bankdetail']) > 0 ? $responseData['bankdetail'][0]['bank_branch'] : 'FNBranchName';

        $driverGenderCode = $responseData['gender'] == 'm' ? 1 : 2;
        $person_list_str = '';

        if($policy_for == '1'){
          if(empty($responseData['first_name']) && empty($responseData['dob']))
          {
            $person_list_str = '"PersonList": [
              {
                "DriverName": "abcd efgh",
                "DateOfBirth": "1988-04-19",
                "RelationshipwithProposer": "1",
                "DriverExperience": "1",
                "DriverGender": "'.$driverGenderCode.'",
                "DrivingLicenseNo": ""
              }
            ],';
          }
          else{
            $responseData['first_name'] = $responseData['first_name'] ? $responseData['first_name']:"firstName lastName";
			$responseData['dob'] = $responseData['dob'] ? $responseData['dob'] :"1988-04-19";
          $person_list_str = '"PersonList": [
            {
              "DriverName": "'.$responseData['first_name'].'",
              "DateOfBirth": "'.$responseData['dob'].'",
              "RelationshipwithProposer": "1",
              "DriverExperience": "1",
              "DriverGender": "'.$driverGenderCode.'",
              "DrivingLicenseNo": ""
            }
          ],';
        }
        }

        if($PolicyCoverageListOwnDamageAddOn!=''){
          $PolicyCoverageListOwnDamage = '{
            "ProductElementCode": "C101064",
            "EffectiveDate": "'.$start_date.'",
            "PolicyBenefitList": [
              '.$PolicyCoverageListOwnDamageAddOn.'
            ],
            "ExpiryDate": "'.$expiry_date.'T23:59:59"
          }';
        }

        $FinalPolicyCoverageList = $PolicyCoverageListOwnDamage;

        if($PolicyCoverageListLegalLiabilityAddOn!=''){
          $PolicyCoverageListLegalLiability .= '{
            "EffectiveDate": "'.$start_date.'",
            "PolicyBenefitList": [
              '.$PolicyCoverageListLegalLiabilityAddOn.'
            ],
            "ExpiryDate": "'.$expiry_date.'T23:59:59",
            "ProductElementCode": "C101065"
          }';
        }

        $FinalPolicyCoverageList.= $FinalPolicyCoverageList!='' && $PolicyCoverageListLegalLiability!='' ? ','.$PolicyCoverageListLegalLiability : $PolicyCoverageListLegalLiability;

        if($PolicyCoverageListPACoverAddOn!=''){
          $PolicyCoverageListPACover.='{
            "EffectiveDate": "'.$start_date.'",
            "PolicyBenefitList": [
              '.$PolicyCoverageListPACoverAddOn.'
            ],
            "ExpiryDate": "'.$expiry_date.'T23:59:59",
            "ProductElementCode": "C101066"
          }';
        }

        $FinalPolicyCoverageList.= $FinalPolicyCoverageList!='' && $PolicyCoverageListPACover!='' ? ','.$PolicyCoverageListPACover : $PolicyCoverageListPACover;

        if($PolicyCoverageListEnhancedPACoverAddOn!=''){
          $PolicyCoverageListEnhancedPACover.='{
            "PolicyBenefitList": [
              '.$PolicyCoverageListEnhancedPACoverAddOn.'
            ],
            "ProductElementCode": "C101070",
            "EffectiveDate": "'.$start_date.'",
            "ExpiryDate": "'.$expiry_date.'T23:59:59"
          }';
        }

        $FinalPolicyCoverageList.= $FinalPolicyCoverageList!='' && $PolicyCoverageListEnhancedPACover!='' ? ','.$PolicyCoverageListEnhancedPACover : $PolicyCoverageListEnhancedPACover;

        if(!empty($PolicyCoverageListHospitalCashCoverAddOn)){
          $PolicyCoverageListHospitalCashCover = '{
              "PolicyBenefitList": [
                '.$PolicyCoverageListHospitalCashCoverAddOn.'
              ],
              "ProductElementCode": "C101071",
              "EffectiveDate": "'.$start_date.'",
              "ExpiryDate": "'.$expiry_date.'T23:59:59"
            }';
        }

        $FinalPolicyCoverageList.= $FinalPolicyCoverageList!='' && $PolicyCoverageListHospitalCashCover!='' ? ','.$PolicyCoverageListHospitalCashCover : $PolicyCoverageListHospitalCashCover;

        if($responseData['bcmaster_id'] == 0 && empty($responseData['bcmaster']['id']))
        {
            $details = $this->intermediaryOrgDetails($responseData);

            $responseData['bcmaster'] = [
                'agreement_code' => !empty($details['agreement_code']) ? $details['agreement_code'] : '',
                'imd_code' => !empty($details['imd_code']) ? $details['imd_code'] : ''
            ];
        }

        $registration_part_numbers = json_decode($responseData['motorinsurance']['registration_part_numbers'], true);

        $data = '{
            "RequestHeader": {
              "requestID": "'.random_int(100000, 999999).'",
              "action": "fullQuote",
              "channel": "SBIG",
              "transactionTimestamp": "'.date("d-M-Y-h:i:s").'"
            },
            "RequestBody":{
              "AgreementCode": "'.$responseData['bcmaster']['agreement_code'].'",
              "SourceType": "18",
              "AlternatePolicyNo": "",
              "BusinessType": "'.$responseData['motorinsurance']['policytype_id'].'",
              '.$gstin.'
              "EffectiveDate": "'.$policy_start_date.'",
              "ExpiryDate": "'.$expiry_date.'T23:59:59",
              '.$prev_pol_str.'
              "NewBizClassification": "'.$responseData['motorinsurance']['policytype_id'].'",
              "PolicyCustomerList": [
                {
                  '.$customer_details_str.'
                  '.$gstin_str.'
                  "EducationCode": "2300000003",
                  "GroupCompanyName": "SBIG",
                  "IsOrgParty": "'.$IsOrgParty.'",
                  "IsPolicyHolder": "Y",
                  "NationalityCode": "IND"
                }
              ],
              "PolicyLobList": [
                {
                  "PolicyRiskList": [
                    {
                      "PCVVehicleSubClass": "'.$responseData['motorinsurance']['subclass_id'].'",
                      "ProposedUsage": "'.$responseData['vehiclebrandmodel']['proposed_used_id'].'",
                      "MonthlyUseDistance": "'.$responseData['motorinsurance']['averagemonthlyusage_id'].'",
                      '.$nightParkloc.'
                      "Last3YrDriverClaimPresent": "0",
                      "NoOfDriverClaims": "",
                      "DriverClaimAmt": "",
                      "ClaimStatus": "",
                      "ClaimType": "1",
                      "IMT23": "'.$IMT23.'",
                      "CountCCC": '.$Ccc_count.',
                      "ManufactureYear": "'.$ManufactureYear.'",
                      "AdditionalTowingCharges": "'.$AdditionalTowingCharges.'",
                      "BodyType": "'.$responseData['vehiclebrandmodel']['varientmodel']['bodystyle']['DESCRIPTION'].'",
                      "ChassisNo": "'.$responseData['motorinsurance']['chasis_no'].'",
                      "NFPPCount": '.$NFPPCount.',
                      "EmployeeCount": '.$EmployeeCount.',
                      "EngineNo": "'.$responseData['motorinsurance']['engine_no'].'",
                      "IDV_User": "'.$request->input('idv_value').'",
                      '.$ncb_str.'
                      "FNBranchName": "'.$hypothecation_branch.'",
                      "FNName": "'.$hypothecation_name.'",
                      "PaidDriverCount": '.$PaidDriverCount.',
                      "ProductElementCode": "R10005",
                      "RTOCityDistric": "'.$responseData['motorinsurance']['rtolocation']['RTO_DIS_CODE'].'",
                      "RTOCluster": "'.$responseData['motorinsurance']['rtolocation']['RTO_Cluster'].'",
                      "RTOLocation": "'.$responseData['motorinsurance']['rtolocation']['RTO_LOCATION'].'",
                      "RegistrationDate": "'.$responseData['motorinsurance']['registration_date'].'T00:00:00.000",
                      "RegistrationNo": "'.$responseData['motorinsurance']['registration_no'].'",
                      "RegistrationNoBlk1": "'.$registration_part_numbers['reg_number_part_one'].'",
                      "RegistrationNoBlk2": "'.$registration_part_numbers['reg_number_part_two'].'",
                      "RegistrationNoBlk3": "'.$registration_part_numbers['reg_number_part_three'].'",
                      "RegistrationNoBlk4": "'.$registration_part_numbers['reg_number_part_four'].'",
                      '.$trailer.'
                      "Variant": "'.$responseData['vehiclebrandmodel']['varientmodel']['varient_id'].'",
                      "VehicleMake": "'.$responseData['vehiclebrandmodel']['vehiclebrand']['two_mk_id'].'",
                      "VehicleModel": "'.$responseData['vehiclebrandmodel']['vehiclemodel']['mk_model_id'].'",
                      "PolicyCoverageList": [
                        '.$FinalPolicyCoverageList.'
                      ]
                    }
                  ],
                  '.$person_list_str.'
                  "ProductCode": "CMVPC01",
                  "PolicyType": "1"
                }
              ],
              '.$hasprepolicy_str.'
              "PremiumCurrencyCode": "INR",
              "PremiumLocalExchangeRate": 1,
              "ProductCode": "CMVPC01",
              "ProductVersion": "1.0",
              "ProposalDate": "'.$start_date.'",
              "QuoteValidTo": "'.$quote_valid_to.'",
              "SBIGBranchStateCode": "MH"
            }
        }';

        $url = $apiContoller->getWsUrl('fullQuote');
        $apiRequest = array();
        $apiRequest['policyholder_id'] = $policyholder_id;
        $apiRequest['api_name'] = 'fullQuotePCV';
        $apiRequest['api_url'] = $url;
        $apiRequest['api_request'] = $data;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        //curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:application/json","Authorization:Bearer $Authorization","X-IBM-Client-Id:f6bb3f6d-cc75-4281-8fc0-72bef08bdf5a","X-IBM-Client-Secret:qC1gL7xL5iS8gD3tT1yU8hD4lN5dC2mQ2aX5kC5yA6gY6jW8mT"));
		curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:application/json","Authorization:Bearer $Authorization","X-IBM-Client-Id:".CLIENT_ID."","X-IBM-Client-Secret:".CLIENT_SECRET.""));

        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        $result = curl_exec($ch);
        $apiRequest['api_response'] = $result;
        $output = $apiContoller->insertIntoApilog($apiRequest);

        $FullQuoteResponse = json_decode($result, TRUE);
        $this->savePCVQuote($policyholder_id, $FullQuoteResponse);
        return $FullQuoteResponse;
    }

    private function savePCVQuote($policyholder_id, $FullQuoteResponse)
    {
        $responseData = json_decode(json_encode($FullQuoteResponse), FALSE);
        $policy_data = Policyholder::where('status', 1)->where('id', $policyholder_id)->first();

        if(!is_null($policy_data))
        {
            if(!empty($responseData->PolicyObject))
            {
              if(isset($responseData->PolicyObject->SumInsured))
              {
                  $policyObject = $responseData->PolicyObject;
                  $quotationNo = $responseData->PolicyObject->QuotationNo;
                  $sumInsured =  $responseData->PolicyObject->SumInsured;
                  $grossPremium =  $responseData->PolicyObject->BeforeVatPremium;
                  $cgst =  $responseData->PolicyObject->CGST;
                  $sgst =  $responseData->PolicyObject->SGST;
                  $tgst = !empty($responseData->PolicyObject->TGST) ? $responseData->PolicyObject->TGST : 0;
                  $net_premium = $responseData->PolicyObject->DuePremium;
                  $swatch_bharat_cess = 0;
                  $krishi_kalayan_cess = 0;
                  $own_damage = 0;
                  $csc_share_amount = 0;
                  $liability_to_third_party = 0;
                  $od_comission = 0;
                  $tp_comission = 0;
                  $vehicle_age = 0;
                  $RegistrationDate = !empty($policyObject->PolicyLobList[0]->PolicyRiskList[0]->RegistrationDate) ? $policyObject->PolicyLobList[0]->PolicyRiskList[0]->RegistrationDate : date('Y-m-d');
                  $EffectiveDate = !empty($policyObject->EffectiveDate) ? $policyObject->EffectiveDate : date('Y-m-d');

                  $IDV_Suggested = !empty($policyObject->PolicyLobList[0]->PolicyRiskList[0]->IDV_User) ? round($policyObject->PolicyLobList[0]->PolicyRiskList[0]->IDV_User, 2) : 0.00;
                  $VehicleBodyPrice = !empty($policyObject->PolicyLobList[0]->PolicyRiskList[0]->VehicleBodyPrice) ? round($policyObject->PolicyLobList[0]->PolicyRiskList[0]->VehicleBodyPrice, 2) : 0.00;

                  $vehicletype_id = $policy_data->vehiclebrandmodel->vehicletype_id;

                  if(!empty($policyObject->PolicyLobList[0]->PolicyRiskList[0]->PolicyCoverageList))
                  {
                      $coverageList = $policyObject->PolicyLobList[0]->PolicyRiskList[0]->PolicyCoverageList;
                      foreach ($coverageList as $key => $value) {
                        if($value->ProductElementCode=='C101064')
                        {
                            $own_damage = $value->BeforeVatPremium;
                        }
                        if($value->ProductElementCode=='C101065')
                        {
                            $liability_to_third_party = $value->BeforeVatPremium;

                        }
                        if($value->ProductElementCode=='C101066')
                        {
                            $liability_to_third_party = $liability_to_third_party + $value->BeforeVatPremium;
                        }
                      }

                      if(!empty($RegistrationDate) && !empty($EffectiveDate))
                      {
                        $diff = date_diff(date_create($RegistrationDate), date_create($EffectiveDate));
                        $vehicle_age = $diff->days;
                      }

                      //$vehicletype_id=1 is comprehensive

                      if($vehicletype_id==1)
                      {
                        if($vehicle_age<=1096) // 1096 Days
                        {
                          $share_amount = ($own_damage * 15)/100;
                          $od_comission = $share_amount;
                          $csc_share_amount = number_format((float)$share_amount, 2, '.', '');
                        }

                        if($vehicle_age >1096) // 1096 Days
                        {
                          $od_comission = ($own_damage * 15)/100;
                          $tp_comission= ($liability_to_third_party * 2.5)/100;

                          $share_amount = (($own_damage * 15)/100)+(($liability_to_third_party * 2.5)/100);
                          $csc_share_amount = number_format((float)$share_amount, 2, '.', '');
                        }
                      }

                      //$vehicletype_id=27 is TP

                      if($vehicletype_id==27)
                      {
                        $vehicle_age = $policy_data->motorinsurance->vehicle_age;
                        $share_amount = ($liability_to_third_party * 2.5)/100;
                        $tp_comission = $share_amount;
                        $csc_share_amount = number_format((float)$share_amount, 2, '.', '');
                      }
                  }

                  $apiContoller = new apiController();
                  $additional_cost_array = $apiContoller->additionalCommission($policyObject, $policyholder_id);
                  $additional_cost = $additional_cost_array['final_addition_commission'];
                  $printing_charges = $additional_cost_array['printing_charges'];
                  $psc_amount = $additional_cost_array['psc_amount'];
                  $csc_share_amount = ($csc_share_amount+$additional_cost);
                  $csc_share_amount = number_format((float)$csc_share_amount, 2, '.', '');

                  $commission_array = [
                    'OD' => $own_damage,
                    'TP' => $liability_to_third_party,
                    'NetPV' => $grossPremium,
                    'TotalPV' => $net_premium,
                    'ODRate' => '15%',
                    'TPRate' => '2.5%',
                    'ODCom' => $od_comission,
                    'TPCom' => $tp_comission,
                    'PSCRate' => '4.5%',
                    'PSCAmt' => $psc_amount,
                    'CSCShare' => $csc_share_amount,
                    'PrintCharge' => $printing_charges,
                  ];
                
                  //$vehicletype_id=27 is TP
                  if($vehicletype_id==27)
                  {
                    $commission_array = [
                      'OD' => $own_damage,
                      'TP' => $liability_to_third_party,
                      'NetPV' => $grossPremium,
                      'TotalPV' => $net_premium,
                      'ODRate' => '',
                      'TPRate' => '2.5%',
                      'ODCom' => $od_comission,
                      'TPCom' => $tp_comission,
                      'PSCRate' => '4.5%',
                      'PSCAmt' => $psc_amount,
                      'CSCShare' => $csc_share_amount,
                      'PrintCharge' => $printing_charges,
                    ];
                  }

	              $commission_json = json_encode($commission_array);

                  $request_data_id = $policy_data->requestData->id;
                  $requestData = Requestdata::find($request_data_id);
                  $requestData->quote_id = $quotationNo;
                  $requestData->sum_insured = $sumInsured;
                  $requestData->start_date = $responseData->PolicyObject->EffectiveDate;
                  $requestData->end_date = $responseData->PolicyObject->ExpiryDate;
                  $requestData->IDV_Suggested = $IDV_Suggested;
                  $requestData->VehicleBodyPrice = $VehicleBodyPrice;
                  $requestData->gross_premium = $grossPremium;
                  $requestData->service_tax = $tgst;
                  $requestData->swatch_bharat_cess = $swatch_bharat_cess;
                  $requestData->krishi_kalayan_cess = $krishi_kalayan_cess;
                  $requestData->net_premium = $net_premium;
                  $requestData->own_damage = $own_damage;
                  $requestData->od_comission = $od_comission;
                  $requestData->tp_comission = $tp_comission;
                  $requestData->commission_json = $commission_json;
                  $requestData->liability_third_party = $liability_to_third_party;
				  $requestData->psc_amount = $psc_amount;
				  $requestData->printing_charges = $printing_charges;
                  $requestData->csc_share_amount = $csc_share_amount;
                  $requestData->quote_response = json_encode($responseData);
                  $response  = $requestData->save();
                  if($response)
                  {
                      $policyNote = Policynote::firstOrNew(array('requestdata_id' => $request_data_id));
                      $policyNote->requestdata_id = $request_data_id;
                      $policyNote->policy_no = $quotationNo;
                      $policyNote->policy_no_type = 1;
                      $policyNote->status = 0;
                      $finalResponse = $policyNote->save();
                  }
              }
            }
            else
            {
                return false;
            }
        }
    }

    public function fullQuotePCVTp(Request $request)
    {
        $this->validate($request, [
            'id' => 'required',
        ]);

        $policyholder_id = $request->input('id');
        $policy_data = Policyholder::where('status', 1)->where('id', $policyholder_id)->first();

        if(!is_null($policy_data))
        {
            $responseData = $policy_data;
            $responseData->salutation;
            $responseData->breakin;
            $responseData->menumaster;
            $responseData->otpporcess;
            $responseData->motorinsurance;
            $responseData->bcmaster;
            $responseData->bankdetail;
            if(isset($responseData->requestData))
            {
                $responseData->requestData;
                $responseData->requestData->policyNote;
                if(isset($responseData->requestData->nominee))
                {
                   $responseData->requestData->nominee;
                }
            }
            $responseData->vehiclebrandmodel->vehicletype;
            $responseData->vehiclebrandmodel->vehiclebrand;
            $responseData->vehiclebrandmodel->vehiclemodel;
            $responseData->vehiclebrandmodel->varientmodel;
            $responseData->vehiclebrandmodel->varientmodel->bodystyle;
            if(isset($responseData->previouspolicy->insurancecompany))
            {
                $responseData->previouspolicy->insurancecompany;
            }

            if(isset($responseData->motorinsurance))
            {
                $responseData->motorinsurance;
                $responseData->motorinsurance->rtolocation;
            }
        }

        $responseData = $responseData->toArray();

        $apiContoller = new apiController();
        $Authorization_str = $apiContoller->callTokenService();
        $Authorization_arr = json_decode($Authorization_str);
        $Authorization = $Authorization_arr->access_token;
        $policy_for = $policy_data->motorinsurance->policy_for;
        $parts = explode('-', $policy_data->motorinsurance->registration_date);
        $ManufactureYear = $parts[0];

        $gstin = '';
        $gstin_str = '';
        $gSTRegistrationNum = '';
        $hasprepolicy_str = '"HasPrePolicy": "0",';
        $IsOrgParty = ($policy_for == '2' ? 'Y' : 'N');
        $TrailerCount = 0;
        $EmployeeCount = 0;
        $PaidDriverCount = 0;
        $LLCleanerConductor = 0;
        $NFPPCount = 0;
        $PACleanerConductor = 0;
        $AdditionalTowingCharges = 0;
        $trailer = '';
        $Ccc_suminsured = 0;
        $Ccc_count = 0;
        $bodyidv = '';
        $idv = '';
        $ncb_str = '';
        $prev_pol_str = '';

        $PolicyCoverageListOwnDamage = '';
        $PolicyCoverageListLegalLiability = '';
        $PolicyCoverageListPACover = '';
        $PolicyCoverageListEnhancedPACover = '';
        $PolicyCoverageListHospitalCashCover = '';

        $PolicyCoverageListOwnDamageAddOn = '';
        $PolicyCoverageListLegalLiabilityAddOn = '';
        $PolicyCoverageListPACoverAddOn = '';
        $PolicyCoverageListEnhancedPACoverAddOn = '';
        $PolicyCoverageListHospitalCashCoverAddOn = '';

        $nominee_str = '
            "NomineeName": "nominee name",
            "NomineeRelToProposer": "1",
            "NomineeDOB": "1988-04-19",
            "NomineeAge": 50,
            "AppointeeName": "AppointeeName",
            "AppointeeRelToNominee": "2"';

        if(isset($responseData['request_data']['nominee']) && count($responseData['request_data']['nominee']) > 0)
        {

          $nomibday = new DateTime($responseData['request_data']['nominee'][0]['dob']);
          $today = new Datetime(date('Y-m-d'));
          $diff = $today->diff($nomibday);
          $nominee_age= $diff->y;
          $nominee_str = '"NomineeName": "'.$responseData['request_data']['nominee'][0]['first_name'].'",
          "NomineeRelToProposer": "'.$responseData['request_data']['nominee'][0]['relation_with'].'",
          "NomineeDOB": "'.$responseData['request_data']['nominee'][0]['dob'].'",
          "NomineeAge": '.$nominee_age;

          if($responseData['request_data']['nominee'][0]['is_appointee'] == '1'){
            $appointee_str = ',"AppointeeName": "'.$responseData['request_data']['nominee'][0]['appointee_name'].'",
            "AppointeeRelToNominee": "'.$responseData['request_data']['nominee'][0]['appointee_relation_with'].'"';

            $nominee_str.= $appointee_str;
          }
        }

        $add_more_coverage_request_json = $request->input('coverage_data');
        $coverage_array = explode(",",$request->input('add_more_coverage'));
        $coverage_array[] = 'B00008';

        $add_more_coverage_request_json = !empty($add_more_coverage_request_json) ? json_decode($add_more_coverage_request_json, true) : [];

        foreach ($coverage_array as &$value) {

          if(trim($value) == 'B00008'){

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 9999999,
                  "ProductElementCode": "B00008"
                }';
          }

          if(trim($value) == 'B00009'){

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 750000,
                  "ProductElementCode": "B00009"
                }';
          }

          if(trim($value) == 'B00010'){ // CNG/LPG Kit - Liability
                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 9999999,
                  "ProductElementCode": "B00010",
                  "Description": "Description"
                }';
          }

          if(trim($value) == 'B00011'){
                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $TrailerCount = $data['value']; // number of trailer-TP
                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "ProductElementCode": "B00011",
                  "SumInsured": 2341,
                  "RegistrationNo": "'.$responseData['motorinsurance']['registration_no'].'"
                }';

                $trailer = '"TrailerCount": '.$TrailerCount.',
                            "TrailerType": "2",';
          }

          if(trim($value) == 'B00012'){

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $EmployeeCount = $data['value'];

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "ProductElementCode": "B00012"
                }';
          }

          if(trim($value) == 'B00013'){
                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $PaidDriverCount = $data['value'];
                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                    "ProductElementCode": "B00013"
                }';
          }

          if(trim($value) == 'B00069'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $LLCleanerConductor = $data['value']; // number of

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 9999999,
                  "ProductElementCode": "B00069"
                }';
          }

          if(trim($value) == 'B00071'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                // $NFPPCount = $data['value'];
                $NFPPCount = 1;

                if($PolicyCoverageListLegalLiabilityAddOn!=''){
                  $PolicyCoverageListLegalLiabilityAddOn.=',';
                }

                $PolicyCoverageListLegalLiabilityAddOn.='{
                  "SumInsured": 9999999,
                  "ProductElementCode": "B00071"
                }';
          }

          /*PA COVER START*/

          if($policy_for != 2){ // 2 = Corporate
                if(trim($value) == 'B00015'){

                  if(!empty($PolicyCoverageListPACoverAddOn)){
                    $PolicyCoverageListPACoverAddOn.= ',';
                  }

                  $PolicyCoverageListPACoverAddOn.='{
                    "SumInsured": 1500000,
                    "ProductElementCode": "B00015",
                    '.$nominee_str.'
                  }';
                }
          }

          if(trim($value) == 'B00073'){
                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                $Ccc_count = $data['description'];
                $Ccc_suminsured = $data['value'];
          }

          /*PA COVER END*/

          if($policy_for != 2){ // 2 = Corporate
                if(trim($value) == 'B00018'){

                  $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                  if($PolicyCoverageListEnhancedPACoverAddOn!=''){
                    $PolicyCoverageListEnhancedPACoverAddOn.=',';
                  }

                  $PolicyCoverageListEnhancedPACoverAddOn.='{
                    "SumInsured": '.$data['value'].',
                    "ProductElementCode": "B00018"
                  }';
                }
          }

          if(trim($value) == 'B00019'){
                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                if($PolicyCoverageListEnhancedPACoverAddOn!=''){
                  $PolicyCoverageListEnhancedPACoverAddOn.=',';
                }
                $PolicyCoverageListEnhancedPACoverAddOn.='{
                  "SumInsuredPerUnit": '.$data['value'].',
                  "TotalSumInsured": 500000,
                  "ProductElementCode": "B00019"
                }';
          }

          if(trim($value) == 'B00020'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);
                if($PolicyCoverageListHospitalCashCoverAddOn!=''){
                  $PolicyCoverageListHospitalCashCoverAddOn.= ',';
                }

                 $PolicyCoverageListHospitalCashCoverAddOn.='{
                    "SumInsuredPerUnit": '.$data['value'].',
                    "SumInsured": 5000,
                    "ProductElementCode": "B00020"
                  }';
          }

          if(trim($value) == 'B00022'){

                $data = $apiContoller->addMoreCoverageRequestData($value,$add_more_coverage_request_json);

                if($PolicyCoverageListHospitalCashCoverAddOn!=''){
                  $PolicyCoverageListHospitalCashCoverAddOn.= ',';
                }

                $PolicyCoverageListHospitalCashCoverAddOn.='{
                  "SumInsuredPerUnit": '.$data['value'].',
                  "TotalSumInsured": 30000,
                  "ProductElementCode": "B00022"
                }';
          }

        } // Loop end

        if(!empty($Ccc_count)){

            $PACleanerConductor = ($Ccc_count + $PaidDriverCount); // total number of PA coolie and LLPD
            $total_suminsured_ccc = intval($Ccc_suminsured) * $PACleanerConductor;

            if(!empty($PolicyCoverageListPACoverAddOn)){
              $PolicyCoverageListPACoverAddOn.= ',';
            }

            $PolicyCoverageListPACoverAddOn.='{
              "SumInsuredPerUnit": "'.$Ccc_suminsured.'",
              "TotalSumInsured": '.$total_suminsured_ccc.',
              "ProductElementCode": "B00073"
            }';
        }

        $start_date = date('Y-m-d');
        $start_time = date("H:i:s");
        //$start_date = date('Y-m-d',(strtotime ( '+1 day' , strtotime ($start_date))));
        $next_year_date = date('Y-m-d',(strtotime ( '+1 year' , strtotime ( $start_date) ) ));
        $expiry_date = date('Y-m-d',(strtotime ( '-1 day' , strtotime ( $next_year_date) ) ));
        $pincode_arr = json_decode($policy_data->pincode_response);
        

        if($policy_for == '1')
        {
            if(!is_null($responseData['salutation']))
            {
                $title = $responseData['salutation']['salutation_id'];
            }
            else 
            {
              $title = '9000000001';
            }
        }
        else
        {
            $title = '9000000003';
        }

        if(!empty($responseData['eia_no'])){
            $eia_no = $responseData['eia_no'];
        }
        else{
            $eia_no = 'EIANumber';
        }

        if($policy_for == '2')
        {
          $gstin = $responseData['gstn_no'];
          $date_of_interpolation = $responseData['date_of_incorporation'];
          $gSTRegistrationNum = $responseData['gstn_no'];
        }

        if(isset($responseData['previouspolicy']) && count($responseData['previouspolicy']) > 0 && $responseData['previouspolicy']['is_claim'] !=1){

          if($responseData['previouspolicy']['claim_bonus'] !='1'){

            switch ($responseData['previouspolicy']['claim_bonus'])
            {
              case "0":
                $ncb = 20;
                break;
              case "20":
                $ncb = 25;
                break;
              case "25":
                $ncb = 35;
                break;
              case "35":
                $ncb = 45;
                break;
              case "45":
                $ncb = 50;
                break;
              case "50":
                $ncb = 50;
                break;
            }

            $ncb_str = '"IsNCB": 1,
            "NCB": "'.round(($ncb/100), 2).'",
            "NCBPrePolicy": "1",
            "NCBLetterDate": "2017-09-09T00:00:00.000",
            "NCBProof": "2",';
          }

          if(!is_null($responseData['previouspolicy']['name'])){
            $kindofPolicy = $responseData['previouspolicy']['name'] == 3 ? 1 : $responseData['previouspolicy']['name'];
          }

          $hasprepolicy_str = '"HasPrePolicy": "1",';
          $prev_pol_str = '"KindofPolicy": "'.$kindofPolicy.'",
          "PreInsuranceComAddr": "'.$responseData['previouspolicy']['city'].'",
          "PreInsuranceComName": "'.$responseData['previouspolicy']['insurancecompany_id'].'",
          "PrePolicyEndDate": "'.$responseData['previouspolicy']['end_date'].'T23:59:59",
          "PrePolicyNo": "'.$responseData['previouspolicy']['policy_no'].'",
          "PrePolicyStartDate": "'.$responseData['previouspolicy']['start_date'].'T00:00:00",';

          
          if(date('Y-m-d') <= date('Y-m-d',(strtotime ($responseData['previouspolicy']['end_date']) ))){
            $start_date = date('Y-m-d',(strtotime ( '+1 day' , strtotime ($responseData['previouspolicy']['end_date']))));
            $next_year_date = date('Y-m-d',(strtotime ( '+1 year' , strtotime ( $start_date) ) ));
            $expiry_date = date('Y-m-d',(strtotime ( '-1 day' , strtotime ( $next_year_date) ) ));
            $start_time = '00:00:00';
          }else{
            $start_date = date('Y-m-d');
            $start_time = date("H:i:s");
            if($responseData['vehiclebrandmodel']['vehicletype']['id'] == '27'){
                $start_date = date('Y-m-d',(strtotime ( '+1 day' , strtotime ($start_date))));
            }
            $next_year_date = date('Y-m-d',(strtotime ( '+1 year' , strtotime ( $start_date) ) ));
            $expiry_date = date('Y-m-d',(strtotime ( '-1 day' , strtotime ($next_year_date))));
          }

        }

        $policy_start_date = $start_date.'T'.$start_time;

        $customer_details_str = '';
        $nightParkloc = '';

        if(!empty($responseData['pincode'])){
            $nightParkloc = '"NightParkLoc": "1",
            "NightParkLocPinCode": "'.$responseData['pincode'].'",
            "DayParkLoc": "1",
            "DayParkLocPinCode": "'.$responseData['pincode'].'",';
        }

        if($policy_for == '2'){
          $IsOrgParty = 'Y';
        } else {
          $IsOrgParty = 'N';
        }

        $pincode_arr = json_decode($responseData['pincode_response']);
        $address = json_decode($responseData['address'], true);

        $customer_details_str = '
          "ContactEmail": "'.$responseData['email_id'].'",
          "Email" : "'.$responseData['email_id'].'",
          "Title": "'.$title.'",
          "CustomerName": "'.$responseData['first_name'].'",
          "RegistrationName": "'.$responseData['first_name'].'",
          "Mobile": "'.$responseData['mobile'].'",
          "PlotNo": "'.$responseData['address'].'",
          "BuildingHouseName": "'.(!empty($address['address2']) ? $address['address2'] : '').'",
          "StreetName": "'.$responseData['location'].'",
          "PostCode": "'.$responseData['pincode'].'",
          "City": "'.(!empty($pincode_arr->CITY_CD) ? $pincode_arr->CITY_CD : '').'",
          "District": "'.(!empty($pincode_arr->DISTRICT_CD) ? $pincode_arr->DISTRICT_CD : '').'",
          "State": "'.(!empty($pincode_arr->statedetails->State_Code) ? $pincode_arr->statedetails->State_Code : '').'",
          "CountryCode": "'.(!empty($pincode_arr->statedetails->Country_Code) ? $pincode_arr->statedetails->Country_Code : '').'",
          "Locality": "'.(!empty($pincode_arr->LCLTY_SUBRB_TALUK_TEHSL_NM) ? $pincode_arr->LCLTY_SUBRB_TALUK_TEHSL_NM : '').'", 
          "EIANumber": "'.$eia_no.'",
          "PAN": "'.$responseData['pancard'].'",';

        if($policy_for == '1'){
            $customer_details_str.= '
            "GenderCode": "'.strtoupper($policy_data->gender).'",
            "DateOfBirth": "'.$policy_data->dob.'",
            "IdNo": "'.$policy_data->pancard.'",
            "IdType": "1",';
        }

        if($policy_for == '2'){
            $gstin = '"CustomerGSTINNo": "'.$policy_data->gstn_no.'",';
            $gstin_str = '
            "DateOfIncorporation": "'.$policy_data->date_of_incorporation.'",
            "GSTRegistrationNum": "'.$policy_data->gstn_no.'",
            "GSTInputState": "",';
        }

        if(empty($responseData['first_name']) && empty($responseData['pincode']))
        {
            $customer_details_str = '
                "CustomerName": "FirstName LastName",
                "Title": "'.$title.'",
                "PostCode": "712222",
                "State" : "MH",
                "GenderCode" : "M",';
        }

        $quote_valid_to = date('Y-m-d',(strtotime ( '+1 month' , strtotime ($start_date))));

        $hypothecation_name = count($responseData['bankdetail']) > 0 ? $responseData['bankdetail'][0]['bank_name'] : 'FNName';
        $hypothecation_branch = count($responseData['bankdetail']) > 0 ? $responseData['bankdetail'][0]['bank_branch'] : 'FNBranchName';

        $driverGenderCode = $responseData['gender'] == 'm' ? 1 : 2;
        $person_list_str = '';

        if($policy_for == '1'){
          // $person_list_str = '"PersonList": [
          //   {
          //     "DriverName": "'.$responseData['first_name'].'",
          //     "DateOfBirth": "'.$responseData['dob'].'",
          //     "RelationshipwithProposer": "1",
          //     "DriverExperience": "1",
          //     "DriverGender": "'.$driverGenderCode.'",
          //     "DrivingLicenseNo": ""
          //   }
          // ],';

          if(empty($responseData['first_name']) && empty($responseData['dob']))
          {
            $person_list_str = '"PersonList": [
              {
                "DriverName": "firstName lastName",
                "DateOfBirth": "1988-04-19",
                "RelationshipwithProposer": "1",
                "DriverExperience": "1",
                "DriverGender": "'.$driverGenderCode.'",
                "DrivingLicenseNo": ""
              }
            ],';
          }
          else{
            $responseData['first_name'] = $responseData['first_name'] ? $responseData['first_name']:"firstName lastName";
			$responseData['dob'] = $responseData['dob'] ? $responseData['dob'] :"1988-04-19";
          $person_list_str = '"PersonList": [
            {
              "DriverName": "'.$responseData['first_name'].'",
              "DateOfBirth": "'.$responseData['dob'].'",
              "RelationshipwithProposer": "1",
              "DriverExperience": "1",
              "DriverGender": "'.$driverGenderCode.'",
              "DrivingLicenseNo": ""
            }
          ],';
        }
        }

        if($PolicyCoverageListLegalLiabilityAddOn!=''){
          $PolicyCoverageListLegalLiability .= '{
            "EffectiveDate": "'.$start_date.'",
            "PolicyBenefitList": [
              '.$PolicyCoverageListLegalLiabilityAddOn.'
            ],
            "ExpiryDate": "'.$expiry_date.'T23:59:59",
            "ProductElementCode": "C101065"
          }';
        }

        $FinalPolicyCoverageList = $PolicyCoverageListLegalLiability;

        if($PolicyCoverageListPACoverAddOn!=''){
          $PolicyCoverageListPACover.='{
            "EffectiveDate": "'.$start_date.'",
            "PolicyBenefitList": [
              '.$PolicyCoverageListPACoverAddOn.'
            ],
            "ExpiryDate": "'.$expiry_date.'T23:59:59",
            "ProductElementCode": "C101066"
          }';
        }

        $FinalPolicyCoverageList.= $FinalPolicyCoverageList!='' && $PolicyCoverageListPACover!='' ? ','.$PolicyCoverageListPACover : $PolicyCoverageListPACover;

        if($PolicyCoverageListEnhancedPACoverAddOn!=''){
          $PolicyCoverageListEnhancedPACover.='{
            "PolicyBenefitList": [
              '.$PolicyCoverageListEnhancedPACoverAddOn.'
            ],
            "ProductElementCode": "C101070",
            "EffectiveDate": "'.$start_date.'",
            "ExpiryDate": "'.$expiry_date.'T23:59:59"
          }';
        }

        $FinalPolicyCoverageList.= $FinalPolicyCoverageList!='' && $PolicyCoverageListEnhancedPACover!='' ? ','.$PolicyCoverageListEnhancedPACover : $PolicyCoverageListEnhancedPACover;

        if(!empty($PolicyCoverageListHospitalCashCoverAddOn)){
          $PolicyCoverageListHospitalCashCover = '{
              "PolicyBenefitList": [
                '.$PolicyCoverageListHospitalCashCoverAddOn.'
              ],
              "ProductElementCode": "C101071",
              "EffectiveDate": "'.$start_date.'",
              "ExpiryDate": "'.$expiry_date.'T23:59:59"
            }';
        }

        $FinalPolicyCoverageList.= $FinalPolicyCoverageList!='' && $PolicyCoverageListHospitalCashCover!='' ? ','.$PolicyCoverageListHospitalCashCover : $PolicyCoverageListHospitalCashCover;

        if($responseData['bcmaster_id'] == 0 && empty($responseData['bcmaster']['id']))
        {
            $details = $this->intermediaryOrgDetails($responseData);

            $responseData['bcmaster'] = [
                'agreement_code' => !empty($details['agreement_code']) ? $details['agreement_code'] : '',
                'imd_code' => !empty($details['imd_code']) ? $details['imd_code'] : ''
            ];
        }

        $registration_part_numbers = json_decode($responseData['motorinsurance']['registration_part_numbers'], true);

        $data = '{
            "RequestHeader": {
              "requestID": "'.random_int(100000, 999999).'",
              "action": "fullQuote",
              "channel": "SBIG",
              "transactionTimestamp": "'.date("d-M-Y-h:i:s").'"
            },
            "RequestBody":{
              "AgreementCode": "'.$responseData['bcmaster']['agreement_code'].'",
              "SourceType": "18",
              "AlternatePolicyNo": "",
              "BusinessType": "'.$responseData['motorinsurance']['policytype_id'].'",
              '.$gstin.'
              "EffectiveDate": "'.$policy_start_date.'",
              "ExpiryDate": "'.$expiry_date.'T23:59:59",
              '.$prev_pol_str.'
              "NewBizClassification": "'.$responseData['motorinsurance']['policytype_id'].'",
              "PolicyCustomerList": [
                {
                  '.$customer_details_str.'
                  '.$gstin_str.'
                  "EducationCode": "2300000003",
                  "GroupCompanyName": "SBIG",
                  "IsOrgParty": "'.$IsOrgParty.'",
                  "IsPolicyHolder": "Y",
                  "NationalityCode": "IND"
                }
              ],
              "PolicyLobList": [
                {
                  "PolicyRiskList": [
                    {
                      "PCVVehicleSubClass": "'.$responseData['motorinsurance']['subclass_id'].'",
                      "ProposedUsage": "'.$responseData['vehiclebrandmodel']['proposed_used_id'].'",
                      "MonthlyUseDistance": "'.$responseData['motorinsurance']['averagemonthlyusage_id'].'",
                      '.$nightParkloc.'
                      "Last3YrDriverClaimPresent": "0",
                      "NoOfDriverClaims": "",
                      "DriverClaimAmt": "",
                      "ClaimStatus": "",
                      "ClaimType": "1",
                      "CountCCC": '.$Ccc_count.',
                      "AdditionalTowingCharges": "'.$AdditionalTowingCharges.'",
                      "BodyType": "'.$responseData['vehiclebrandmodel']['varientmodel']['bodystyle']['DESCRIPTION'].'",
                      "ChassisNo": "'.$responseData['motorinsurance']['chasis_no'].'",
                      "NFPPCount": '.$NFPPCount.',
                      "EmployeeCount": '.$EmployeeCount.',
                      "EngineNo": "'.$responseData['motorinsurance']['engine_no'].'",
                      "IDV_User": "'.$request->input('idv_value').'",
                      '.$ncb_str.'
                      "FNBranchName": "'.$hypothecation_branch.'",
                      "FNName": "'.$hypothecation_name.'",
                      "PaidDriverCount": '.$PaidDriverCount.',
                      "ProductElementCode": "R10005",
                      "ManufactureYear": "'.$ManufactureYear.'",
                      "RTOCityDistric": "'.$responseData['motorinsurance']['rtolocation']['RTO_DIS_CODE'].'",
                      "RTOCluster": "'.$responseData['motorinsurance']['rtolocation']['RTO_Cluster'].'",
                      "RTOLocation": "'.$responseData['motorinsurance']['rtolocation']['RTO_LOCATION'].'",
                      "RegistrationDate": "'.$responseData['motorinsurance']['registration_date'].'T00:00:00.000",
                      "RegistrationNo": "'.$responseData['motorinsurance']['registration_no'].'",
                      "RegistrationNoBlk1": "'.$registration_part_numbers['reg_number_part_one'].'",
                      "RegistrationNoBlk2": "'.$registration_part_numbers['reg_number_part_two'].'",
                      "RegistrationNoBlk3": "'.$registration_part_numbers['reg_number_part_three'].'",
                      "RegistrationNoBlk4": "'.$registration_part_numbers['reg_number_part_four'].'",
                      '.$trailer.'
                      "Variant": "'.$responseData['vehiclebrandmodel']['varientmodel']['varient_id'].'",
                      "VehicleMake": "'.$responseData['vehiclebrandmodel']['vehiclebrand']['two_mk_id'].'",
                      "VehicleModel": "'.$responseData['vehiclebrandmodel']['vehiclemodel']['mk_model_id'].'",
                      "PolicyCoverageList": [
                        '.$FinalPolicyCoverageList.'
                      ]
                    }
                  ],
                  '.$person_list_str.'
                  "ProductCode": "CMVPC01",
                  "PolicyType": "2"
                }
              ],
              '.$hasprepolicy_str.'
              "PremiumCurrencyCode": "INR",
              "PremiumLocalExchangeRate": 1,
              "ProductCode": "CMVPC01",
              "ProductVersion": "1.0",
              "ProposalDate": "'.$start_date.'",
              "QuoteValidTo": "'.$quote_valid_to.'",
              "SBIGBranchStateCode": "MH"
            }
        }';

        $url = $apiContoller->getWsUrl('fullQuote');
        $apiRequest = array();
        $apiRequest['policyholder_id'] = $policyholder_id;
        $apiRequest['api_name'] = 'fullQuotePCV';
        $apiRequest['api_url'] = $url;
        $apiRequest['api_request'] = $data;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:application/json","Authorization:Bearer $Authorization","X-IBM-Client-Id:".CLIENT_ID."","X-IBM-Client-Secret:".CLIENT_SECRET.""));

        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        $result = curl_exec($ch);
        $apiRequest['api_response'] = $result;
        $output = $apiContoller->insertIntoApilog($apiRequest);

        $FullQuoteResponse = json_decode($result, TRUE);
        $this->savePCVQuote($policyholder_id, $FullQuoteResponse);
        return $FullQuoteResponse;
    }
}
