import React, { Component } from 'react';
import BaseComponent from '../BaseComponent';
import { Row, Col, FormGroup, Button } from 'react-bootstrap';
import Encryption from '../../shared/payload-encryption';
import moment from "moment";

// import SideNav from '../common/side-nav/SideNav';
// import Footer from '../common/footer/Footer';
import TicketStatus from './TicketStatus'
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import axios from "../../shared/axios"
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';


const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <LinkWithTooltip
            tooltip="Show Ticket"
            href="#"
            clicked={() => refObj.ticketDetails(row.ticketid_Internal, row)
            }
            id="tooltip-1"
        >
            {row.ticket_no}
        </LinkWithTooltip>
    )
}

const getStatus = (refObj) => (cell, row, enumObject) => {
        return (
            <LinkWithTooltip
                tooltip="Get Status"
                href="#"
                clicked={() => refObj.getCurrentStatus(row)
                }
                id="tooltip-1"
            >
                <Button type="button" >
                    Get Status
                </Button> 
            </LinkWithTooltip>
        )
    }

class TicketCount extends Component {

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    state = {
        ticketCount: [],
        ticketId: "",
        viewTicket: false,
        selectedTicket: []
    }

    componentDidMount() {
        this.getTickets(1);
    }


    getCurrentStatus = (row) => {
        const formData = new FormData(); 
        formData.append('ticket_id', row.ticketid_Internal) 

        this.props.loadingStart();
        axios.post('help-ticket/incident-details',formData)
        .then(res=>{
            if(res.data.error == false) {
                swal(`Status: ${res.data.data.currentStatus}`)
                .then((willUpdate) =>{
                    if(willUpdate) {
                        this.getTickets(1)
                    }
                } )
            }   
            else{
                this.getTickets(1)
            }             
            this.props.loadingStop();
        }).
        catch(err=>{
            this.props.loadingStop();
        })  
    }

    getTickets = (page_no) => {

        const formData = new FormData();
        let encryption = new Encryption();
        page_no = page_no ? page_no : '1'
        let user_type = ""
        let master_id = ""
        let user_id = ""

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")): "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }

        if(user_data.login_type == '4') {
            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if(bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
            }
             user_type = sessionStorage.getItem('csc_id') ? 'csc' : 'bc'
             master_id = sessionStorage.getItem('csc_id') ? '5' : bc_data ? bc_data.agent_id : "0"
             user_id = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : ""
        }
        else {
             user_type = user_data.user_type
             master_id = user_data.bc_master_id
             user_id = user_data.master_user_id
        }
        

        formData.append('user_type', user_type); 
        formData.append('master_id', master_id);
        formData.append('user_id', user_id);

        // formData.append('page_no', page_no)   

        this.props.loadingStart();
        axios.post('help-ticket/list',formData)
        .then(res=>{
            let statusCount = res.data.data ? res.data.data : []   
            let ticketCount = res.data.data ? res.data.data : []                      
            this.setState({
                statusCount, ticketCount
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

    ticketDetails = (ticketId, row) => {
        this.setState({ ticketId: ticketId, viewTicket: true , selectedTicket: row})  
    }

    updateViewTicket = () => {
        let viewTicket = this.state.viewTicket;
        this.setState({
            viewTicket: !viewTicket
        })
        this.getTickets(1);
    }

    render() {
        const { ticketCount, ticketId, viewTicket } = this.state
        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            page: 1,  // which page you want to show as default
            sizePerPageList: [{
                text: '5', value: 5
            }, {
                text: '10', value: 10
            }, {
                text: '15', value: 15
            }, {
                text: '20', value: 20
            }, {
                text: 'All', value: ticketCount.length
            }], // you can change the dropdown list for size per page
            sizePerPage: 10,  // which size per page you want to locate as default
            pageStartIndex: 1, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            firstPage: 'First', // First page button text
            lastPage: 'Last', // Last page button text
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            paginationPosition: 'bottom',  // default is bottom, top and both is all available
            noDataText: 'No Data'

        };
        return (
            <>

                <div className="contBox m-b-45 tickedTable">

                    {viewTicket == true ?
                        <TicketStatus ticketId={ticketId} selectedTicket= {this.state.selectedTicket} updateViewTicket={this.updateViewTicket} />
                        :
                        <BootstrapTable ref="table"
                            data={ticketCount}
                            pagination={true}
                            headerStyle={{ background: '#85c0ff' }}
                            striped
                            hover
                            condensed
                            wrapperClasses="table-responsive"
                            className="ticketTable"
                        >

                            <TableHeaderColumn filter={{ type: 'TextFilter' }} width='100px' dataField='ticket_no' isKey={true} dataFormat={actionFormatter(this)} >Ticket No.</TableHeaderColumn>
                            <TableHeaderColumn filter={{ type: 'TextFilter' }} width='100px' dataField="status" tdStyle={{ whiteSpace: 'normal' }} >Status</TableHeaderColumn>
                            <TableHeaderColumn filter={{ type: 'TextFilter' }} width='100px' dataField='area' >Subject</TableHeaderColumn>
                            <TableHeaderColumn filter={{ type: 'TextFilter' }} width='120px' dataField="created_at" dataFormat={cell => moment(cell).format('DD/MM/YYYY hh:mm A')} tdStyle={{ whiteSpace: 'normal' }} >Date Logged</TableHeaderColumn>
                            <TableHeaderColumn width='100px' dataField='id' dataFormat={getStatus(this)} ></TableHeaderColumn>

                        </BootstrapTable>
                    }
                </div>
            </>
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

export default connect( mapStateToProps, mapDispatchToProps)(TicketCount);