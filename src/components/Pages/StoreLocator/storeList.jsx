import React from "react";
import Heading from "@ui-components/Heading";
import { Table, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { getCookie } from "../../../helpers/cookieHelper";
import { cloneDeep } from "lodash";
import { useHistory } from "react-router-dom";
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";
import './index.scss'

let headers = {
  "Accept": "application/json, text/plain, */*",
  "Content-Type": "application/json",
  "Authorization": "Bearer " + getCookie("access_token")  
}
let BlackbullAxios = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
  headers: headers
})

// const data = [
//   {
//     name: "Black Bull Store",
//     address: "Navi Mumbai, Maharashtra, 400001",
//     status: "active",
//     phoneNumber: "9078676776",
//     website: "blackbull.in",
//     imageUrl: "store.png"
//   },
//   {
//     name: "Black Bull Store 2",
//     address: "2, Navi Mumbai, Maharashtra, 400001",
//     status: "On Hold",
//     phoneNumber: "9078376776",
//     website: "blackbull.net",
//     imageUrl: "store_new.png"
//   },
//   {
//     name: "Black Buck Store",
//     address: "Mumbai, Maharashtra, 400001",
//     status: "rejected",
//     phoneNumber: "9078676776",
//     website: "blackbuck.in",
//     imageUrl: "store.png"
//   },
//   {
//     name: "Rasta Cafe Store",
//     address: "Pune, Maharashtra, 400001",
//     status: "active",
//     phoneNumber: "9078676776",
//     website: "blackbull.in",
//     imageUrl: "store.png"
//   },
// ]

const StoreList = () => {
  const history = useHistory();
  const [storeArr, setStoreArr] = useState([])
  const columns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name"
    },
    {
      title: "Address",
      key: "address",
      dataIndex: "address"
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (text, record) => {
        //console.log(text, record);
        let color = "green";
        switch(text.toUpperCase()) {
          case "ON HOLD":
            color = "orange";
            break;
          case "REJECTED":
            color = "red";
            break;
          case "ACTIVE":
            color = "green";
            break;
          default:
            color = "gray";
        }
        return (<>
          <Tag color={color}>{text.toUpperCase()}</Tag>
        </>)
      }
    },
    {
      title: "Phone Number",
      key: "phoneNumber",
      dataIndex: "phoneNumber"
    },
    {
      title: "Website",
      key: "website",
      dataIndex: "website"
    },
    {
      title: "Image URL",
      key: "imageUrl",
      dataIndex: "imageUrl"
    },
    {
      title: "Actions",
      key: "action",
      render: (text, record) => {
        return (
          <>
            <Space size="middle" className="mr-3">
              <a onClick={()=> openEditModal(record)}>
                <EditOutlined/>
              </a>
            </Space>
            <Space size="middle">
              <a onClick={()=> deleteStoreById(text?.id)}>
                <DeleteOutlined/>
              </a>
            </Space>
          </>
        )
      }
    }
  ]
  const getStoreData = () => {
    BlackbullAxios.get("/api/store-locator?page=all")
    .then(res => {
      if(res.data && res.data?.data) {
        let data = cloneDeep(res.data.data)
        let arr = []
        data?.forEach(el => {
          let obj = {
            id: el?.id,
            name: el?.name,
            address: el?.adress_line_1 ? el?.adress_line_1 : el?.adress_line_2,
            status: "active",
            phoneNumber: el?.phone_number,
            website: el?.website,
            imageUrl: el?.image_url
          }
          arr.push(obj)
        })
        setStoreArr(arr)
      }
    })
    .catch(error => {
      console.log(error)
    })
  }

  const deleteStoreById = (id) => {
    let confirmStr = "Are you sure you want to delete this store?";
    if (confirm(confirmStr)) {
      BlackbullAxios.delete(`/api/store-locator/${id}`)
      .then(res => {
        if(res.data && res.data?.data) {
          openNotificationWithIcon("success", "Store", "Deleted Successfully");
          getStoreData()
        }
      })
      .catch(error => {
        console.log(error)
        openNotificationWithIcon("error", "Category", "Something Went Wrong");
      })
    }
  }

  const openEditModal = (obj) => {
    if(obj?.id) {
      history.push(`/add-new-store/${obj?.id}`); 
    }
  }

  useEffect(() => {
    if(!storeArr?.length) {
      getStoreData()
    }
  }, [])

  return (
    <>
      <Heading text="View Stores" variant="h4"></Heading>
      <div className="bg-white p-4 view-store-table">
        <Table columns={columns} dataSource={storeArr}></Table>
      </div>
    </>
  );
}

export default StoreList;
