import React, {Component} from 'react';
import {Button, Form, Input, Modal, Select, Slider, Table, Tag, Tooltip} from "antd";
import store from "../../../../store";
import './style.less';

const {TextArea} = Input;
const {Option} = Select;

class AppAdmin extends Component {

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
      },
      data: {
        table: [],
      },
      form: {
        name: '',
        summary: '',
        status: '',
        no: 50,
      },
    };
  };

  componentWillMount() {
    this.toGet();
  };

  toGet() {

    let self = this;

    window.$http.get('/v1/administer/admin')
      .then(function (response) {

        if (!response || response.data.status !== 0 || response.data.result === null) {
          return false;
        }

        let data = [];
        let i = 1;

        response.data.result.filter(function (value) {

          let item = {};
          item.key = i;
          item.name_admin = value.name_admin;
          item.name_role = value.name_role;
          item.nickname = value.nickname;
          item.email = value.email;
          item.editor = value.editor;
          item.time = value.time;

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

          item.toTime = window.$moment(item.time * 1000).format("MM/DD hh:mm");

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
    obj.form.status = 'OPEN';
    obj.form.no = 50;

    this.setState(obj);
  };

  toOpenUpdate = (record) => {

    let obj = this.state;

    obj.basic.form.show = true;
    obj.basic.form.type = 'update';
    obj.basic.form.id = record.aid;

    obj.form.name = record.name;
    obj.form.summary = record.summary;
    obj.form.status = record.status;
    obj.form.no = parseInt(record.no);

    this.setState(obj);
  };

  toCloseForm = () => {

    let obj = this.state;

    obj.basic.form.show = false;

    this.setState(obj);
  };

  toSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {

      if (!err) {

        let obj = this.state;

        obj.form.name = values.name;
        obj.form.summary = values.summary;
        obj.form.status = values.status;
        obj.form.no = parseInt(values.no);

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
    window.$http.post('/v1/admins/area', self.state.form)
      .then(function (response) {
        if (!response || response.data.status !== 0) {
          return false;
        }

        window.$message.success("地区信息添加成功");

        let obj = self.state;

        obj.basic.form.show = false;

        self.setState(obj);
        self.toGet();
      })
  };

  toUpdate() {
    let self = this;
    window.$http.put('/v1/admins/area/' + self.state.basic.form.id, self.state.form)
      .then(function (response) {
        if (!response || response.data.status !== 0) {
          return false;
        }

        window.$message.success("地区信息修改成功");

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
      title: '确定要删除该地区 ?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        window.$http.delete("/v1/admins/area/" + record.aid)
          .then(function (response) {
            if (!response || response.data.status !== 0) {
              return false;
            }
            window.$message.success("地区信息删除成功");
            self.toGet();
          })
      },
    });
  };

  toRenderEditor = (record) => {
    // console.log(record)

    if (record.editor === "N") {
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

  render() {

    const {getFieldDecorator} = this.props.form;

    const columns = [
      {
        title: '#',
        dataIndex: 'key',
        key: 'key',
      },
      {
        title: '昵称',
        dataIndex: 'nickname',
        key: 'nickname',
      }, {
        title: '登录名',
        dataIndex: 'name_admin',
        key: 'name_admin',
      }, {
        title: '所属分组',
        dataIndex: 'name_role',
        key: 'name_role',
      }, {
        title: '邮箱',
        key: 'email',
      }, {
        title: '可编辑',
        key: 'toEditor',
        dataIndex: 'toEditor',
        render: toEditor => (
          <Tag color={toEditor.color}>{toEditor.blade}</Tag>
        ),
      }, {
        title: '时间',
        key: 'toTime',
        dataIndex: 'toTime',
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

    let obj = this.state;

    obj.basic.height = store.getState().system.height;

    if (obj.basic.height !== store.getState().system.height) {

      obj.basic.height = store.getState().system.height;

      this.setState(obj);
    }

    store.subscribe(() => {

      let obj = this.state;

      if (obj.basic.height !== store.getState().system.height) {

        obj.basic.height = store.getState().system.height;

        this.setState(obj);
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
              <Button htmlType='button' type="primary" icon="edit" onClick={this.toOpenCreate.bind(this)}/>
            </Tooltip>
          </div>
        </div>

        <Modal
          title="键帽高度编辑"
          centered
          closable={false}
          width={400}
          visible={this.state.basic.form.show}
          maskClosable={false}
          onOk={this.toSubmit}
          onCancel={this.toCloseForm}
        >
          <Form onSubmit={this.toSubmit}>
            <Form.Item {...window.$layout}
                       label="名称"
            >
              {getFieldDecorator('name', {
                initialValue: this.state.form.name,
                rules: [{
                  required: true, message: '地区名称不能为空',
                }, {
                  max: 20, message: '地区名称最多 20 个字'
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
                  max: 240, message: '地区简介最多 240 个字',
                }],
              })(
                <TextArea rows={3}/>
              )}
            </Form.Item>
            <Form.Item {...window.$layout} label="状态"
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
            <Form.Item {...window.$layout} label="排序"
            >
              {getFieldDecorator('no', {
                initialValue: this.state.form.no,
              })(
                <Slider min={1} max={99}/>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

AppAdmin = Form.create()(AppAdmin);

export default AppAdmin;