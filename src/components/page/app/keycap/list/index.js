import React, {Component} from 'react';
import {Button, Pagination, Table, Tag, Tooltip} from "antd";
import store from "../../../../../store/index";
import {Link} from 'react-router-dom'
import './style.less';

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
        page: {
          page: 1,
          total: 0,
          size: 15,
        }
      },
    };
  }

  componentWillMount() {
    this.toGet();
  };

  toDelete = (recode) => {

    let self = this;

    window.$confirm({
      centered: true,
      title: '确定要删除该商品信息 ?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        window.$http.delete("/v1/administer/cap/" + recode.cid)
          .then(function (response) {
            if (!response || response.data.status !== 0) {
              return false;
            }
            window.$message.success("商品信息删除成功");
            self.toGet();
          })
      },
    });
  };

  onChangePage = (page, pageSize) => {

    let self = this;
    let obj = this.state;

    obj.data.page.page = page;

    this.setState(obj, () => {
      self.toGet();
    })
  };

  toGet() {

    let self = this;

    window.$http.get('/v1/administer/cap', {
      params: {
        page: self.state.data.page.page,
      }
    })
      .then(function (response) {

        if (!response || response.data.status !== 0 || response.data.result.data == null) {
          return false;
        }

        let data = [];

        response.data.result.data.filter(function (value) {

          let item = {};
          item.key = value.cid;
          item.cid = value.cid;
          item.name = value.name;
          item.picture = window.$upload + value.picture;
          item.price = parseFloat(value.price);
          item.cause = parseFloat(value.cause);
          item.status = value.status;
          item.hot = value.hot;
          item.no = value.no;
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

          switch (item.hot) {
            case 'N':
              item.toHot = {
                color: 'red',
                blade: '关闭',
              };
              break;
            case 'Y':
              item.toHot = {
                color: 'green',
                blade: '开启',
              };
              break;
            default:
              item.toHot = {
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

        obj.data.page.page = response.data.result.page;
        obj.data.page.total = response.data.result.count;
        obj.data.page.size = response.data.result.num;

        self.setState(obj);
      })
  }

  render() {

    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '缩略图',
        dataIndex: 'picture',
        key: 'picture',
        render: (picture, record) => (
          <img className="key-cap-list-picture" src={picture} alt={record.name}/>
        ),
      }, {
        title: '原价',
        dataIndex: 'cause',
        key: 'cause',
        render: cause => (
          <s>${cause}</s>
        ),
      }, {
        title: '现价',
        dataIndex: 'price',
        key: 'price',
        render: price => (
          <font color="red">${price}</font>
        ),
      }, {
        title: '热销',
        dataIndex: 'toHot',
        key: 'toHot',
        render: toHot => (
          <Tag color={toHot.color}>{toHot.blade}</Tag>
        ),
      }, {
        title: '状态',
        key: 'toStatus',
        dataIndex: 'toStatus',
        render: toStatus => (
          <Tag color={toStatus.color}>{toStatus.blade}</Tag>
        ),
      }, {
        title: '序号',
        key: 'no',
        dataIndex: 'no',
        render: no => (
          <Tag>{no}</Tag>
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
              <Link to={"/keycap/edit?cid=" + record.cid} query={{cid: record.cid}}>
                <Button htmlType="button" shape="circle"
                        icon="highlight"/>
              </Link>
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
            <Link to="/keycap/edit">
              <Tooltip placement="top" title="添加">
                <Button htmlType='button' type="primary" icon="edit"/>
              </Tooltip>
            </Link>
          </div>
          <div className="table-bottom-right">
            <Pagination onChange={this.onChangePage} simple defaultCurrent={1} current={this.state.data.page.page}
                        total={this.state.data.page.total}
                        pageSize={this.state.data.page.size}/>
          </div>
        </div>
      </div>
    );
  }
}

export default KeycapList;
