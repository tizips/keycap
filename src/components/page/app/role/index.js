import React, {Component} from 'react';
import {
  Button,
  Checkbox,
  Divider,
  List,
  Typography,
  Form,
  Input,
  Modal,
  Select,
  Slider,
  Table,
  Tooltip,
  Row,
  Col
} from "antd";
import store from "../../../../store";
import './style.less';

const {TextArea} = Input;
const {Option} = Select;
const CheckboxGroup = Checkbox.Group;

class AppRole extends Component {

  constructor(props) {
    super(props);

    this.state = {
      basic: {
        width: 0,
        height: 0,
        form: {
          show: true,
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
        status: '',
        no: 50,
      },
      other: {
        role: [],
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
    obj.form.status = 'O';
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

  toOperateRight = () => {
    console.log('operate', this.state.basic.role)

    let other = [];
    let i = 0;

    if (this.state.basic.role.right.admin != null) {

      let content = {
        key: i,
        name: '管理员',
        right: [],
      };

      this.state.basic.role.right.admin.filter(function (item) {
        i++;
        let cont = {
          key: i,
          name: '',
          right: '',
        };
        if (item === 'admin.watch') {
          cont.name = '查看';
          cont.right = item;
          content.right.push(cont);
        }
        return item
      });

      other.push(content);
    }

    console.log(other);

    let obj = this.state;
    obj.other.role = other;
    this.setState(obj);
  };

  toRenderRight = (rights) => {

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

        console.log('store:', obj.basic)
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
              <Button htmlType='button' type="primary" icon="edit" onClick={this.toOpenCreate.bind(this)}/>
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
              <Col span={13}>
                <Form.Item {...window.$layout}
                >
                  <Checkbox
                  >
                    Check all
                  </Checkbox>
                </Form.Item>
                <Form.Item {...window.$layout} >
                  {
                    this.state.other.role.map((item) => {

                      this.toRenderRight(item);
                      
                      return (
                        <span key={item.key}>{item.name}：</span>
                      );
                    })
                  }
                </Form.Item>
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