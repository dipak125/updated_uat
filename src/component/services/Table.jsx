import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import axios from "../../shared/axios"
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";

const initialValues = {};
  

class Table extends Component {

    state = {
        doc_list1: [
            // {
            //   "id": "1",
            //     "product": "GarageNetwork",
            //     "image" : "Miscellaneous-car.svg"
            //   } ,
              {
                "id": "2",
                "product": "HospitalNetwork",
                "image" : "Miscellaneous-car.svg"
              } ,
              {
                "id": "3",
                "product": "ChangePolicyDetails",
                "image" : "Miscellaneous-car.svg"
              }          
          ],
          doc_list2: [
            {
              "id": "1",
                "product": "GarageNetwork",
                "image" : "Miscellaneous-car.svg"
              } ,
              {
                "id": "2",
                "product": "HospitalNetwork",
                "image" : "Miscellaneous-car.svg"
              } ,
              {
                "id": "3",
                "product": "ChangePolicyDetails",
                "image" : "Miscellaneous-car.svg"
              }          
          ]
      };

    dload_doc = (productId) => {
        let filePath = `${process.env.REACT_APP_PAYMENT_URL}/core/public/pdf_files/`
        let fileName = ""
        if(productId == '1'){          
            window.open('https://www.sbigeneral.in/portal/contact-us/garage')
        }
        else if(productId == '2') {
            window.open('https://www.sbigeneral.in/portal/contact-us/hospital')
        }
        else if(productId == '3') {
            window.open('https://www.sbigeneral.in/portal/buy-online/changepolicydetails')
        }
    }   

    downloadDoc = (filePath,fileName) => {
        var anchor = document.createElement('a');
        anchor.href = filePath+fileName;
        anchor.target = '_blank';
        // anchor.download = filePath;;
        anchor.click();
      }

    getPolicyList = () => {
        
            localStorage.removeItem('policyHolder_id');
            localStorage.removeItem('policyHolder_refNo');
            localStorage.removeItem('display_gender');
            sessionStorage.removeItem('pan_data');
            sessionStorage.removeItem('email_data');
            sessionStorage.removeItem('proposed_insured');
            sessionStorage.removeItem('display_looking_for');
            sessionStorage.removeItem('display_dob');
            localStorage.removeItem('newBrandEdit');
            localStorage.removeItem('brandEdit');
            localStorage.removeItem('registration_number');
            localStorage.removeItem('policy_type');
            localStorage.removeItem('check_registration');
        
    }

    componentDidMount() {
        this.getPolicyList()
    }


    render() {
        const { doc_list1,doc_list2 } = this.state;
        let user_data=JSON.parse(sessionStorage.getItem("user_data"));
        
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        return (
            <Row>
                <Col sm={12}>
                    <div className="tablecontent">
                    {doc_list1.length > 0 ?
                        user_data.user_type == 'Micro' ?
                        <table>
                        <tbody>                                
                            {doc_list1.map((doc, docIndex) => ( 
                                <tr key={docIndex}>
                                    {/* <td className="W-10"><img src={require(`../../assets/images/${doc.image}`)} alt="" /></td> */}
                                    <td className="W-70">{phrases[doc.product]}</td>
                                    <td className="W-10 text-right"> <button className="buy" onClick= {this.dload_doc.bind(this, doc.id )} >{phrases['Go']}</button></td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                        :
                        <table>
                        <tbody>                                
                            {doc_list2.map((doc, docIndex) => ( 
                                <tr key={docIndex}>
                                    {/* <td className="W-10"><img src={require(`../../assets/images/${doc.image}`)} alt="" /></td> */}
                                    <td className="W-70">{phrases[doc.product]}</td>
                                    <td className="W-10 text-right"> <button className="buy" onClick= {this.dload_doc.bind(this, doc.id )} >{phrases['Go']}</button></td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                        : null}
                    </div>
                    </Col>
                  </Row>  
        ) 
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


export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Table));