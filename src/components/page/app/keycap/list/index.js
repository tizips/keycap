import React, {Component} from 'react';
import {Button, Pagination, Table, Tag, Tooltip} from "antd";
import store from "../../../../../store/index";
import {Link} from 'react-router-dom'

class KeycapList extends Component {

  constructor(props) {

    super(props);

    this.state = {
      basic: {
        width: 0,
        height: 0,
      },
      data: {
        table: [],
      },
    };
  }

  componentWillMount() {
    this.toGet();
  };

  toOpenCreate() {

    let path = {
      pathname: '/app/merchant/edit',
    };

    this.props.history.push(path)
  };

  toDelete = (recode) => {

    let self = this;

    window.$confirm({
      centered: true,
      title: '确定要删除该签约商户 ?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        window.$http.delete("/v1/admins/children/" + recode.id)
          .then(function (response) {
            if (!response || response.data.status !== 0) {
              return false;
            }
            window.$message.success("商户信息删除成功");
            self.toGet();
          })
      },
    });
  };

  toGet() {

    let self = this;

    window.$http.get('/v1/admins/children')
      .then(function (response) {

        if (!response || response.data.status !== 0 || response.data.result == null) {
          return false;
        }

        let data = [];

        response.data.result.filter(function (value) {

          let item = {};
          item.key = value.id;
          item.id = value.id;
          item.name = value.name;
          item.tel = value.tel;
          item.area = value.area;
          item.status = value.status;
          item.time = value.time;

          switch (item.status) {
            case 'CLOSE':
              item.toStatus = {
                color: 'red',
                blade: '下线',
              };
              break;
            case 'OPEN':
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

          return value;
        });

        let obj = self.state;

        obj.data.table = data;

        self.setState(obj);
      })
  }

  toAdmin = (record) => {

    window.$cookie.set('id', record.id);

    // console.log(record)
    window.location.href = '/app/dashboard';
    // console.log("test")
  };

  render() {

    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '联系电话',
        dataIndex: 'tel',
        key: 'tel',
      }, {
        title: '所属地区',
        dataIndex: 'area',
        key: 'area',
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
              <Link to={"/app/child/edit?id=" + record.id} query={{id: record.id}}>
                <Button htmlType="button" shape="circle"
                        icon="highlight"/>
              </Link>
            </Tooltip>
            <Tooltip placement="topLeft" title="管理">
              <Button htmlType="button" onClick={this.toAdmin.bind(this, record)} type="primary" shape="circle"
                      icon="folder-open"/>
            </Tooltip>
            <Tooltip placement="topLeft" title="删除">
              <Button type="danger" shape="circle" icon="delete" onClick={this.toDelete.bind(this, record)}/>
            </Tooltip>
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
    });

    return (

      <div>
        <Table columns={columns} dataSource={this.state.data.table}
               style={{height: this.state.basic.height - 180 + 'px'}}
               pagination={false}/>
        <div className="table-bottom">
          <div className="table-bottom-left">
            <Link to="/keycap/edit">
              <Tooltip placement="top" title="添加">
                <Button htmlType='button' type="primary" icon="edit"/>
              </Tooltip>
            </Link>
          </div>
          <div className="table-bottom-right">
            <Pagination simple defaultCurrent={2} total={50}/>
          </div>
        </div>
      </div>
    );
  }
}

export default KeycapList;
