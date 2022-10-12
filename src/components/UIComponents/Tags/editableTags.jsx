import { PlusOutlined } from "@ant-design/icons";
import { Input, Tag, Tooltip } from "antd";
import { get, isEqual } from "lodash";
import React from "react";
import "./index.scss";


class EditableTagGroup extends React.Component {
  state = {
    tags: get(this, "props.tags", []),
    clonedTags: get(this, "props.tags", []),
    inputVisible: false,
    selectedTags: [],
    inputValue: "",
    editInputIndex: -1,
    editInputValue: "",
  };

  componentDidMount() {
    this.setState({
      tags: get(this, "props.tags", []),
      clonedTags: get(this, "props.tags", []),
    });
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(get(prevProps, "tags", []), get(this, "props.tags", [])) ||
      !isEqual(get(prevProps, "isCleared", false), get(this, "props.isCleared", false))
    ) {
      this.setState({
        tags: get(this, "props.tags", []),
        clonedTags: get(this, "props.tags", []),
        selectedTags: []
      });
    }
  };

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    const selectedTags = this.state.selectedTags.filter(tag => tag !== removedTag);
    this.setState({ tags, selectedTags });
    if (this.props.handleChange) {
      this.props.handleChange(get(this, "props.type", ""), selectedTags);
    }
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags, selectedTags } = this.state;

    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
      selectedTags = [...selectedTags, inputValue];
      if (this.props.handleChange) {
        this.props.handleChange(get(this, "props.type", ""), selectedTags);
      }
    }

    this.setState({
      tags,
      selectedTags,
      inputVisible: false,
      inputValue: "",
    });
  };

  handleEditInputChange = e => {
    this.setState({ editInputValue: e.target.value });
  };

  handleEditInputConfirm = () => {
    this.setState(({ tags, editInputIndex, editInputValue }) => {
      const newTags = [...tags];
      newTags[editInputIndex] = editInputValue;

      return {
        tags: newTags,
        editInputIndex: -1,
        editInputValue: "",
      };
    });
  };

  saveInputRef = input => {
    this.input = input;
  };

  saveEditInputRef = input => {
    this.editInput = input;
  };

  handleChange = (tag, checked) => {
    const { selectedTags } = this.state;
    const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
    this.setState({ selectedTags: nextSelectedTags });
    if (this.props.handleChange) {
      this.props.handleChange(get(this, "props.type", ""), nextSelectedTags);
    }
  };

  render() {
    const { tags, clonedTags, inputVisible, inputValue, editInputIndex, editInputValue, selectedTags } = this.state;
    return (
      <div className="custom_editable_tags">
        {get(this, "state.selectedTags", []).length === 0 &&
          <div
            className="mb-3"
            style={{ color: "#6c757d", fontSize: 12 }}
          >
            NO TAGS ARE SELECTED
          </div>
        }
        {get(this, "state.selectedTags", []).length > 0 &&
          <div
            className="mb-3"
            style={{ color: "#6c757d", fontSize: 12 }}
          >
            HIGHLIGHTED TAGS ARE SELECTED
          </div>
        }
        {tags.map((tag, index) => {
          if (editInputIndex === index) {
            return (
              <Input
                ref={this.saveEditInputRef}
                key={tag}
                size="small"
                className="tag-input mb-3"
                placeholder="Enter Tag"
                maxLength={100}
                value={editInputValue}
                onChange={this.handleEditInputChange}
                onBlur={this.handleEditInputConfirm}
                onPressEnter={this.handleEditInputConfirm}
              />
            );
          }

          const isLongTag = tag && tag.length > 20;

          const tagElem = (
            <Tag
              className="edit-tag mb-3"
              key={tag}
              color={selectedTags.indexOf(tag) > -1 ? "processing" : "default"}
              onClick={() => {
                const checked = selectedTags.indexOf(tag) > -1 ? false : true;
                this.handleChange(tag, checked);
              }}
              onClose={() => this.handleClose(tag)}
              closable={clonedTags.indexOf(tag) === -1}
            >
              <span
                onDoubleClick={e => {
                  if (clonedTags.indexOf(tag) === -1) {
                    this.setState({ editInputIndex: index, editInputValue: tag }, () => {
                      this.editInput.focus();
                    });
                    e.preventDefault();
                  }
                }}
              >
                {isLongTag ? `${tag.slice(0, 25)}...` : tag}
              </span>
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}

        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            className="tag-input"
            value={inputValue}
            maxLength={100}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag
            className="site-tag-plus"
            onClick={this.showInput}
          >
            <PlusOutlined /> Add Tag
          </Tag>
        )}
      </div>
    );
  }
}

export default EditableTagGroup;