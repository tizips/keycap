import React, {Component} from 'react';
import Routes from '../../../router';
import {Layout, Badge, Menu, Icon, Spin, Tooltip} from 'antd';
import SiderMenu from '../SiderMenu/index';

import store, {UpdateSystemWidth, UpdateSystemHeight, UpdateUserInfo, UpdateLoadingHttp} from '../../../store/index';
import '../Index/style.less';
import './index.less';
import 'braft-editor/dist/index.css';

const {Header, Sider, Content} = Layout;
const SubMenu = Menu.SubMenu;

class Admin extends Component {

  state = {
    collapsed: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      user: {
        thumb: 'https://yezihaohao.github.io/css/images/avatar.jpg',
        name: ''
      },
      openKey: '/app',
      firstHide: false,
      size: {
        width: 0,
        height: 0,
      },
      loading: {
        http: false,
        title: '',
      },
      menus: [],
      role: {
        type: '',
        right: [],
      },
      merchant: {
        name: '',
        type: '',
      }
    };
  };

  componentDidMount() {

    this.toGetClientWidth();
    this.toGetClientHeight();

    window.onresize = () => {
      this.toGetClientWidth();
      this.toGetClientHeight();
    };

    const state = Admin.toSetMenuOpen(this.props);
    this.setState(state);

    // this.toFindAdmin();

    this.toOperateMenus();
  };

  static toSetMenuOpen = props => {
    const {pathname} = props.location;
    return {
      openKey: pathname.substr(0, pathname.lastIndexOf('/')),
      selectedKey: pathname
    };
  };

  tpOpenMenu = v => {
    this.setState({
      openKey: v[v.length - 1],
      firstHide: false,
    })
  };

  toClickSider = e => {
    this.setState({
      selectedKey: e.key
    });
    const {popoverHide} = this.props; // 响应式布局控制小屏幕点击菜单时隐藏菜单操作
    popoverHide && popoverHide();
  };

  toGetClientWidth = () => {

    let clientWidth = window.innerWidth;

    let obj = this.state;

    if (clientWidth < 1300) {
      clientWidth = 1300;

      obj.collapsed = true;
    } else {
      obj.collapsed = false;
    }

    obj.size.width = clientWidth;

    this.setState(obj);

    store.dispatch(UpdateSystemWidth(clientWidth))
  };

  toGetClientHeight = () => { // 获取当前浏览器宽度并设置responsive管理响应式

    let clientHeight = window.innerHeight;

    if (clientHeight < 768) {
      clientHeight = 768
    }

    let obj = this.state;
    obj.size.height = clientHeight;

    this.setState(obj);

    store.dispatch(UpdateSystemHeight(clientHeight))
  };

  toToggle = () => {
    let obj = this.state;

    obj.collapsed = !obj.collapsed;

    this.setState(obj);

  };

  toClickMenu = e => {
    if (e.key === 'merchant') {
      this.toChangMerchant();
    }
  };

  toFindAdmin() {

    if (this.state.user.name !== '') {
      return;
    }

    let self = this;

    window.$http.get('/v1/admins/admin/info')
      .then(function (response) {

        if (!response || response.data.status !== 0) {
          return false;
        }

        let obj = self.state;

        obj.user.name = response.data.result.basic.name;
        obj.user.thumb = response.data.result.basic.thumb;
        obj.role.type = response.data.result.role.type;
        obj.role.right = response.data.result.role.right;
        obj.merchant.name = response.data.result.merchant.name;
        obj.merchant.type = response.data.result.merchant.type;

        self.setState(obj);
        self.toOperateMenus();

        store.dispatch(UpdateUserInfo(response.data.result));
      })
  };

  toOperateMenus() {

    let obj = this.state;

    let menus = [];

    let dashboard = {
      title: '仪盘数据',
      key: '/dashboard',
      icon: 'compass',
    };

    menus.push(dashboard);
    menus.push({
      title: '键帽管理',
      key: '/keycap',
      icon: 'compass',
    });

    obj.menus = menus;

    this.setState(obj);
  };

  toChangMerchant = () => {

    window.$cookie.remove('id');
    window.location.href = '/app/dashboard';
    //
    // this.toFindAdmin();
    //
    // let path = {
    //   pathname: '/app/dashboard',
    // };
    //
    // this.props.history.push(path)
  };

  toLogout = () => {
    console.log("用户退出登录")
  };

  render() {

    const {auth} = this.props;

    store.subscribe(() => {

      let obj = this.state;

      if (obj.loading.http === store.getState().loading.http) {
        return;
      }

      obj.loading.http = store.getState().loading.http;
      this.setState(obj);
    });

    return (
      <Spin className="loading-http" spinning={this.state.loading.http} size="large" tip={this.state.loading.title}>
        <Layout className='admin-layout'
                style={{
                  height: this.state.size.height + 'px',
                  width: this.state.size.width + 'px'
                }}>
          <Sider
            trigger={null}
            collapsible
            collapsed={this.state.collapsed}
            className='admin-sider'
          >
            <div className="logo"/>
            <SiderMenu
              menus={this.state.menus}
              onClick={this.toClickSider}
              mode="inline"
              theme="dark"
              selectedKeys={[this.state.selectedKey]}
              openKeys={this.state.firstHide ? null : [this.state.openKey]}
              onOpenChange={this.tpOpenMenu}
            />
          </Sider>
          <Layout>
            <Header className='admin-header'>
              <Icon
                className="admin-header-trigger"
                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toToggle}
              />
              <Menu
                className='admin-header-right'
                mode="horizontal"
                onClick={this.toClickMenu}
              >
                <Menu.Item key="merchant">
                  <Tooltip title="切换总商户">
                    <Icon type="logout"/>
                  </Tooltip>
                </Menu.Item>
                <Menu.Item key="2">
                  <Badge count={5} overflowCount={9} style={{marginLeft: 10}}>
                    <Icon type="notification"/>
                  </Badge>
                </Menu.Item>
                <SubMenu
                  title={<span className="avatar"><img src={this.state.user.thumb} alt="头像"/><i
                    className="on bottom b-white"/></span>}>
                  <Menu.Item key="avatar:name" className="avatar-list">你好 - {this.state.user.name}</Menu.Item>
                  <Menu.Item key="avatar:info">个人信息</Menu.Item>
                  <Menu.Item key="logout"><span onClick={this.toLogout}>退出登录</span></Menu.Item>
                </SubMenu>
              </Menu>
            </Header>
            <Content style={{
              margin: '24px 16px', padding: 24, background: '#fff', height: this.state.size.height - 177 + 'px',
            }}
            >
              <Routes auth={auth}/>
            </Content>
          </Layout>
        </Layout>
      </Spin>
    );
  }
}

export default Admin;