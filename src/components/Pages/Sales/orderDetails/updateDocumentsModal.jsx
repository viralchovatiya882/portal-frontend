import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { CustomInputText as InputChange } from "@ui-components/Input/customInput";
import { Checkbox, Col, message, Modal, Row, Select, Spin, Tabs, Tooltip } from "antd";
import { compact, filter, get, uniqBy } from "lodash";
import React from "react";
import { useDispatch } from "react-redux";
const { Option, OptGroup } = Select;
const { TabPane } = Tabs;

const UpdateDocumentsModal = props => {
  const dispatch = useDispatch();

  const [documentCategoryList, setDocumentCategoryList] = React.useState([]);
  const [documentSelected, setDocumentSelected] = React.useState(null);
  const [documentEdited, setDocumentEdited] = React.useState(null);
  const [error, setError] = React.useState({});
  const [value, setValue] = React.useState("edit");
  const [selectedDocumentsToBeDeleted, setSelectedDocumentsToBeDeleted] = React.useState([]);

  const [checkAll, setCheckAll] = React.useState(false);

  React.useEffect(() => {
    let list = get(props, "record", []).map(dataList => get(dataList, "document_category"));
    list = compact(list);
    setDocumentCategoryList(uniqBy(list));
  }, [props]);

  const getOptionsBasedOnType = category => {
    let listingType = filter(get(props, "record", []), function (o) {
      return get(o, "document_category") === category;
    });
    return listingType.length > 0 ? listingType : [];
  };

  const handleSave = () => {
    if (value === "edit") {
      if (get(documentEdited, "document_name")) {
        const requestPayload = {
          document_id_to_update: get(documentEdited, "document_id"),
          updated_document_name: get(documentEdited, "document_name")
        };

        if (get(documentSelected, "document_name") !== get(documentEdited, "document_name")) {
          props.handleSubmit(requestPayload);
        } else {
          message.info("Nothing to update");
        }
      } else {
        let tempError = { ...error };
        tempError["document_name"] = true;
        setError(tempError);
      }
    }

    if (value === "delete") {
      if (selectedDocumentsToBeDeleted.length > 0) {
        const requestPayload = {
          document_ids_to_delete: selectedDocumentsToBeDeleted
        };
        props.handleSubmit(requestPayload);
      } else {
        message.info("Nothing to delete");
      }
    }
  };

  const closeModal = () => {
    props.handleClose();
  };

  const handleChange = value => {
    const list = get(props, "record", []).find(dataList => value === get(dataList, "document_name"));
    setDocumentSelected(list);
    setDocumentEdited(list);
  };

  const handleDocumentNameChange = (type, value) => {
    let tempError = { ...error };
    tempError[type] = false;
    setError(tempError);

    let newValues = { ...documentEdited };
    newValues[type] = value;
    setDocumentEdited(newValues);
  };

  const onTabChange = tab => {
    setValue(tab);
    setDocumentSelected(null);
    setDocumentEdited(null);
    setSelectedDocumentsToBeDeleted([]);
  };

  const onDocumentSelectionChange = checkedValues => {
    setSelectedDocumentsToBeDeleted(checkedValues);
  };

  const onCheckAllChange = e => {
    const list = get(props, "record", []).map(all => all.document_id);
    setSelectedDocumentsToBeDeleted(e.target.checked ? list : []);
    setCheckAll(e.target.checked);
  };

  return (
    <>
      <Modal
        title={value === "delete" ? "Delete Documents" : "Update Documents"}
        centered
        width={value === "delete" ? 800 : 500}
        visible={get(props, "isOpen", false)}
        onOk={() => handleSave()}
        okText={value === "delete" ? "Delete" : "Update"}
        onCancel={() => closeModal()}
        className="document_update__order_details"
      >
        <Spin spinning={get(props, "isLoading", false)}>
          <Tabs defaultActiveKey="edit" onChange={onTabChange}>
            <TabPane
              tab={
                <span>
                  <EditOutlined />
                  Edit
                </span>
              }
              key="edit"
            >
              <Select
                className="w-100"
                onChange={handleChange}
                value={get(documentSelected, "document_name")}
                allowClear
                placeholder="Select Document"
              >
                {documentCategoryList.map(grp => {
                  return (
                    <OptGroup label={grp} key={grp}>
                      {getOptionsBasedOnType(grp).map((listing, index) => {
                        return (
                          <Option key={get(listing, "document_name") + index} value={get(listing, "document_name")}>
                            {get(listing, "document_name")}
                          </Option>
                        );
                      })}
                    </OptGroup>
                  );
                })}
              </Select>

              {documentEdited && (
                <>
                  <InputChange
                    handleChange={handleDocumentNameChange}
                    value={get(documentEdited, "document_name")}
                    required
                    validateStatus={get(error, "document_name") && "error"}
                    helpText={get(error, "document_name") ? "Enter valid Document Name" : ""}
                    type="document_name"
                    label="Document Name"
                    className="mt-3 mb-0 w-100"
                  />
                </>
              )}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <DeleteOutlined />
                  Delete
                </span>
              }
              key="delete"
            >
              <Checkbox onChange={onCheckAllChange} checked={checkAll}>
                Check all
              </Checkbox>
              <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 20px" }} />
              <Checkbox.Group
                style={{ width: "100%", overflow: "auto", maxHeight: 200 }}
                value={selectedDocumentsToBeDeleted}
                onChange={onDocumentSelectionChange}
              >
                <Row>
                  {get(props, "record", []).map((list, index) => {
                    return (
                      <Col xs={{ span: 24 }} sm={{ span: 12 }} key={index} className="mb-2">
                        <Checkbox value={get(list, "document_id")} className="proforma_view__document__name w-100">
                          <Tooltip placement="topLeft" title={get(list, "document_name")}>
                            <span>{get(list, "document_name")}</span>
                          </Tooltip>
                        </Checkbox>
                      </Col>
                    );
                  })}
                  {get(props, "record", []).length === 0 && <Col className="mb-2"> No Document Available </Col>}
                </Row>
              </Checkbox.Group>
            </TabPane>
          </Tabs>
        </Spin>
      </Modal>
    </>
  );
};

export default UpdateDocumentsModal;
