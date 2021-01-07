import React, { Component } from 'react';
import BaseComponent from '../BaseComponent';
import { Row, Col, FormGroup } from 'react-bootstrap';
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

    getTickets = (page_no) => {

        const formData = new FormData();
        let encryption = new Encryption();
        page_no = page_no ? page_no : '1'

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }

        formData.append('page_no', page_no)   
        formData.append('policy_status', 'pending')
        formData.append('bc_agent_id', sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : "") 

        this.props.loadingStart();
        axios.get('help-ticket/list')
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

                            <TableHeaderColumn width='100px' dataField='ticket_no' isKey={true} dataFormat={actionFormatter(this)} >Ticket No.</TableHeaderColumn>
                            <TableHeaderColumn width='120px' dataField="status" tdStyle={{ whiteSpace: 'normal' }} >Status</TableHeaderColumn>
                            <TableHeaderColumn width='150px' dataField="attachment_file_name" tdStyle={{ whiteSpace: 'normal' }}>Attachment</TableHeaderColumn>


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