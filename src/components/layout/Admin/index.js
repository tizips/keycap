import React, {Component} from 'react';
import Routes from '../../../router';
import {Layout, Badge, Menu, Icon, Spin} from 'antd';
import SiderMenu from '../SiderMenu/index';

import store, {UpdateSystemWidth, UpdateSystemHeight, UpdateUserInfo} from '../../../store/index';
import '../Index/style.less';
import './index.less';
import 'braft-editor/dist/index.css';

const {Header, Sider, Content} = Layout;
const SubMenu = Menu.SubMenu;

class Admin extends Component {

    state = {
        collapsed: false,
    };

    constructor(prop) {
        super(prop);

        this.state = {
            collapsed: false,
            user: {
                thumb: 'https://yezihaohao.github.io/css/images/avatar.jpg',
                nickname: ''
            },
            openKey: '/',
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
                right: {
                    admin: null,
                    height: null,
                },
            },
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

        this.toFindAdmin();

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
        // if (e.key === 'merchant') {
        // }
    };

    toFindAdmin() {

        if (this.state.user.nickname !== '') {
            return;
        }

        let self = this;

        window.$http.get('/v1/administer/admin/info')
            .then(function (response) {

                if (!response || response.data.status !== 0) {
                    return false;
                }

                let obj = self.state;

                obj.user.name = response.data.result.name;
                obj.user.nickname = response.data.result.nickname;
                obj.user.thumb = window.$url + response.data.result.thumb;
                obj.role.type = response.data.result.role.type;
                obj.role.right = response.data.result.role.right;

                let user = {
                    basic: {
                        name: obj.user.name,
                        nickname: obj.user.nickname,
                        thumb: obj.user.thumb,
                    },
                    role: {
                        type: obj.role.type,
                        right: obj.role.right,
                    },
                };

                self.setState(obj);
                self.toOperateMenus();
                store.dispatch(UpdateUserInfo(user));
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
            icon: 'ordered-list',
        });

        if (this.state.role.right.type !== null) {

            menus.push({
                title: '键帽类型',
                key: '/type',
                icon: 'stock',
            });
        }

        if (this.state.role.right.area !== null) {

            menus.push({
                title: '键帽分区',
                key: '/area',
                icon: 'stock',
            });
        }

        if (this.state.role.right.admin !== null) {

            menus.push({
                title: '管理员',
                key: '/admin',
                icon: 'user',
            });
        }

        if (this.state.role.right.role !== null) {

            menus.push({
                title: '权限组',
                key: '/role',
                icon: 'tags',
            });
        }

        obj.menus = menus;

        this.setState(obj);
    };

    toLogout = () => {
        console.log("用户退出登录")
        window.$http.post('/v1/administer/admin/logout')
            .then(function (response) {
                if (!response || response.data.status !== 0) {
                    return false;
                }
                window.$cookie.set('Authorization', '');
                window.$message.success("用户退出成功");
                window.location.href = '/login';
            })
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
            <Spin className="loading-http" spinning={this.state.loading.http} size="large"
                  tip={this.state.loading.title}>
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
                                <Menu.Item key="2">
                                    <Badge count={5} overflowCount={9} style={{marginLeft: 10}}>
                                        <Icon type="notification"/>
                                    </Badge>
                                </Menu.Item>
                                <SubMenu
                                    title={<span className="avatar"><img src={this.state.user.thumb} alt="头像"/><i
                                        className="on bottom b-white"/></span>}>
                                    <Menu.Item key="avatar:name" className="avatar-list">你好
                                        - {this.state.user.nickname}</Menu.Item>
                                    <Menu.Item key="avatar:info">个人信息</Menu.Item>
                                    <Menu.Item key="logout"><span onClick={this.toLogout}>退出登录</span></Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Header>
                        <Content style={{
                            margin: '24px 16px',
                            padding: 24,
                            background: '#fff',
                            height: this.state.size.height - 177 + 'px',
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