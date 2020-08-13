import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import { Row, Col, FormGroup, Button } from 'react-bootstrap';
import moment from "moment";

import swal from 'sweetalert';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";

const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <LinkWithTooltip
            tooltip="Get Status"
            href="#"
            clicked={() => swal("Row "+row.choiceno)
            }
            id="tooltip-1"
        >
            <Button type="button" >
                Get Status
            </Button> 
        </LinkWithTooltip>
    )
}

class StatusTable extends Component {
    state = {
        statusCount: [
            {
                choiceno: "Q5420001",
                product: "Motor 4 Whelleer",
                inspection: "24/07/2020 14:12:35",
                premium: "20590",
                status: "Vehicle recommended and report updated",
                tat: "149",
                getstatus: "149",
            },
            {
                choiceno: "Q5420002",
                product: "Motor 4 Whelleer",
                inspection: "24/07/2020 14:12:35",
                premium: "20590",
                status: "Vehicle recommended and report updated",
                tat: "149",
                getstatus: "149",
            },
            {
                choiceno: "Q5420003",
                product: "Motor 4 Whelleer",
                inspection: "24/07/2020 14:12:35",
                premium: "20590",
                status: "Vehicle recommended and report updated",
                tat: "149",
                getstatus: "149",
            },
            {
                choiceno: "Q5420004",
                product: "Motor 4 Whelleer",
                inspection: "24/07/2020 14:12:35",
                premium: "20590",
                status: "Vehicle recommended and report updated",
                tat: "149",
                getstatus: "149",
            },
        ]
    }
    render() {
        const { statusCount } = this.state
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
                text: 'All', value: statusCount.length
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
            <BaseComponent>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                            <div className="contBox m-b-45 tickedTable">
                                <BootstrapTable ref="table"
                                    data={statusCount}
                                    pagination={true}
                                    headerStyle={ { background: '#85c0ff'} }
                                    striped
                                    hover
                                    condensed
                                    wrapperClasses="table-responsive"
                                >

                                    <TableHeaderColumn width='100px' dataField='choiceno' isKey dataSort>Choice No</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="product" >Product</TableHeaderColumn>
                                    <TableHeaderColumn width='150px' dataField="inspection">Inspection Date</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="premium" >Premium</TableHeaderColumn>
                                    <TableHeaderColumn width='200px' dataField="status" >Status</TableHeaderColumn>
                                    <TableHeaderColumn width='50px' dataField="tat" >TAT</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="getstatus" dataAlign="center" dataFormat={ actionFormatter(this) }>Get Status</TableHeaderColumn>

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

export default StatusTable;
