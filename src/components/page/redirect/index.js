import React, {Component} from 'react';
import {Button} from 'antd';
import './style.less';
import URLSearchParams from 'url-search-params';


class OtherRedirect extends Component {

  constructor(props) {
    super(props);

    this.state = {
      uri: '',
      title: '',
      summary: '',
      time: 3,
    }
  }

  componentWillMount() {

    // let data = urlDecode(this.)
    const params = new URLSearchParams(this.props.location.search);

    let obj = this.state;

    obj.uri = params.get('uri');
    obj.title = params.get('title');

    let self = this;

    function toRedirect() {

      self.state.summary = self.state.time + ' 秒之后进行跳转 ...';

      if (self.state.time === 0) {

        let obj = self.state;

        obj.summary = '正在进行跳转 ...';

        self.setState(obj, () => {
          self.toJump();
        });

        return false

      } else {

        let obj = self.state;

        obj.time--;

        self.setState(obj, () => {
          setTimeout(toRedirect, 1000)
        });
      }
    }

    toRedirect()
  }

  toClick = () => {
    this.toJump();
  };

  toJump = () => {
    window.location.href = this.state.uri;
  };

  render() {

    return (
      <div>
        <div className="redirect">
          <div className="redirect-body-con">
            <div className="redirect-body-con-title">{this.state.title}</div>
            <p className="redirect-body-con-message">{this.state.summary}</p>
            <div className="redirect-btn-con">
              <Button className="redirect-btn-web" href="/" htmlType="button">返回官网
              </Button>
              <Button className="redirect-btn-click" htmlType="button" onClick={this.toClick} type="primary">
                立即跳转
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OtherRedirect;