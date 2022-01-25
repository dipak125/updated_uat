import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Swal from "sweetalert2";
import swal from 'sweetalert';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import axios from "../../shared/axios"
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import Encryption from '../../shared/payload-encryption';
import moment from "moment";


const actionFormatter = (refObj) => (cell, row) => {
    // , enumObject
    return (
        <LinkWithTooltip
        tooltip="Click to proceed"
        href="#"
        clicked={() => refObj.redirectLink(cell,row)
        }
        id="tooltip-1"
        >               
        <div>{polNumFormatter(cell)}</div>
        </LinkWithTooltip>
    )
}


function premiumFormatter(cell) {
    return (cell ? (cell.net_premium ? cell.net_premium: null): null);
}  

function polNumFormatter(cell) {
    return (cell ? (cell.policy_note ? cell.policy_note.policy_no : null): null);
} 

function productFormatter(cell, row) {
    return (cell ? (cell.vehicletype ? cell.vehicletype.name : null): null);
}


function nameFormatter(cell, row){

    if(row.first_name!=null){
        return (
            <div>{row.first_name+' '+row.last_name}</div>
        ) 
    }else{
        return (
            <div> --- </div>
        )
    }
    
    
}
const share = (refObj)=>(cell,row)=>{
    return (
        <Button className="btn btn-sm" onClick={()=>sent(refObj,cell,row)}>Send Quote</Button>
    )
 }
 const sent=(refObj,cell,row)=>{
     console.log("cell",refObj,cell,row.reference_no)
     Swal.fire({
         input: 'email',
         inputPlaceholder:"Enter email",
         showCancelButton: true,
         cancelButtonColor:"red",
         confirmButtonColor:"green",
         confirmButtonText:"Send"        
     }).then((result) => {
         if (result.value) {
            let email=result.value;
            refObj.shareEmail(email,row.reference_no)
            
         }
     });
 }

const statusFormatter = (refObj) => (cell,row) => {
    let trans = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
    return (
        // cell.payment_link_status == '0' ? <div>{trans['QuoteIssued']}</div> :  <div>Payment link sent</div>
        cell.payment_link_status == '0' ? <div>{trans['QuoteIssued']}</div> :  cell.payment_link_status == '4' ? <div>Customer Consent Pending</div> : <div>Payment link sent</div>
    )
}

const newInitialValues = {}


class QuoteSearch extends Component {
    state = {
        statusCount: [],
        policyHolder: [],
        searchValues: {},
        products: []

    }
    shareEmail=(email,policy_ref_no)=>{
        console.log("cell",email,policy_ref_no);
        const formData = new FormData();
        formData.append('email_address',email);
        formData.append('policy_ref_no',policy_ref_no);
        this.props.loadingStart();
        axios.post("policy-download/quotation-share",formData)
        .then(res=>{
            swal(res.data.msg)
            this.props.loadingStop();
        }).
        catch(err=>{
            swal("Unable to share")
            this.props.loadingStop();
        })
        
    }

    redirectLink = (cell,row) => {
        //console.log('1st Char ===',row.page_name.substr(0, 1))
        let page_name = row.page_name
        //console.log('page_name == ', page_name)
        localStorage.setItem("policyHolder_refNo", row.reference_no)
        localStorage.setItem("policy_holder_ref_no", row.reference_no)        
        localStorage.setItem("policyHolder_id", cell.policyholder_id)
        if(page_name.substr(0, 1) == '/'){
            this.props.history.push(`${page_name}`);
        }else{
            this.props.history.push(`/${page_name}`);
        }
        
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    openPage = (cell) => {
        swal(cell.policy_note.policy_no)
    }

    fetchDashboard=(page_no)=>{

        const formData = new FormData();
        let encryption = new Encryption();
        page_no = page_no ? page_no : '1'


        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }
        
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")): "";
        let user_id = ""
        if (user_data) {
            user_id = JSON.parse(encryption.decrypt(user_data.user));
        }

        formData.append('start_date', moment().format("YYYY-MM-DD"))   
        formData.append('end_date', moment().format("YYYY-MM-DD"))   
        formData.append('bcmaster_id', user_id.bc_master_id ) 
        formData.append('page_no', page_no)   
        formData.append('policy_status', 'pending')
        if(user_id.login_type == '4') {
            formData.append('bc_agent_id', sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : "")
        }
        else {
            formData.append('bc_agent_id', user_id.master_user_id)
            formData.append('login_type', user_id.login_type)
        }
         

        this.props.loadingStart();
        axios.post('bc/policy-customer',formData)
        .then(res=>{
            if(res.data.error == false) {
                let statusCount = res.data.data ? res.data.data : []   
                let policyHolder = res.data.data ? res.data.data.policyHolder : []                      
                this.setState({
                    statusCount, policyHolder
                });
                this.props.loadingStop();
            }
            else {
                swal(res.data.msg)
                this.props.loadingStop();
            }              
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                statusCount: []
            });
        })
    
    }

    onPageChange(page, sizePerPage) {
    this.fetchDashboard(page);
    }

    renderShowsTotal(start, to, total) {
        let trans = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        let lang = localStorage.getItem("lang_name") ? localStorage.getItem("lang_name") : []
        start = start ? start : 0
        to = to ? to : 0
        total = total ? total : 0
        return (
          <p style={ { color: 'blue' } }>
            {/* {lang == 'en' ? 'From'  {start}  'to' { to }, 'total is' { total }  : 'hello' } */}
            {trans['From']} { start } {trans['to']} { to }, {trans['totalis']} { total } {trans['hai']}
          </p>
        );
      }

    componentDidMount() {
        this.fetchDashboard(1)
    }


    render() {
        const { statusCount, policyHolder, products } = this.state
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        var totalRecord = statusCount ? statusCount.totalRecord : 1
        var page_no = statusCount ? statusCount.page_no : 1 

        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            page: parseInt(page_no),  // which page you want to show as default
            sizePerPage: 10,
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            prePage: phrases['Prev'], // Previous page button text
            nextPage: phrases['Next'], // Next page button text
            hideSizePerPage: true,
            remote: true,
            showTotal: true,
            onPageChange: this.onPageChange.bind(this),

        };

          
        return (
            <BaseComponent>
			
			<div className="page-wrapper">
			
                <div className="container-fluid">
                    <div className="row">
					
						<aside className="left-sidebar">
							 	 <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
							 		<SideNav />
								 </div>
								</aside>
										
								{/*<div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">               
									<SideNav />
								 </div>*/}
					
                       					
						
                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">
                        <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                            <div className="contBox m-b-45 tickedTable">
                            <h4 className="text-center mt-3 mb-3">{phrases['QuoteHistory']}</h4>                           

                                {policyHolder ? 
                                <div className="customInnerTable quotesearch">
                                <BootstrapTable ref="table"
                                    data={policyHolder}
                                    pagination={true}
                                    options={options}
                                    remote={true}
                                    fetchInfo={{ dataTotalSize: totalRecord }}
                                    // striped
                                    // hover
                                    wrapperClasses="table-responsive"
                                >

                                    <TableHeaderColumn width='195px'  dataField="request_data" dataAlign="center" dataFormat={ actionFormatter(this)} isKey >{phrases['QuoteNumber']}</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="request_data" dataAlign="center" dataFormat={ nameFormatter} >{phrases['ProposerName']}</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="vehiclebrandmodel" dataAlign="center" dataFormat={productFormatter} >{phrases['Product']}</TableHeaderColumn>
                                    <TableHeaderColumn width='95px'  dataField='created_at' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell).format("DD-MM-YYYY") : '')} dataAlign="center" dataSort>{phrases['QuoteIssueDate']}</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataAlign="center" dataField="request_data" dataFormat={premiumFormatter} > {phrases['Premium']}</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="request_data" dataAlign="center" dataFormat={statusFormatter(this)} >{phrases['Status']}</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="request_data" dataAlign="center" dataFormat={share(this)} >Share Quote</TableHeaderColumn>
                                    

                                </BootstrapTable>
                                </div>
                                : null }
                            </div>
                        </div>
                        <Footer />
                    </div>
                </div>
				 </div>
            </BaseComponent>
        );
    }
}

const mapStateToProps = state => {
    return {
      loading: state.loader.loading
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop())
    };
  };

export default connect( mapStateToProps, mapDispatchToProps)(QuoteSearch);
