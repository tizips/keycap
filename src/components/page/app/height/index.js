import React, {Component} from 'react';
import {Button, Form, Input, Modal, Select, Slider, Table, Tag, Tooltip} from "antd";
import store from "../../../../store";
import './style.less';

const {TextArea} = Input;
const {Option} = Select;

class AppHeight extends Component {

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

    window.$http.get('/v1/administer/height')
      .then(function (response) {

        if (!response || response.data.status !== 0 || response.data.result === null) {
          return false;
        }

        let data = [];
        let i = 1;

        response.data.result.filter(function (value) {

          let item = {};
          item.key = i;
          item.hid = value.hid;
          item.name = value.name;
          item.summary = value.summary;
          item.no = value.no;
          item.status = value.status;
          item.time = value.time;

          switch (item.status) {
            case 'U':
              item.toStatus = {
                color: 'red',
                blade: '下线',
              };
              break;
            case 'O':
              item.toStatus = {
                color: 'green',
                blade: '上线',
              };
              break;
            default:
              item.toStatus = {
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

    let obj = this.state;

    obj.basic.form.show = true;

    this.setState(obj, () => {
      obj.toClearForm();
    });
  };

  toClearForm() {

    let obj = this.state;

    obj.form.name = '';
    obj.form.summary = '';
    obj.form.status = 'O';
    obj.form.no = 50;

    this.setState(obj);
  };

  toOpenUpdate = (record) => {

    let obj = this.state;

    obj.basic.form.show = true;
    obj.basic.form.type = 'update';
    obj.basic.form.id = record.hid;

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
        // obj.form.no = parseInt(values.no);
        obj.form.no = 0;

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
    window.$http.post('/v1/administer/height', self.state.form)
      .then(function (response) {
        if (!response || response.data.status !== 0) {
          return false;
        }

        window.$message.success("键帽高度信息添加成功");

        let obj = self.state;

        obj.basic.form.show = false;

        self.setState(obj);
        self.toGet();
      })
  };

  toUpdate() {
    let self = this;
    window.$http.put('/v1/administer/height/' + self.state.basic.form.id, self.state.form)
      .then(function (response) {
        if (!response || response.data.status !== 0) {
          return false;
        }

        window.$message.success("键帽高度信息修改成功");

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
        title: '序号',
        key: 'no',
        dataIndex: 'no',
        render: no => (
          <Tag>{no}</Tag>
        ),
      }, {
        title: '状态',
        key: 'toStatus',
        dataIndex: 'toStatus',
        render: toStatus => (
          <Tag color={toStatus.color}>{toStatus.blade}</Tag>
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
                  required: true, message: '高度名称不能为空',
                }, {
                  max: 20, message: '高度名称最多 20 个字'
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
                  max: 240, message: '高度简介最多 240 个字',
                }],
              })(
                <TextArea rows={3}/>
              )}
            </Form.Item>
            <Form.Item {...window.$layout} label="状态"
            >
              {getFieldDecorator('status', {
                initialValue: this.state.form.status === '' ? 'O' : this.state.form.status,
                rules: [{
                  required: true, message: '高度状态不能为空!',
                }],
              })(
                <Select>
                  <Option value="O">上线</Option>
                  <Option value="U">下线</Option>
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

AppHeight = Form.create()(AppHeight);

export default AppHeight;