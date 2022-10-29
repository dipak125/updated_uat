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



class Motor extends Component {


    buy_policy = (productId) => {
        this.props.loadingStart()
        if (productId == '2') {
            this.props.history.push(`/Registration/${productId}`);
        }
        else if (productId == '3') {
            this.props.history.push(`/two_wheeler_Select-brandTP/${productId}`)
            // document.getElementById('bootstrapForm').submit()
        }
        else if (productId == '4') {
            this.props.history.push(`/two_wheeler_Select-brand/${productId}`)
            // document.getElementById('bootstrapForm').submit()
        }
        else if (productId == '6') {
            this.props.history.push(`/four_wheeler_Select-brandTP/${productId}`)
        }
        else if (productId == '7') {
            this.props.history.push(`/Registration_GCV_TP/${productId}`)
        }
        else if (productId == '8') {
            this.props.history.push(`/Registration_GCV/${productId}`)
        }
        else if (productId == '11') {
            this.props.history.push(`/Registration_MISCD/${productId}`)
        }
        else if (productId == '15') {
            this.props.history.push(`/RegistrationOD/${productId}`);
        }
        else if (productId == '16') {
            this.props.history.push(`/two_wheeler_Select-brandOD/${productId}`)
        }
        else if (productId == '17') {
            this.props.history.push(`/Registration_GCVST/${productId}`)
        }
        else if (productId == '18') {
            this.props.history.push(`/Registration_MISCDST/${productId}`)
        }
        else if (productId == '1') {
            this.props.history.push(`/Registration_PCV/${productId}`)
        }
        else if (productId == '27') {
            this.props.history.push(`/Registration_PCV_TP/${productId}`)
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
                                {(this.props.tabId == '1') ?
                                    (<tbody>
                                        {product_list.map((part, partIndex) => (
                                            <tr key={partIndex}>
                                                <td className="W-10"><img src={require(`../../assets/images/${part.logo}`)} alt="" /></td>
                                                <td className="W-70">{part.name}</td>
                                                <td className="W-10 text-right"> <button className="buy" onClick={this.buy_policy.bind(this, part.id)}>{phrases['Buy']}</button></td>
                                                {/* <td className="W-10 text-right"> <button className="renew">Renew</button></td> */}
                                            </tr>
                                        ))
                                        }
                                    </tbody>) :
                                    null
                                }
                            </table>
                            : null}

                        <form action="https://secure.sbigeneral.in/SBIGTP/csc/display" target="_self" id="bootstrapForm" method="POST"> `
                            <input type="hidden" id="csc_id" name="csc_id" value={sessionStorage.getItem('csc_id')} />
                            <input type="hidden" id="agent_name" name="agent_name" value={sessionStorage.getItem('agent_name')} />
                        </form>
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


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Motor));