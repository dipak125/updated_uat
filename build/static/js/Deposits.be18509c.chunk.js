(this["webpackJsonpmy-app"]=this["webpackJsonpmy-app"]||[]).push([[5],{1192:function(e,a,t){"use strict";t.r(a);var n=t(15),l=t(16),r=t(18),m=t(17),s=t(0),c=t.n(s),o=t(31),i=t(905),u=t(906),d=t(915),E=t(376),p=t(13),g=t.n(p),N=t(34),b=t(40),v=t(7),_=t(19),f=t(26),h=t(10),S=t(49),y=t.n(S),A=t(2),C=t(36),w=t.n(C),D=function(e){Object(r.a)(t,e);var a=Object(m.a)(t);function t(e){var l;return Object(n.a)(this,t),(l=a.call(this,e)).fetchBalanceAmount=function(){var e=new FormData,a=sessionStorage.getItem("users")?JSON.parse(sessionStorage.getItem("users")):"";if(a){var t=new h.a,n=(a=JSON.parse(t.decrypt(a.user))).master_user_id?a.master_user_id:null;e.append("user_id",n),v.a.post("acd/acd-balance",e).then((function(e){new h.a;var a=e.data;1==a.error?g()("Unable to fetch amount",{icon:"error"}):l.setState({balanceAmount:a.data.balanceAmount}),l.props.loadingStop()})).catch((function(e){console.log(e),console.log("User Id","acd/acd-balance/".concat(n)),l.props.loadingStop()}))}},l.actionFormatter=function(e){""==e||void 0==e?l.setState({showError:!0}):window.open("".concat("https://uatcld.sbigeneral.in/sbig-bc","/razorpay/acd_pay.php?account_number=").concat(l.state.agentData.account_number,"&amount=").concat(e),"_self")},l.removeErrorMsg=function(){l.setState({showError:!1})},l.handleSubmit=function(){var e=new FormData,a=sessionStorage.getItem("users")?JSON.parse(sessionStorage.getItem("users")):"";if(a){var t=new h.a,n=(a=JSON.parse(t.decrypt(a.user))).master_user_id?a.master_user_id:null;console.log("User Id",n),e.append("user_id",n),v.a.post("acd/acd-create",e).then((function(e){if(console.log("RESPONSE ACD=>",e),0==e.data.error){var a=e.data.data.accountNumber;console.log("account_number",a),l.setState({account_number:a}),l.fetchACD(),g()(e.data.msg,{icon:"success"})}else g()(e.data.msg,{icon:"error"});l.props.loadingStop()})).catch((function(e){console.log(e),l.props.loadingStop()}))}},l.fetchACD=function(){var e=new FormData,a=sessionStorage.getItem("users")?JSON.parse(sessionStorage.getItem("users")):"";if(a){var t=new h.a,n=(a=JSON.parse(t.decrypt(a.user))).master_user_id?a.master_user_id:null;e.append("user_id",n),v.a.post("acd/acd-agent",e).then((function(e){0==e.error||l.setState({agentData:e.data.data}),l.props.loadingStop()})).catch((function(e){console.log(e),l.props.loadingStop()}))}},l.paymentmesg=function(){var e=w.a.parse(l.props.location.search).status;"pay_cancel"==e||"pay_fail"==e?(g()("Something went wrong.",{icon:"error"}),l.props.history.push("/AgentCashDeposit/")):"pay_success"==e&&(g()("Successfully cash deposited.",{icon:"success"}),l.props.history.push("/AgentCashDeposit/"))},l.state={agentData:[],toggleACD:!0,account_number:"",balanceAmount:"",showError:!1},l}return Object(l.a)(t,[{key:"componentDidUpdate",value:function(){}},{key:"componentDidMount",value:function(){this.fetchACD(),this.paymentmesg()}},{key:"render",value:function(){var e=this,a=this.state,t=a.agentData,n=a.toggleACD,l=a.account_number,r=a.balanceAmount,m=a.showError;console.log("tettetette",t);var s={agreement_code:t.agreement_code,intermediary_code:t.intermediary_code,user_name:t.intermediary_name,credit_date:t.credit_date},p=localStorage.getItem("phrases")?JSON.parse(localStorage.getItem("phrases")):null;return c.a.createElement(o.a,null,c.a.createElement("div",{className:"page-wrapper"},c.a.createElement("div",{className:"container-fluid"},c.a.createElement("div",{className:"row"},c.a.createElement("aside",{className:"left-sidebar"},c.a.createElement("div",{className:"scroll-sidebar ps-container ps-theme-default ps-active-y"},c.a.createElement(N.a,null))),c.a.createElement("div",{className:"col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox"},c.a.createElement("h4",{className:"text-center mt-3 mb-3"},p.SBIGICL),c.a.createElement("div",{className:"contBox m-b-45 tickedTable"},c.a.createElement("h4",{className:"text-center mt-3 mb-3"},"Agent Cash Deposit"),c.a.createElement(A.e,{initialValues:s,onSubmit:this.handleSubmit,enableReinitialize:!0},(function(a){var s=a.values;a.errors,a.setFieldValue,a.setFieldTouched,a.touched;return c.a.createElement(A.d,null,c.a.createElement("div",{className:"rghtsideTrigr collinput W-90 m-b-30 collaps_area"},c.a.createElement(y.a,{openedClassName:"custom_ovberflow",trigger:"Create ACD",open:n},c.a.createElement("div",{className:"listrghtsideTrigr"},c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:12,lg:10},c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement("span",{className:"fs-16"},"Agent Code")))),c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement(A.b,{name:"intermediary_code",type:"text",className:"premiumslid",value:s.intermediary_code,disabled:!0})))),c.a.createElement(u.a,{sm:12,md:3,lg:2},"\xa0")),c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement("span",{className:"fs-16"},"Agent Name")))),c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement(A.b,{name:"user_name",type:"text",className:"premiumslid",value:s.user_name,disabled:!0})))),c.a.createElement(u.a,{sm:12,md:3,lg:2},"\xa0")),c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement("span",{className:"fs-16"},"Agreement Code")))),c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement(A.b,{name:"agreement_code",type:"text",className:"premiumslid",value:s.agreement_code,disabled:!0})))),c.a.createElement(u.a,{sm:12,md:3,lg:2},"\xa0")),c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement("span",{className:"fs-16"},"Credit date")))),c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement(A.b,{name:"credit_date",type:"text",className:"premiumslid",value:s.credit_date,disabled:!0})))),c.a.createElement(u.a,{sm:12,md:3,lg:2},"\xa0")),c.a.createElement(i.a,null,"\xa0",c.a.createElement(u.a,{sm:12,md:6,lg:5},"\xa0"),""===t.account_number?c.a.createElement(u.a,{sm:12,md:4,lg:4},c.a.createElement(E.a,{className:"proceedBtn",type:"submit"},"Create ACD")):null))),c.a.createElement(i.a,null,c.a.createElement(u.a,null,"\xa0")))),c.a.createElement(y.a,{openedClassName:"custom_ovberflow",trigger:"Amount deposit in ACD account",open:!1},c.a.createElement("div",{className:"listrghtsideTrigr"},c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:12,lg:10},c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement("span",{className:"fs-16"},"ACD Account Number")))),c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement(A.b,{name:"acd_account_no",type:"text",className:"premiumslid",value:t.account_number?t.account_number:l,readOnly:!0})))),c.a.createElement(u.a,{sm:12,md:3,lg:2},"\xa0")),c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement("span",{className:"fs-16"},"Amount want to add")))),c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement(A.b,{name:"acd_amount",type:"text",className:"premiumslid",value:s.acd_amount,onKeyPress:e.removeErrorMsg}),m?c.a.createElement("span",{className:"errorMsg"},"Please enter amount"):null))),c.a.createElement(u.a,{sm:12,md:3,lg:2},"\xa0")),c.a.createElement(i.a,null,"\xa0",c.a.createElement(u.a,{sm:12,md:6,lg:5},"\xa0"),c.a.createElement(u.a,{sm:12,md:3,lg:2},c.a.createElement(E.a,{className:"proceedBtn",onClick:function(){e.actionFormatter(s.acd_amount)}},"Pay Now"))))),c.a.createElement(i.a,null,c.a.createElement(u.a,null,"\xa0")))),c.a.createElement(y.a,{openedClassName:"custom_ovberflow",trigger:"Balance Amount in ACD account",open:!1},c.a.createElement("div",{className:"listrghtsideTrigr"},c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:12,lg:10},c.a.createElement(i.a,null,c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement(d.a,null,c.a.createElement("div",{className:"insurerName"},c.a.createElement("span",{className:"fs-16"},"Amount")))),c.a.createElement(u.a,{sm:12,md:6,lg:4},c.a.createElement("span",null,r)),c.a.createElement(u.a,{sm:12,md:3,lg:2},"\xa0")),c.a.createElement(i.a,null,"\xa0",c.a.createElement(u.a,{sm:12,md:6,lg:5},"\xa0"),c.a.createElement(u.a,{sm:12,md:3,lg:4},c.a.createElement(E.a,{className:"proceedBtn",onClick:e.fetchBalanceAmount},"Balance Credit limit"))))),c.a.createElement(i.a,null,c.a.createElement(u.a,null,"\xa0"))))))})),c.a.createElement(i.a,null,"\xa0"))),c.a.createElement(b.a,null)))))}}]),t}(s.Component);a.default=Object(f.b)((function(e){return{loading:e.loader.loading}}),(function(e){return{loadingStart:function(){return e(Object(_.a)())},loadingStop:function(){return e(Object(_.b)())}}}))(D)}}]);