import React, { useEffect, useState } from "react";
import Heading from "@ui-components/Heading";
import { AutoComplete, Button, Space, Table, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { cloneDeep } from "lodash";

import { getCookie } from "../../../helpers/cookieHelper";
import AddStoreCategory from "./addStoreCategory"
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";

let headers = {
  "Accept": "application/json, text/plain, */*",
  "Content-Type": "application/json",
  "Authorization": "Bearer " + getCookie("access_token")  
}
let BlackbullAxios = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
  headers: headers
})

const ViewStoreCategory = () => {
  const [storeCategoryArr, setStoreCategoryArr] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isAdd, setIsAdd] = useState(true)
  const [selectedData, setSelectedData] = useState({})
  const columns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name"
    },
    {
      title: "Slug",
      key: "slug",
      dataIndex: "slug"
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
              <a onClick={()=> deleteCategoryById(record?.id)}>
                <DeleteOutlined/>
              </a>
            </Space>
          </>
        )
      }
    }
  ]

  const getStoreCategoryData = () => {
    BlackbullAxios.get("/api/stl-category?page=all")
    .then(res => {
      if(res.data && res.data?.data) {
        let data = cloneDeep(res.data.data)
        setStoreCategoryArr(data)
      }
    })
    .catch(error => {
      console.log(error)
    })
  }

  const handleAdd = () => {
    setIsAdd(true)
    setShowModal(true)
    setSelectedData({})
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const openEditModal = (obj) => {
    setIsAdd(false)
    setShowModal(true)
    setSelectedData(obj)
  }

  const submitCallBack = (json) => {
    if(isAdd) {
      addNewStoreCategory(json)
    } else {
      let id = json?.id
      delete json?.id
      editStoreCategory(json, id)
    }
  }

  const addNewStoreCategory = (json) => {
    let payload = cloneDeep(json)
    BlackbullAxios.post("/api/stl-category", payload)
    .then(res => {
      if(res.data) {
        openNotificationWithIcon("success", "Category", "Added Successfully");
        getStoreCategoryData()
      }
    })
    .catch(error => {
      console.log(error)
      openNotificationWithIcon("error", "Category", "Something Went Wrong");
    })
    setIsAdd(true)
    setShowModal(false)
  }

  const editStoreCategory = (json, id) => {
    let payload = cloneDeep(json)
    BlackbullAxios.put(`/api/stl-category/${id}`, payload)
    .then(res => {
      if(res.data) {
        openNotificationWithIcon("success", "Category", "Updated Successfully");
        getStoreCategoryData()
      }
    })
    .catch(error => {
      console.log(error)
      openNotificationWithIcon("error", "Category", "Something Went Wrong");
    })
    setIsAdd(true)
    setShowModal(false)
  }

  const deleteCategoryById = (id) => {
    let confirmStr = "Are you sure you want to delete this category?";
    if (confirm(confirmStr)) {
      BlackbullAxios.delete(`/api/stl-category/${id}`)
      .then(res => {
        if(res.data) {
          setIsAdd(true)
          openNotificationWithIcon("success", "Category", "Deleted Successfully");
          getStoreCategoryData()
        }
      })
      .catch(error => {
        console.log(error)
        openNotificationWithIcon("error", "Category", "Something Went Wrong");
      })
    }
  }

  useEffect(() => {
    if(!storeCategoryArr?.length) {
      getStoreCategoryData()
    }
  }, [])

  return (
    <>
      <Heading text="View Store Category" variant="h4"></Heading>
      <div className="bg-white p-4">
        <Button
          onClick={() => handleAdd()}
          className="float-right mr-2 mb-3"
          icon={<PlusOutlined />}>
          Add  
        </Button>
        <Table columns={columns} dataSource={storeCategoryArr}></Table>
        <AddStoreCategory
          page={"Category"}
          isAdd={isAdd}
          showModal={showModal}
          closeModal={closeModal}
          selectedData={selectedData}
          submitCallBack={submitCallBack}
        />
      </div>
    </>
  );
}

export default ViewStoreCategory;
