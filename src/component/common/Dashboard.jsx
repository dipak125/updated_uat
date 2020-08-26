import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import { Row, Col, FormGroup, Button } from 'react-bootstrap';

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

const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <LinkWithTooltip
            tooltip="Get Status"
            href="#"
            clicked={() => refObj.downloadDoc(cell)
            }
            id="tooltip-1"
        >
            <Button type="button" >
            <img src={require('../../assets/images/download.png')} alt="" />
            </Button> 
        </LinkWithTooltip>
    )
}

function quoteFormatter(cell) {
    return (cell ? (cell.quote_id ? cell.quote_id: null): null);
}

function premiumFormatter(cell) {
    return (cell ? (cell.net_premium ? cell.net_premium: null): null);
}  

function polNumFormatter(cell) {
    return (cell ? (cell.policy_note ? cell.policy_note.policy_no : null): null);
} 

function productFormatter(cell) {
    return (cell ? (cell.vehicletype ? cell.vehicletype.name : null): null);
} 


class Dashboard extends Component {
    state = {
        statusCount: [],
        policyHolder: []

    }

    fetchDashboard=()=>{

        const formData = new FormData();
        let encryption = new Encryption();

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }

        formData.append('bcmaster_id', bc_data ? bc_data.agent_id : "")  
        formData.append('page_no', 1)   
        formData.append('policy_status', 'complete')
        formData.append('bc_agent_id', bc_data ? bc_data.user_info.data.user.username : "",) 

        this.props.loadingStart();
        axios.post('bc/policy-customer',formData)
        .then(res=>{
            let statusCount = res.data.data ? res.data.data : []   
            let policyHolder = res.data.data ? res.data.data.policyHolder : []                      
            this.setState({
                statusCount, policyHolder
            });
            this.props.loadingStop();
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                statusCount: []
            });
        })
    
    }

    downloadDoc = (refNumber) => {
        let file_path = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/policy_pdf_download.php?refrence_no=${refNumber}`
        console.log(file_path);
        const { policyId } = this.props.match.params
        const url = file_path;
        const pom = document.createElement('a');
    
        pom.style.display = 'none';
        pom.href = url;
    
        document.body.appendChild(pom);
        pom.click(); 
        window.URL.revokeObjectURL(url);
          
      }

    componentDidMount() {
        this.fetchDashboard();
    }


    render() {
        const { statusCount, policyHolder } = this.state
        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            // page: 1,  // which page you want to show as default
            // sizePerPageList: [{
            //     text: '5', value: 5
            // }, {
            //     text: '10', value: 10
            // }, {
            //     text: '15', value: 15
            // }, {
            //     text: '20', value: 20
            // }, {
            //     text: 'All', value: statusCount.length
            // }], // you can change the dropdown list for size per page
            // sizePerPage: statusCount.no_of_records_per_page,  // which size per page you want to locate as default
            // pageStartIndex: 1, // where to start counting the pages
            // paginationSize: 3,  // the pagination bar size.
            // prePage: 'Prev', // Previous page button text
            // nextPage: 'Next', // Next page button text
            // firstPage: 'First', // First page button text
            // lastPage: 'Last', // Last page button text
            // paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            // paginationPosition: 'bottom',  // default is bottom, top and both is all available
            // noDataText: 'No Data'

        };
        return (
            <BaseComponent>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                        <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                            <div className="contBox m-b-45 tickedTable">
                            <h4 className="text-center mt-3 mb-3">Policy Download</h4>
                                <BootstrapTable ref="table"
                                    data={policyHolder}
                                    pagination={true}
                                    options={options}
                                    striped
                                    hover
                                    wrapperClasses="table-responsive"
                                >

                                    <TableHeaderColumn width='100px' dataField='created_at' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell).format("MM-DD-YYYY") : '')} dataSort>Date</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="first_name" >Name</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="request_data" dataFormat={quoteFormatter} >Quote Number</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="request_data" dataFormat={premiumFormatter} >Net Premium</TableHeaderColumn>
                                    <TableHeaderColumn width='200px' dataField="request_data" dataFormat={polNumFormatter} >Policy Number</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="vehiclebrandmodel" dataFormat={productFormatter} >Product</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="reference_no" isKey dataAlign="center" dataFormat={ actionFormatter(this) }>Download</TableHeaderColumn>

                                </BootstrapTable>
                            </div>
                        </div>
                        <Footer />
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

export default connect( mapStateToProps, mapDispatchToProps)(Dashboard);
