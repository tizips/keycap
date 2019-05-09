import React, {Component} from 'react';
import {Button, Checkbox, Divider, Form, Input, Modal, Table, Tooltip, Row, Col} from "antd";
import store from "../../../../store";
import './style.less';

const {TextArea} = Input;

class AppRole extends Component {

    constructor(props) {
        super(props);

        this.state = {
            basic: {
                width: 0,
                height: 0,
                form: {
                    show: false,
                    type: 'create',
                    id: 0,
                },
                role: {
                    type: '',
                    right: [],
                }
            },
            data: {
                table: [],
            },
            form: {
                name: '',
                summary: '',
                right: [],
            },
            other: {
                role: [],
                check: {
                    admin: [],
                    type: [],
                    cap: [],
                    role: [],
                    area: [],
                },
                indeterminate: true
            }
        };
    };

    componentWillMount() {
        this.toGet();
    };

    toGet() {

        let self = this;

        window.$http.get('/v1/administer/role')
            .then(function (response) {

                if (!response || response.data.status !== 0 || response.data.result === null) {
                    return false;
                }

                let data = [];
                let i = 1;

                response.data.result.filter(function (value) {

                    let item = {};
                    item.key = i;
                    item.rid = value.rid;
                    item.name = value.name;
                    item.summary = value.summary;
                    item.time_create = value.time_create;
                    item.time_update = value.time_update;

                    switch (item.editor) {
                        case 'N':
                            item.toEditor = {
                                color: 'red',
                                blade: '否',
                            };
                            break;
                        case 'Y':
                            item.toEditor = {
                                color: 'green',
                                blade: '是',
                            };
                            break;
                        default:
                            item.toEditor = {
                                color: '',
                                blade: '未知',
                            };
                            break;
                    }

                    item.toTimeCreate = window.$moment(item.time_create * 1000).format("MM/DD hh:mm");
                    item.toTimeUpdate = window.$moment(item.time_update * 1000).format("MM/DD hh:mm");

                    data.push(item);

                    i++;

                    return value;
                });

                let obj = self.state;

                obj.data.table = data;

                self.setState(obj);
            })
    };

    toOpenCreate = () => {

        this.toClearForm();

        let obj = this.state;

        obj.basic.form.show = true;

        this.setState(obj);
    };

    toClearForm() {

        let obj = this.state;

        obj.form.name = '';
        obj.form.summary = '';
        obj.form.right = [];


        obj.other.check['admin'] = [];
        obj.other.check['cap'] = [];
        obj.other.check['type'] = [];
        obj.other.check['role'] = [];
        obj.other.check['area'] = [];

        this.setState(obj);
    };

    toOpenUpdate = (record) => {

        let self = this;
        let obj = this.state;

        obj.basic.form.show = true;
        obj.basic.form.type = 'update';
        obj.basic.form.id = record.rid;

        obj.form.name = record.name;
        obj.form.summary = record.summary;


        window.$http.get('/v1/administer/role/find/' + record.rid)
            .then(function (response) {
                if (!response || response.data.status !== 0) {
                    return false;
                }
                obj.other.check['admin'] = response.data.result.admin;
                obj.other.check['cap'] = response.data.result.cap;
                obj.other.check['type'] = response.data.result.type;
                obj.other.check['role'] = response.data.result.role;
                obj.other.check['area'] = response.data.result.area;
                self.setState(obj);
            });
    };

    toCloseForm = () => {

        let obj = this.state;

        obj.basic.form.show = false;

        this.setState(obj);
    };

    toSubmit = (e) => {
        e.preventDefault();

        let self = this;

        this.props.form.validateFieldsAndScroll((err, values) => {

            if (!err) {
                let obj = this.state;

                obj.form.name = values.name;
                obj.form.summary = values.summary;

                let right = [];

                for (let i in self.state.other.check) {
                    if (self.state.other.check[i] === null) continue;
                    self.state.other.check[i].map((value) => {
                        right.push(value);

                        return value;
                    });
                }

                obj.form.right = right;

                if (obj.form.right.length === 0) {
                    window.$message.error("角色权限不能为空");
                    return;
                }

                this.setState(obj, () => {
                    if (obj.basic.form.type === "update") {
                        this.toUpdate();
                    } else {
                        this.toCreate();
                    }
                })
            }
        });
    };

    toCreate() {

        let self = this;
        window.$http.post('/v1/administer/role', self.state.form)
            .then(function (response) {
                if (!response || response.data.status !== 0) {
                    return false;
                }

                window.$message.success("权限组信息添加成功");

                let obj = self.state;

                obj.basic.form.show = false;

                self.setState(obj);
                self.toGet();
            })
    };

    toUpdate() {
        let self = this;
        console.log("test")
        window.$http.put('/v1/administer/role/' + self.state.basic.form.id, self.state.form)
            .then(function (response) {
                if (!response || response.data.status !== 0) {
                    return false;
                }

                window.$message.success("权限组信息修改成功");

                let obj = self.state;

                obj.basic.form.show = false;

                self.setState(obj);
                self.toGet();
            })
    };

    toDelete = (record) => {

        let self = this;

        window.$confirm({
            centered: true,
            title: '确定要删除该权限组 ?',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                window.$http.delete("/v1/administer/role/" + record.rid)
                    .then(function (response) {
                        if (!response || response.data.status !== 0) {
                            return false;
                        }
                        window.$message.success("权限组信息删除成功");
                        self.toGet();
                    })
            },
        });
    };

    toRenderEditor = (record) => {
        // console.log(record)

        if (record.rid === 666) {
            return
        }

        return (
            <div>
                <Tooltip placement="topLeft" title="编辑">
                    {/*<Link to={"/app/child/edit?id=" + record.id} query={{id: record.id}}>*/}
                    <Button htmlType="button" onClick={this.toOpenUpdate.bind(this, record)} shape="circle"
                            icon="highlight"/>
                    {/*</Link>*/}
                </Tooltip>
                <Tooltip placement="topLeft" title="删除">
                    <Button type="danger" shape="circle" icon="delete" onClick={this.toDelete.bind(this, record)}/>
                </Tooltip>
            </div>
        )
    };

    toOperateRight = () => {

        let other = [];
        let i = 0;

        if (this.state.basic.role.right.admin != null) {

            let content = {
                key: i,
                label: '管理员',
                name: 'admin',
                right: [],
            };

            this.state.basic.role.right.admin.filter(function (item) {
                let cont = {
                    label: '',
                    value: '',
                };
                if (item === 'admin.watch') {
                    cont.label = '查看';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'admin.create') {
                    cont.label = '添加';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'admin.delete') {
                    cont.label = '删除';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'admin.update') {
                    cont.label = '修改';
                    cont.value = item;
                    content.right.push(cont);
                }
                return item
            });

            other['admin'] = content;

            other.push(content);
        }

        if (this.state.basic.role.right.type != null) {

            let content = {
                key: i,
                label: '类型',
                name: 'type',
                right: [],
            };

            this.state.basic.role.right.type.filter(function (item) {
                let cont = {
                    label: '',
                    value: '',
                };
                if (item === 'type.watch') {
                    cont.label = '查看';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'type.create') {
                    cont.label = '添加';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'type.delete') {
                    cont.label = '删除';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'type.update') {
                    cont.label = '修改';
                    cont.value = item;
                    content.right.push(cont);
                }
                return item
            });

            other['type'] = content;

            other.push(content);
        }

        if (this.state.basic.role.right.cap != null) {

            let content = {
                key: i,
                label: '键帽',
                name: 'cap',
                right: [],
            };

            this.state.basic.role.right.cap.filter(function (item) {
                let cont = {
                    label: '',
                    value: '',
                };
                if (item === 'cap.watch') {
                    cont.label = '查看';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'cap.create') {
                    cont.label = '添加';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'cap.delete') {
                    cont.label = '删除';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'cap.update') {
                    cont.label = '修改';
                    cont.value = item;
                    content.right.push(cont);
                }
                return item
            });

            other['cap'] = content;

            other.push(content);
        }

        if (this.state.basic.role.right.role != null) {

            let content = {
                key: i,
                label: '权限组',
                name: 'role',
                right: [],
            };

            this.state.basic.role.right.role.filter(function (item) {
                let cont = {
                    label: '',
                    value: '',
                };
                if (item === 'role.watch') {
                    cont.label = '查看';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'role.create') {
                    cont.label = '添加';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'role.delete') {
                    cont.label = '删除';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'role.update') {
                    cont.label = '修改';
                    cont.value = item;
                    content.right.push(cont);
                }
                return item
            });

            other['role'] = content;

            other.push(content);
        }

        if (this.state.basic.role.right.area != null) {

            let content = {
                key: i,
                label: '分区',
                name: 'area',
                right: [],
            };

            this.state.basic.role.right.area.filter(function (item) {
                let cont = {
                    label: '',
                    value: '',
                };
                if (item === 'area.watch') {
                    cont.label = '查看';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'area.create') {
                    cont.label = '添加';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'area.delete') {
                    cont.label = '删除';
                    cont.value = item;
                    content.right.push(cont);
                } else if (item === 'area.update') {
                    cont.label = '修改';
                    cont.value = item;
                    content.right.push(cont);
                }
                return item
            });

            other['area'] = content;

            other.push(content);
        }

        let obj = this.state;
        obj.other.role = other;
        this.setState(obj);
    };

    toChangeCheckRight = (value, name) => {
        if (this.state.basic.role.right[name] != null) {
            let obj = this.state;
            obj.other.check[name] = value;
            this.setState(obj);
        }
    };

    toChangeCheckAll = (ev) => {
        let obj = this.state;
        obj.other.indeterminate = false;

        if (ev.target.checked) {
            // 全选权限
            this.state.other.role.map((item) => {
                let right = [];

                item.right.map((value) => {
                    right.push(value.value);
                    return value;
                });

                obj.other.check[item.name] = right;

                return item;
            });

        } else {
            // 取消全选权限
            this.state.other.role.map((item) => {

                obj.other.check[item.name] = [];
                return item;
            });
        }

        this.setState(obj);
    };

    render() {

        const {getFieldDecorator} = this.props.form;

        const columns = [
            {
                title: '#',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
            }, {
                title: '简介',
                dataIndex: 'summary',
                key: 'summary',
            }, {
                title: '上次更新时间',
                key: 'toTimeCreate',
                dataIndex: 'toTimeCreate',
            }, {
                title: '添加时间',
                key: 'toTimeUpdate',
                dataIndex: 'toTimeUpdate',
            }, {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <div>
                        {this.toRenderEditor(record)}
                    </div>
                ),
            }
        ];

        store.subscribe(() => {

            let obj = this.state;

            if (obj.basic.height !== store.getState().system.height) {

                obj.basic.height = store.getState().system.height;

                this.setState(obj);
            }

            if (obj.basic.role !== store.getState().user.role) {

                obj.basic.role = store.getState().user.role;

                this.setState(obj, () => {
                    this.toOperateRight()
                });
            }
        });

        return (
            <div>
                <Table columns={columns} dataSource={this.state.data.table}
                       style={{height: this.state.basic.height - 180 + 'px'}}
                       className="table-content"
                       pagination={false}/>
                <div className="table-bottom">
                    <div className="table-bottom-left">
                        <Tooltip placement="top" title="添加">
                            <Button htmlType='button' type="primary" icon="edit"
                                    onClick={this.toOpenCreate.bind(this)}/>
                        </Tooltip>
                    </div>
                </div>

                <Modal
                    title="权限组编辑"
                    centered
                    closable={false}
                    width={800}
                    visible={this.state.basic.form.show}
                    maskClosable={false}
                    onOk={this.toSubmit}
                    onCancel={this.toCloseForm}
                >
                    <Form onSubmit={this.toSubmit}>
                        <Row>
                            <Col span={10}>
                                <Form.Item {...window.$layout}
                                           label="名称"
                                >
                                    {getFieldDecorator('name', {
                                        initialValue: this.state.form.name,
                                        rules: [{
                                            required: true, message: '权限组名称不能为空',
                                        }, {
                                            max: 20, message: '权限组名称最多 20 个字'
                                        }],
                                    })(
                                        <Input autoComplete="off"/>
                                    )}
                                </Form.Item>
                                <Form.Item {...window.$layout}
                                           label="简介"
                                >
                                    {getFieldDecorator('summary', {
                                        initialValue: this.state.form.summary,
                                        rules: [{
                                            max: 240, message: '权限组简介最多 240 个字',
                                        }],
                                    })(
                                        <TextArea rows={3}/>
                                    )}
                                </Form.Item>
                                <Form.Item {...window.$layout}
                                           label="我的"
                                >
                                    {getFieldDecorator('roleType', {
                                        initialValue: this.state.basic.role.type,
                                    })(
                                        <Input autoComplete="off" disabled/>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={1}><Divider className="role-divider" type="vertical"/></Col>
                            <Col span={13} className="col-role-editor">
                                <Form.Item {...window.$layout} label="Check All"
                                >
                                    <Checkbox name="all" value={true} indeterminate={this.state.other.indeterminate}
                                              onChange={this.toChangeCheckAll}/>
                                </Form.Item>
                                {
                                    this.state.other.role.map((item) => {
                                        return (
                                            <Form.Item key={item.name} {...window.$layout} label={item.label}>
                                                {getFieldDecorator(item.name, {
                                                    initialValue: this.state.other.check[item.name],
                                                })(
                                                    <Checkbox.Group
                                                        onChange={(value) => this.toChangeCheckRight(value, item.name)}>
                                                        {
                                                            item.right.map((value) => {
                                                                return (
                                                                    <Checkbox key={value.value}
                                                                              value={value.value}
                                                                              checked={true}>{value.label}</Checkbox>
                                                                )
                                                            })
                                                        }
                                                    </Checkbox.Group>
                                                )}
                                            </Form.Item>
                                        )
                                    })
                                }
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        )
    }
}

AppRole = Form.create()(AppRole);

export default AppRole;