import React, {Component} from 'react';
import {Button, Card, Collapse, Form, Input, Row, Col, Select, Slider, Tabs, Icon, Upload} from 'antd';
import BraftEditor from 'braft-editor';
import './style.less';

const {Option} = Select;
const Panel = Collapse.Panel;
const {TextArea} = Input;
const TabPane = Tabs.TabPane;
const Dragger = Upload.Dragger;

class KeycapEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            basic: {
                find: true,
                type: 'create',
                id: '',
                button: '添加',
            },
            form: {
                name: '',
                pictures: [],
                types: [],
                areas: [],
                quarters: [],
                summary: '',
                price: '',
                cause: '',
                content: '',
                status: '',
                hot: '',
                no: 50,
            },
            other: {
                editor: BraftEditor.createEditorState(null),
                pictures: [],
                types: [],
                areas: [],
            }
        }
    }

    componentWillMount() {

        if (this.props.location.search !== '') {

            let data = window.urlDecode(this.props.location.search);

            if (data.cid === undefined || data.cid === '') {

                this.toInit();
                return
            }

            let obj = this.state;

            obj.basic.type = 'update';
            obj.basic.id = data.cid;
            obj.basic.button = '修改';

            this.setState(obj, () => {
                this.toInit();
            });
        } else {
            this.toInit();
        }

        this.toGetTypePro();
        this.toGetAreaPro();
    }

    toFind() {

        let self = this;

        window.$http.get('/v1/administer/cap/' + this.state.basic.id)
            .then(function (response) {
                if (!response || response.data.status !== 0) {
                    return false;
                }

                let obj = self.state;
                obj.form.name = response.data.result.name;
                obj.form.types = response.data.result.types;
                obj.form.areas = response.data.result.areas;
                obj.form.quarters = response.data.result.quarters;
                obj.form.summary = response.data.result.summary;
                obj.form.content = response.data.result.content;
                obj.form.status = response.data.result.status;
                obj.form.hot = response.data.result.hot;
                obj.form.no = response.data.result.no;
                obj.form.price = response.data.result.price;
                obj.form.cause = response.data.result.cause;

                response.data.result.pictures = response.data.result.pictures === null ? [] : response.data.result.pictures;

                for (let i = 0; i < response.data.result.pictures.length; i++) {

                    obj.other.pictures.push({
                        uid: i,
                        name: response.data.result.pictures[i],
                        url: window.$url + response.data.result.pictures[i],
                        thumbUrl: window.$url + response.data.result.pictures[i],
                    })
                }

                obj.other.editor = BraftEditor.createEditorState(response.data.result.content);

                self.props.form.setFieldsValue({
                    content: BraftEditor.createEditorState(response.data.result.content)
                });

                self.setState(obj);
            });
    };

    toInit() {

        if (this.state.basic.type === 'update') {

            this.toFind();

            let obj = this.state;

            obj.basic.find = false;

            this.setState(obj)
        }
    };

    toUpload = (file) => {

        let response = file.file.response;

        if (response === undefined) {
            return
        }

        if (response.status !== 0) {

            window.$message.error(response.message);
            return;
        }

        let pictures = this.state.other.pictures;

        pictures.push({
            uid: pictures.length + 1,
            name: response.result,
            url: window.$url + response.result,
            thumbUrl: window.$url + response.result,
        });

        let obj = this.state;

        obj.other.pictures = pictures;

        this.setState(obj);

        window.$message.success("图片上传成功");
    };

    toSubmit = (e) => {
        e.preventDefault();

        this.props.form.validateFieldsAndScroll((err, values) => {

            if (!err) {

                let obj = this.state;

                obj.form.name = values.name;
                obj.form.types = values.types;
                obj.form.areas = values.areas;
                obj.form.quarters = values.quarters;
                obj.form.summary = values.summary;
                obj.form.price = parseFloat(values.price);
                obj.form.cause = parseFloat(values.cause);
                obj.form.content = this.state.other.editor.toHTML();
                obj.form.status = values.status;
                obj.form.hot = values.hot;
                obj.form.no = values.no;

                obj.form.pictures = [];

                obj.other.pictures.map(item => {
                    obj.form.pictures.push(item.name);
                    return item
                });

                this.setState(obj, () => {
                    if (this.state.basic.type === 'update') {
                        this.toUpdate();
                    } else {
                        this.toCreate();
                    }
                });
            }
        });
    };

    toCreate() {
        let self = this;
        window.$http.post('/v1/administer/cap', self.state.form)
            .then(function (response) {
                if (!response || response.data.status !== 0) {
                    return false;
                }
                window.$message.success("商品信息添加成功");
            })
    }

    toUpdate() {
        let self = this;
        window.$http.put('/v1/administer/cap/' + self.state.basic.id, self.state.form)
            .then(function (response) {
                if (!response || response.data.status !== 0) {
                    return false;
                }
                window.$message.success("商品信息修改成功");
            })
    }

    toChangeContent = (editorState) => {

        let obj = this.state;

        obj.other.editor = editorState;

        this.setState(obj)
    };

    toGetTypePro() {

        let self = this;

        window.$http.get('/v1/administer/type/pro')
            .then(function (response) {

                if (!response || response.data.status !== 0) {
                    return false;
                }

                if (response.data.result === null) {
                    window.$message.error("请先设置商品的可售高度信息");

                    setTimeout(function () {
                        self.props.location.history("/type")
                    }, 2000);

                    return false;
                }

                let data = [];

                response.data.result.filter(function (value) {

                    let item = {};
                    item.tid = value.tid;
                    item.name = value.name;
                    item.summary = value.summary;

                    data.push(item);

                    return value;
                });

                let obj = self.state;

                obj.other.types = data;

                self.setState(obj);
            })
    };

    toGetAreaPro() {

        let self = this;

        window.$http.get('/v1/administer/area/pro')
            .then(function (response) {

                if (!response || response.data.status !== 0) {
                    return false;
                }

                if (response.data.result === null) {
                    window.$message.error("请先设置商品的可售分区信息");

                    setTimeout(function () {
                        self.props.location.history("/area")
                    }, 2000);

                    return false;
                }

                let data = [];

                response.data.result.filter(function (value) {

                    let item = {};
                    item.aid = value.aid;
                    item.name = value.name;
                    item.summary = value.summary;

                    data.push(item);

                    return value;
                });

                let obj = self.state;

                obj.other.areas = data;

                self.setState(obj);
            })
    };

    render() {
        const {getFieldDecorator} = this.props.form;

        const props = {
            name: 'file',
            action: window.$picture,
            headers: {
                Authorization: window.$cookie.get("Authorization")
            },
            listType: 'picture',
            defaultFileList: this.state.other.pictures,
            onChange: this.toUpload,
        };

        return (
            <div>
                <Form onSubmit={this.toSubmit}>
                    <Row>
                        <Col span={16}>
                            <Card className='card-editor'>
                                <Form.Item>
                                    {getFieldDecorator('content', {
                                        setFieldsValue: this.state.other.editor,
                                    })(
                                        <BraftEditor
                                            controls={window.controls}
                                            onChange={this.toChangeContent}
                                            media={{
                                                uploadFn: window.toUploadFn,
                                                accepts: {video: false, audio: false,},
                                                externals: {image: false, video: false, audio: false, embed: false,}
                                            }}
                                            placeholder="商品详情内容不能为空"
                                        />
                                    )}
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Collapse accordion defaultActiveKey="basic">
                                    <Panel header="图片上传" key="pictures" className='choose-pictures'>
                                        <Tabs defaultActiveKey="choose">
                                            <TabPane tab={<span><Icon type="ordered-list"/>图片列表</span>} key="choose">
                                                <Upload {...props}>
                                                </Upload>
                                            </TabPane>
                                            <TabPane className="choose-pictures-upload"
                                                     tab={<span><Icon type="cloud-upload"/>上传图片</span>}
                                                     key="upload">
                                                <Dragger {...props}>
                                                    <p className="ant-upload-drag-icon">
                                                        <Icon type="inbox"/>
                                                    </p>
                                                    <p className="ant-upload-text">将文件拖到此处或点击上传</p>
                                                    <p className="ant-upload-hint">只能上传jpg/png文件，且不超过 2M</p>
                                                </Dragger>
                                            </TabPane>
                                        </Tabs>
                                    </Panel>
                                    <Panel header="基本信息" key="basic">
                                        <Form.Item {...window.$layout}
                                                   label="名称"
                                        >
                                            {getFieldDecorator('name', {
                                                initialValue: this.state.form.name,
                                                rules: [{
                                                    required: true, message: '商品名称不能为空',
                                                }, {
                                                    max: 60, message: '商品名称最多 60 个字',
                                                }],
                                            })(
                                                <Input autoComplete="off"/>
                                            )}
                                        </Form.Item>
                                        <Form.Item {...window.$layout} label="状态"
                                        >
                                            {getFieldDecorator('status', {
                                                initialValue: this.state.form.status === '' ? 'O' : this.state.form.status,
                                                rules: [{
                                                    required: true, message: '商品状态不能为空!',
                                                }],
                                            })(
                                                <Select>
                                                    <Option value="O">上线</Option>
                                                    <Option value="U">下线</Option>
                                                </Select>
                                            )}
                                        </Form.Item>
                                        <Form.Item {...window.$layout} label="热卖"
                                        >
                                            {getFieldDecorator('hot', {
                                                initialValue: this.state.form.hot === '' ? 'N' : this.state.form.hot,
                                                rules: [{
                                                    required: true, message: '商户属性不能为空!',
                                                }],
                                            })(
                                                <Select>
                                                    <Option value="Y">开启</Option>
                                                    <Option value="N">关闭</Option>
                                                </Select>
                                            )}
                                        </Form.Item>
                                        <Form.Item {...window.$layout} label="简介"
                                        >
                                            {getFieldDecorator('summary', {
                                                initialValue: this.state.form.summary,
                                                rules: [{
                                                    max: 255, message: '商户简介最多 255 个字',
                                                }],
                                            })(
                                                <TextArea rows={3} placeholder='请输入商户简介'/>
                                            )}
                                        </Form.Item>
                                        <Form.Item {...window.$layout} label="排序"
                                        >
                                            {getFieldDecorator('no', {
                                                initialValue: this.state.form.no,
                                                rules: [{
                                                    required: true, message: '商户序号不能为空!',
                                                }],
                                            })(
                                                <Slider min={1} max={99}/>
                                            )}
                                        </Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit"
                                                    block>{this.state.basic.button}</Button>
                                        </Form.Item>
                                    </Panel>
                                    <Panel header="可售属性" key="position">
                                        <Form.Item {...window.$layout} label="类型"
                                        >
                                            {getFieldDecorator('types', {
                                                initialValue: this.state.form.types.length === 0 ? [] : this.state.form.types,
                                                rules: [{
                                                    required: true, message: '可售类型不能为空!',
                                                }],
                                            })(
                                                <Select mode="multiple">
                                                    {
                                                        this.state.other.types.map((item) => {
                                                            return (
                                                                <Option key={item.tid}
                                                                        value={item.tid}>{item.name}</Option>
                                                            )
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                        <Form.Item {...window.$layout} label="分区"
                                        >
                                            {getFieldDecorator('areas', {
                                                initialValue: this.state.form.areas.length === 0 ? [] : this.state.form.areas,
                                                rules: [{
                                                    required: true, message: '可售分区不能为空!',
                                                }],
                                            })(
                                                <Select mode="multiple">
                                                    {
                                                        this.state.other.areas.map((item) => {
                                                            return (
                                                                <Option key={item.aid}
                                                                        value={item.aid}>{item.name}</Option>
                                                            )
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                        <Form.Item {...window.$layout} label="刻度"
                                        >
                                            {getFieldDecorator('quarters', {
                                                initialValue: this.state.form.quarters.length === 0 ? [] : this.state.form.quarters,
                                                rules: [{
                                                    required: true, message: '可售刻度不能为空!',
                                                }],
                                            })(
                                                <Select mode="multiple">
                                                    <Option key={1} value={1}>正刻</Option>
                                                    <Option key={2} value={2}>侧刻</Option>
                                                    <Option key={3} value={3}>无刻</Option>
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Panel>
                                    <Panel header="商品价格" key="price">
                                        <Form.Item {...window.$layout} label="现价"
                                        >
                                            {getFieldDecorator('price', {
                                                initialValue: this.state.form.price <= 0 ? '' : this.state.form.price,
                                                rules: [{
                                                    required: true, message: '商品现价不能为空!',
                                                }],
                                            })(
                                                <Input autoComplete="off"/>
                                            )}
                                        </Form.Item>
                                        <Form.Item {...window.$layout} label="原价"
                                        >
                                            {getFieldDecorator('cause', {
                                                initialValue: this.state.form.cause <= 0 ? '' : this.state.form.cause,
                                                rules: [{
                                                    required: true, message: '商品原价不能为空!',
                                                }],
                                            })(
                                                <Input autoComplete="off"/>
                                            )}
                                        </Form.Item>
                                    </Panel>
                                </Collapse>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

KeycapEditor = Form.create()(KeycapEditor);

export default KeycapEditor;