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

const ViewProductFilter = () => {
  const [productFilterArr, setProductFilterArr] = useState([])
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
              <a onClick={()=> deleteProductFilterById(record?.id)}>
                <DeleteOutlined/>
              </a>
            </Space>
          </>
        )
      }
    }
  ]

  const getProductFilterData = () => {
    BlackbullAxios.get("/api/stl-product-line?page=all")
    .then(res => {
      if(res.data && res.data?.data) {
        let data = cloneDeep(res.data.data)
        setProductFilterArr(data)
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
      addProductFilter(json)
    } else {
      let id = json?.id
      delete json?.id
      editProductFilter(json, id)
    }
  }

  const addProductFilter = (json) => {
    let payload = cloneDeep(json)
    BlackbullAxios.post("/api/stl-product-line", payload)
    .then(res => {
      if(res.data) {
        openNotificationWithIcon("success", "Product Filters", "Added Successfully");
        getProductFilterData()
      }
    })
    .catch(error => {
      console.log(error)
      openNotificationWithIcon("error", "Product Filters", "Something Went Wrong");
    })
    setIsAdd(true)
    setShowModal(false)
  }

  const editProductFilter = (json, id) => {
    let payload = cloneDeep(json)
    BlackbullAxios.put(`/api/stl-product-line/${id}`, payload)
    .then(res => {
      if(res.data) {
        openNotificationWithIcon("success", "Product Filter", "Updated Successfully");
        getProductFilterData()
      }
    })
    .catch(error => {
      console.log(error)
      openNotificationWithIcon("error", "Product Filter", "Something Went Wrong");
    })
    setIsAdd(true)
    setShowModal(false)
  }

  const deleteProductFilterById = (id) => {
    let confirmStr = "Are you sure you want to delete this product filter?";
    if (confirm(confirmStr)) {
      BlackbullAxios.delete(`/api/stl-product-line/${id}`)
      .then(res => {
        if(res.data) {
          setIsAdd(true)
          openNotificationWithIcon("success", "Product Filter", "Deleted Successfully");
          getProductFilterData()
        }
      })
      .catch(error => {
        console.log(error)
        openNotificationWithIcon("error", "Product Filter", "Something Went Wrong");
      })
    }
  }

  useEffect(() => {
    if(!productFilterArr?.length) {
      getProductFilterData()
    }
  }, [])

  return (
    <>
      <Heading text="View Product Filters" variant="h4"></Heading>
      <div className="bg-white p-4">
        <Button
          onClick={() => handleAdd()}
          className="float-right mr-2 mb-3"
          icon={<PlusOutlined />}>
          Add  
        </Button>
        <Table columns={columns} dataSource={productFilterArr}></Table>
        <AddStoreCategory
          page={"Product Filter"}
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

export default ViewProductFilter;
