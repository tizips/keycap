import React, {Component} from 'react';
import {Button, Card, Collapse, Form, Input, Row, Col, Select, Tabs, Icon, Upload} from 'antd';
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
        pictures: [],
        name: '',
        tel: '',
        status: '',
        summary: '',
        content: '',
        position: '',
        lng: 0,
        lat: 0,
        aid: '',
      },
      other: {
        editor: BraftEditor.createEditorState(null),
        pictures: [],
        date: [],
        areas: [],
      }
    }
  }

  componentWillMount() {

    if (this.props.location.search !== '') {

      let data = window.urlDecode(this.props.location.search);

      if (data.id === undefined || data.id === '') {

        this.toInit();
        return
      }

      let obj = this.state;

      obj.basic.type = 'update';
      obj.basic.id = data.id;
      obj.basic.button = '修改';

      this.setState(obj, () => {
        this.toInit();
      });
    } else {
      this.toInit();
    }

    // this.toGetAreaPro();
  }

  toFind() {

    let self = this;

    window.$http.get('/v1/admins/children/' + this.state.basic.id)
      .then(function (response) {
        if (!response || response.data.status !== 0) {
          return false;
        }

        let obj = self.state;
        obj.form.name = response.data.result.name;
        obj.form.tel = response.data.result.tel;
        obj.form.status = response.data.result.status;
        obj.form.summary = response.data.result.summary;
        obj.form.content = response.data.result.content;
        obj.form.position = response.data.result.position;
        obj.form.lng = response.data.result.lng;
        obj.form.aid = response.data.result.aid;
        obj.form.lat = response.data.result.lat;

        response.data.result.pictures = response.data.result.pictures === null ? [] : response.data.result.pictures;

        for (let i = 0; i < response.data.result.pictures.length; i++) {

          obj.other.pictures.push({
            uid: i,
            url: response.data.result.pictures[i],
            thumbUrl: response.data.result.pictures[i],
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

      // this.toFind();

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
      url: window.$upload + response.result,
      thumbUrl: window.$upload + response.result,
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
        obj.form.tel = values.tel;
        obj.form.summary = values.summary;
        obj.form.content = this.state.other.editor.toHTML();
        obj.form.position = values.position;
        obj.form.status = values.status;
        obj.form.aid = values.aid;

        obj.form.pictures = [];

        obj.other.pictures.map(item => {
          obj.form.pictures.push(item.url);
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
    window.$http.post('/v1/admins/children', self.state.form)
      .then(function (response) {
        if (!response || response.data.status !== 0) {
          return false;
        }
        window.$message.success("子商户信息添加成功");
      })
  }

  toUpdate() {
    let self = this;
    window.$http.put('/v1/admins/children/' + self.state.basic.id, self.state.form)
      .then(function (response) {
        if (!response || response.data.status !== 0) {
          return false;
        }
        window.$message.success("子商户信息修改成功");
      })
  }

  toChangeContent = (editorState) => {

    let obj = this.state;

    obj.other.editor = editorState;

    this.setState(obj)
  };

  toGetAreaPro() {

    let self = this;

    window.$http.get('/v1/admins/area/pro')
      .then(function (response) {

        if (!response || response.data.status !== 0) {
          return false;
        }

        if (response.data.result === null) {
          window.$message.error("请先设置子商户的所属地区");

          setTimeout(function () {
            self.props.location.history("/app/area")
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

        obj.form.aid = data[0].aid;

        obj.other.areas = data;

        self.setState(obj);
      })
  };

  render() {
    const {getFieldDecorator} = this.props.form;

    const props = {
      name: 'file',
      action: window.$picture,
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
                      placeholder="请输入正文内容"
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
                      <TabPane className="choose-pictures-upload" tab={<span><Icon type="cloud-upload"/>上传图片</span>}
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
                               label="商户名称"
                    >
                      {getFieldDecorator('name', {
                        initialValue: this.state.form.name,
                        rules: [{
                          required: true, message: '商户名称不能为空',
                        }],
                      })(
                        <Input autoComplete="off"/>
                      )}
                    </Form.Item>
                    <Form.Item {...window.$layout}
                               label="联系电话"
                    >
                      {getFieldDecorator('tel', {
                        initialValue: this.state.form.tel,
                        rules: [{
                          required: true, message: '联系电话不能为空',
                        }],
                      })(
                        <Input autoComplete="off"/>
                      )}
                    </Form.Item>
                    <Form.Item {...window.$layout} label="商户状态"
                    >
                      {getFieldDecorator('status', {
                        initialValue: this.state.form.status === '' ? 'OPEN' : this.state.form.status,
                        rules: [{
                          required: true, message: '商户类型不能为空!',
                        }],
                      })(
                        <Select>
                          <Option value="OPEN">上线</Option>
                          <Option value="CLOSE">下线</Option>
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item
                    >
                      {getFieldDecorator('summary', {
                        initialValue: this.state.form.summary,
                        rules: [{
                          required: true, message: '商户简介不能为空',
                        }],
                      })(
                        <TextArea rows={3} placeholder='请输入商户简介'/>
                      )}
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block>{this.state.basic.button}</Button>
                    </Form.Item>
                  </Panel>
                  <Panel header="位置信息" key="position">
                    <Form.Item {...window.$layout} label="所属地区"
                    >
                      {getFieldDecorator('aid', {
                        initialValue: this.state.form.aid === '' ? '' : this.state.form.aid,
                        rules: [{
                          required: true, message: '子商户所属地区不能为空!',
                        }],
                      })(
                        <Select>
                          {
                            this.state.other.areas.map((item) => {
                              return (
                                <Option key={item.aid} value={item.aid}>{item.name}</Option>
                              )
                            })
                          }
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item {...window.$layout}
                               label="详细地址"
                    >
                      {getFieldDecorator('position', {
                        initialValue: this.state.form.position,
                        rules: [{
                          required: true, message: '详细位置不能为空',
                        }],
                      })(
                        <TextArea rows={3} placeholder='请输入商户详细位置信息'/>
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