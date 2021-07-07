<<<<<<< HEAD
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


class Health extends Component {


    buy_policy = (productId) => {
        this.props.loadingStart()
        localStorage.removeItem('policy_holder_ref_no')

        if (productId == '5')
            this.props.history.push(`/Health/${productId}`);
        if (productId == '10')
            this.props.history.push(`/Health_KSB/${productId}`);
        if (productId == '12')
            this.props.history.push(`/arogya_Health/${productId}`);
        if (productId == '20')
            this.props.history.push(`/Health_Micro/${productId}`);
        if (productId == '21')
            this.props.history.push(`/Health_Group/${productId}`);
        if (productId == '22')
            this.props.history.push(`/Health_KSB_Micro/${productId}`);
        if (productId == '23')
            this.props.history.push(`/Health_KSB_Micro_Group/${productId}`);
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
                                {(this.props.tabId == '2') ?
                                    (<tbody>
                                        {product_list.map((part, partIndex) => (
                                            <tr key={partIndex}>
                                                <td className="W-10"><img src={require(`../../assets/images/${part.logo}`)} alt="" /></td>
                                                <td className="W-70">{part.name}</td>
                                                <td className="W-10 text-right"> <button className="buy" onClick={this.buy_policy.bind(this, part.id)} >{phrases['Buy']}</button></td>
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


=======
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


class Health extends Component {


    buy_policy = (productId) => {
        this.props.loadingStart()
        localStorage.removeItem('policy_holder_ref_no')

        if (productId == '5')
            this.props.history.push(`/Health/${productId}`);
        if (productId == '10')
            this.props.history.push(`/Health_KSB/${productId}`);
        if (productId == '12')
            this.props.history.push(`/arogya_Health/${productId}`);
        if (productId == '20')
            this.props.history.push(`/Health_Micro/${productId}`);
        if (productId == '21')
            this.props.history.push(`/Health_Group/${productId}`);
        if (productId == '22')
            this.props.history.push(`/Health_KSB_Micro/${productId}`);
        if (productId == '23')
            this.props.history.push(`/Health_KSB_Micro_Group/${productId}`);
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
                                {(this.props.tabId == '2') ?
                                    (<tbody>
                                        {product_list.map((part, partIndex) => (
                                            <tr key={partIndex}>
                                                <td className="W-10"><img src={require(`../../assets/images/${part.logo}`)} alt="" /></td>
                                                <td className="W-70">{part.name}</td>
                                                <td className="W-10 text-right"> <button className="buy" onClick={this.buy_policy.bind(this, part.id)} >{phrases['Buy']}</button></td>
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


>>>>>>> 0e31e53c369eea5c7cf1dbfeb51d7be55d71d1f3
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Health));