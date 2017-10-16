import React, {Component} from 'react';

import {
  WebView,
  Linking
} from 'react-native';

export default class IAmPort extends Component {

  constructor(props) {

    super(props);
  }

  getRequestContent() {
    let params = this.props.params;
    const merchant_uid = params.merchant_uid || ('merchant_' + new Date().getTime());
    let HTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>i'mport react native payment module</title>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
      </head>
      <body>
        <script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js" ></script>
        <script type="text/javascript" src="https://service.iamport.kr/js/iamport.payment-1.1.5.js"></script>
        <script type="text/javascript">
          var IMP = window.IMP;
          IMP.init('${params.code}');

          IMP.request_pay({
            pg : '${params.pg}',
            pay_method : '${params.pay_method}',
            merchant_uid : '${merchant_uid}',
            m_redirect_url : '${params.app_scheme}://success', // '${params.m_redirect_url}',
            niceMobileV2 : '${params.niceMobileV2 || false}',
            app_scheme : '${params.app_scheme}',
            name : '${params.name}',
            amount : ${params.amount},
            buyer_email : '${params.buyer_email}',
            buyer_name : '${params.buyer_name}',
            buyer_tel : '${params.buyer_tel}',
            buyer_addr : '${params.buyer_addr}',
            buyer_postcode : '${params.buyer_postcode}',
            vbank_due : '${params.vbank_due}'
          }, function(rsp){
            // 모바일에서는 nice 및 기타 일부 PG의 결제 창이 다른페이로 이동되므로 콜백 함수가 안불러진다
            // 카카오페이의 경우 제공되는 결제창을 활용했을 때 서비스의 기본 페이지로부터 이동을 할 필요가 없어 콜백함수 불러짐
           if('${params.pg}' === 'nice'){
             return;
           }

           window.postMessage(JSON.stringify(rsp));
         });
        </script>
      </body>
    </html>
    `;
    return HTML;
  }

  getParameterByName(name, url) {

    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  _onMessage(e) {

    var res = JSON.parse(e.nativeEvent.data);
    var result = res.success ? "success" : "cancel";
    var request_id = res.request_id;
    var imp_uid = res.imp_uid;
    var merchant_uid = res.merchant_uid;
    // var error_msg = res.error_msg;

    console.log('onMessage', res );

    this.props.onPaymentResultReceive({result, imp_uid, merchant_uid });
  }

  _onShouldStartLoadWithRequest(e) {

    var url = e.url;
    var me = this;

    console.log("onShouldStartLoadWithRequest", e);

    var imp_uid = this.getParameterByName("imp_uid", url),
      merchant_uid = this.getParameterByName("merchant_uid", url),
      error_msg = this.getParameterByName("error_msg", url),
      result = "";
    const { app_scheme } = this.props.params;

    if (url.includes('imp_success=false') || error_msg) { // 취소 버튼을 눌렀거나 결제 실패시
      result = "failed";
    } else if (url.indexOf(app_scheme + '://success') === 0 || (url.includes('imp_uid') && url.includes('merchant_uid'))) {
      result = "success";
    } else if (url.indexOf(app_scheme + '://cancel') === 0) {
      result = "canceled";
    }

    if (result) {
      this.props.onPaymentResultReceive({result, imp_uid, merchant_uid });
    }

    return true;
  }

  injectPostMessageFetch() {

    const patchPostMessageFunction = function () {
      var originalPostMessage = window.postMessage;

      var patchedPostMessage = function (message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer);
      };

      patchedPostMessage.toString = function () {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
      };

      window.postMessage = patchedPostMessage;
    };

    return '(' + String(patchPostMessageFunction) + ')();';
  }

  render() {
    return (
      <WebView
        {...this.props}
        source={{ html: this.getRequestContent() }}
        startInLoadingState={true} injectedJavaScript={this.injectPostMessageFetch()} onMessage={this._onMessage.bind(this)} onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest.bind(this)}
        renderError={(e) => {
          return null;
        }}
        style={this.props.style} />
    );
  }
}

module.exports = IAmPort;
