import React from 'react';
import JParticles from 'jparticles';
import {Card, Form, Icon, Input, Button} from 'antd';
import './style.less'

const FormItem = Form.Item;

class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            form: {
                name: '',
                password: '',
            }
        }
    }

    componentDidMount() {
        new JParticles.particle('#effect', {
            range: 400,
            proximity: 150,
            // num: 0.24,
            parallaxStrength: 1,
            parallaxLayer: [1, 3, 5, 7],
            // 开启视差效果
            parallax: true
        });

        let token = window.$cookie.get('Authorization');

        if (token !== '') {
            window.location.href = '/';
        }
    }

    toSubmit = (e) => {

        e.preventDefault();

        let self = this;

        this.props.form.validateFields((err, values) => {
            if (!err) {
                let obj = self.state;

                obj.form.name = values.name;
                obj.form.password = values.password;

                self.setState(obj, () => {
                    self.toLogin();
                })
            }
        });
    };

    toLogin() {

        let self = this;

        window.$http.post('/v1/login', self.state.form)
            .then(function (response) {
                if (!response || response.data.status !== 0) {
                    return false;
                }

                window.$message.success("登录成功，即将跳转 ...");

                window.$cookie.set('Authorization', response.data.result);

                setTimeout(function () {
                    window.location.href = '/dashboard';
                }, 2000);
            })
    }

    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <div className="login">
                <div id="effect"/>
                <Card bordered={false} className="login-content">
                    <Form onSubmit={this.toSubmit} className="login-form">
                        <FormItem>
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true, message: '请输入您的登录用户名!',
                                }, {
                                    min: 6, message: "请输入 6~20 位登录用户名"
                                }, {
                                    max: 20, message: "请输入 6~20 位登录用户名"
                                }],
                            })(
                                <Input onPressEnter={this.toSubmit}
                                       prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                       autoComplete="off" placeholder="Username"/>
                            )}
                        </FormItem>
                        <FormItem className="clear-margin-bottom">
                            {getFieldDecorator('password', {
                                rules: [{required: true, message: '请输入您的登录密码 !'},
                                    {
                                        min: 6, message: "请输入 6~20 位登录密码"
                                    }, {
                                        max: 20, message: "请输入 6~20 位登录密码"
                                    }],
                            })(
                                <Input onPressEnter={this.toSubmit}
                                       prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                       type="password"
                                       placeholder="Password"/>
                            )}
                        </FormItem>
                        <FormItem className="clear-margin-bottom">
                            <Button className="alight-right forgot-password-button">Forgot password</Button>
                        </FormItem>
                        <FormItem>
                            <Button type="primary" htmlType="submit" block className="login-form-button">
                                登录
                            </Button>
                        </FormItem>
                    </Form>
                </Card>
            </div>
        );
    }
}

Login = Form.create()(Login);

export default Login;