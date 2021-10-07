import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import moment, { min } from "moment";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import UpdateEndorsement from './UpdateEndorsement';


const initialValues = {
  sr_no: ""

}

const style = {
  fontSize: 12
};

const actionFormatter = (refObj) => (cell, row) => {
  return (
    <div>
      <LinkWithTooltip
        tooltip="Click to view endorsement detail"
        href="#"
        clicked={() => refObj.redirectLink(cell,row)
        }
        id="tooltip-1"
        >               
        <Button type="button" style = {style}>View</Button>
      </LinkWithTooltip>
  &nbsp;
      <LinkWithTooltip
      tooltip="Click to get updated status"
      href="#"
      clicked={() => refObj.getStatus(cell,row)
      }
      id="tooltip-1"
      >               
      <Button type="button" style = {style}>Get Status</Button>
      </LinkWithTooltip>
    </div>
  )
}

const srNumFormatter = (refObj) => (cell, row, enumObject, index) => {
  return (index+1 );
}

function nameFormatter(cell, row){
  let name = cell && cell.requestdata && cell.requestdata.policyholder ? cell.requestdata.policyholder.first_name : null
  return (name)  
}

function policyFormatter(cell, row){
  let name = cell && cell.requestdata && cell.requestdata.policyholder && cell.requestdata.policyholder.vehiclebrandmodel && cell.requestdata.policyholder.vehiclebrandmodel.vehicletype ? cell.requestdata.policyholder.vehiclebrandmodel.vehicletype.name : null
  return (name)  
}

class ViewStatus extends Component {
    state = {
      permanent_list:[],
      list:[],
      sr_no:"",
      viewEndorsement: false,
      endorsementdata_id:"",
  
    }

    redirectLink = (cell,row) => {
      let endorsementInfo = []
      endorsementInfo = row.info
      this.setState({viewEndorsement: true, endorsementdata_id:cell, endorsementInfo: endorsementInfo})
  }

    backButton = () => {
      let viewEndorsement = this.state.viewEndorsement;
      this.setState({
        viewEndorsement: !viewEndorsement
    })
    }

    updateList = () => {
      let viewEndorsement = this.state.viewEndorsement;
      this.setState({
        viewEndorsement: !viewEndorsement
    })
    this.getList()
    }
   
    forwardNextPage=()=> {    
        this.props.history.push(`/AdditionalDetails_GSB/${this.props.match.params.productId}`);  
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }


    getStatus=(cell,row)=>{
      const formData=new FormData();
      formData.append("endorsementdata_id",cell);
      this.props.loadingStart();
      axios
      .post("dyi-endorsement/status",formData)
      .then(res=>{
        if(res.data.error == false) {
          swal(`Status :  ${res.data.data.current_status}`)
          .then((willUpdate) => {
            if(willUpdate) {
              this.getList()
            }
          })     
        }
        else {
          swal(res.data.msg)
          this.props.loadingStop()
        }
          
      })
      .catch(err=>
              this.props.loadingStop()
          )
    }

    getSearch=(values)=>{
      console.log("values search ------------- ", values.sr_no)
      const formData=new FormData();
      formData.append("sr_no",values.sr_no);
      this.props.loadingStart();
      axios
      .post("dyi-endorsement/search",formData)
      .then(res=>{
        if(res.data.error == false) {
          this.setState({
            list:res.data.data.endrosment,
            permanent_list:res.data.data.endrosment
          })
          this.props.loadingStop()
        }
        else {
          swal(res.data.msg)
          this.props.loadingStop()
        }
          
      })
      .catch(err=>
          this.props.loadingStop()
      )
    }

    getList=()=>{
      let encryption = new Encryption();
      const formData=new FormData();
      let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
      if (user_data.user) {
          user_data = JSON.parse(encryption.decrypt(user_data.user));
          formData.append("user_id",user_data.bc_master_id)

          if(user_data.login_type == 4) {
            if(user_data.bc_master_id == 5) {
                formData.append('user_type', 'csc')
            }
            else {
                formData.append('user_type', 'bc')
                formData.append('agent_id', user_data.user_name)
            }
          }
          else {
              formData.append('user_type', user_data.user_type)
          }

          this.props.loadingStart();
          axios
          .post("dyi-endorsement/list", formData)
          .then(res=>{
            // console.log("list data===",res.data.data.list)
            this.setState({
              ...this.state,
              list:res.data.data.list,
              permanent_list:res.data.data.list
            })
            this.props.loadingStop()
          })
          .catch(err=>
            this.props.loadingStop()
          )
          
      }
    }

    componentDidMount(){
      this.getList();
    }

    render() {
        const { list, viewEndorsement, endorsementdata_id, endorsementInfo} = this.state

        var totalRecord = list ? list.length : 1
        var page_no =  1 

        const options = {
          // afterColumnFilter: this.afterColumnFilter,
          // onExportToCSV: this.onExportToCSV,
          page: parseInt(page_no),  // which page you want to show as default
          sizePerPage: 5,
          paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
          prePage: 'Prev', // Previous page button text
          nextPage: 'Next', // Next page button text
          hideSizePerPage: true,
          // remote: true,
          showTotal: true,
          // onPageChange: this.onPageChange.bind(this),

      };

        return (
            <>           
              <BaseComponent>        
                <div className="page-wrapper">
                      <div className="flex-fill w-100">
                        <div class="row">

                          <aside className="left-sidebar">
                            <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
                            <SideNav />
                            </div>
                          </aside>

                          <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">
                          {viewEndorsement == true ?
                            <div>
                              <h4 className="text-center mt-3 mb-3">Update Endorsement </h4>
                              <UpdateEndorsement endorsementdata_id = {endorsementdata_id} endorsementInfo= {endorsementInfo} 
                              updateList = {this.updateList} backButton = {this.backButton} />
                            </div>
                            :
                            <div>
                              <h4 className="text-center mt-3 mb-3">View Endorsement </h4>
                              <Formik initialValues={initialValues} 
                              onSubmit={this.getSearch }
                                  //  validationSchema={endorsementValidation}
                                  >
                                  {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                  return (
                                      <Form>    
                                          <Row className="row formSection">
                                          <Col sm={6} md={6} lg={4}  >
                                            <Field 
                                                class="form-control me-2" 
                                                type="text" 
                                                placeholder="Search Sr no" 
                                                aria-label="Search" 
                                                name = "sr_no" 
                                            />
                                          </Col>
                                          <Col sm={6} md={6} lg={4} >
                                            <Button class="btn btn-outline-success" type="submit" >Search </Button>
                                          </Col>
                                          </Row >
                                      </Form>
                                  )}}
                              </Formik>


                              <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox breakin">
                                <div className="contBox m-b-45 tickedTable">
                                  <div className="customInnerTable dataTableCustom">
                                    <BootstrapTable ref="table"
                                        data={list}
                                        pagination={true}
                                        options={options}
                                        // remote={true}
                                        // fetchInfo={{ dataTotalSize: totalRecord }}
                                        // striped
                                        // hover
                                        wrapperClasses="table-responsive"
                                    >
                                        <TableHeaderColumn width='30px'  dataField="sr_no" dataAlign="center" isKey dataFormat = {srNumFormatter(this)} >Sr</TableHeaderColumn>
                                        <TableHeaderColumn width='100px'  dataField="sr_no" dataAlign="center" >SR/R Number</TableHeaderColumn>
                                        <TableHeaderColumn width='100px'  dataField="policydata" dataAlign="center" dataFormat={nameFormatter} >Customer Name</TableHeaderColumn>
                                        <TableHeaderColumn width='150px'   dataField='policy_no' dataAlign="center" dataSort>Policy Number</TableHeaderColumn>
                                        <TableHeaderColumn width='150px'  dataField="policydata" dataAlign="center"  dataFormat={policyFormatter} > Policy Product</TableHeaderColumn>
                                        <TableHeaderColumn width='100px'  dataField="created_at" dataAlign="center" >Date</TableHeaderColumn>
                                        <TableHeaderColumn width='100px'  dataField="endorsement_status" dataAlign="center" >Status</TableHeaderColumn>
                                        <TableHeaderColumn width='150px'  dataField="id" dataAlign="center" dataFormat={actionFormatter(this)} >Action</TableHeaderColumn>
                                    </BootstrapTable>
                                  </div>
                                </div>
                              </div>
                              </div>}
                          </div>
                        </div>     
                      </div>
                </div>
              </BaseComponent>      
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
      loading: state.loader.loading,
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(ViewStatus));