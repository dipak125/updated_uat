import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import { Row, Col, FormGroup } from 'react-bootstrap';
import TicketCountTable from "../support/TicketCountTable"
import ReactPaginate from 'react-paginate';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';

class TicketCount extends Component {

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    render() {
        return (
            <>
            <BaseComponent>
                <section className="d-flex justify-content-left">
                    <div className="flex-fill w-100">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2">
                                    <SideNav />
                                </div>
                                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                
                                <div className="createtckt">
                            <FormGroup>
                                <div className="main">
                                    <input
                                        name="search"
                                        type="text"
                                        className="srchimg W250 m-b-20"
                                        placeholder="Search"
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                            </FormGroup>

                            <div className="d-flex justify-content-between tcktcunt">
                            <h2>Tickets Count</h2>
                            <h2> Closed Count</h2>
                            </div>

                            <TicketCountTable/>

                            <div className="pagiSec">
									<ReactPaginate
									previousLabel={"prev"}
									nextLabel={"next"}
									previousLinkClassName={"pagiLftArrow"}
									nextLinkClassName={"pagiRtArrow"}
									breakLabel={"..."}
									breakClassName={"break-me"}
									marginPagesDisplayed={2}
									pageRangeDisplayed={5}
									containerClassName={"pagiList"}
									activeLinkClassName={"active"}/>
								</div>
                </div>
                                    
                                    
                                    
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
            </BaseComponent>
            </>
        );
    }
}

export default TicketCount;