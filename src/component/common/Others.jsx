import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import axios from "../../shared/axios"
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import Encryption from '../../shared/payload-encryption';
import swal from 'sweetalert';
import { authLogout } from "../../store/actions/auth";

const initialValues = {};
  

class Others extends Component {


    buy_policy = (productId) => {
			
    if(productId == '9'){
			localStorage.removeItem('policy_holder_ref_no')
			this.props.history.push(`/Registration_SME/${productId}`);
		}  
		
		if(productId == '19'){
			localStorage.removeItem('policy_holder_ref_no')  
			this.props.history.push(`/Registration_Sookshma/${productId}`);
            window.location.reload(true);
		}
	
	}


    componentDidMount() {

    }


    render() {
        const { product_list } = this.props;
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        return (
            <Row>
                <Col sm={12}>
                    <div className="tablecontent">
                    {product_list.length > 0 ?
                        <table>
                            {(this.props.tabId == '3') ?  
                                (<tbody>
                                    {product_list.map((part, partIndex) => ( 
                                    <tr key={partIndex}>
                                        <td className="W-10"><img src={require(`../../assets/images/sme_fire_uw.svg`)} alt="" /></td>
                                        <td className="W-70">{part.name}</td>
                                        <td className="W-10 text-right"> <button className="buy" onClick= {this.buy_policy.bind(this, part.id )} >{phrases['Buy']}</button></td>
                                        {/* {(part.product != 'Arogya Sanjeevani') ? (<td className="W-10 text-right"> <button className="renew">Renew</button></td>):null} */}
                                    </tr>
                                    ))
                                    }
                                </tbody>) : null
                            }
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
      loadingStop: () => dispatch(loaderStop()),
      logout: () => dispatch(authLogout())
    };
  };


export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Others));