import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import React, { useEffect, useState, Component } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { convertFromRaw } from "draft-js";

const content = {
  entityMap: {},
  blocks: [
    {
      key: "637gr",
      text: "Initialized from content state.",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
  ],
};

class TextEditor extends Component {
  constructor(props) {
    super(props);
    // const contentState = convertFromRaw(content);
    this.state = {
      //   contentState: "qlq",
      // ContentState JSON
    };
  }

  onContentStateChange = (contentState) => {
    this.setState({
      contentState,
    });
  };

  render() {
    const { contentState } = this.state;
    return (
      <div
        style={{
          border: "1px solid black",
          padding: "2px",
          minHeight: "400px",
        }}
      >
        <Editor
          //   initialContentState={contentState}
          //   editorState={contentState}
          wrapperClassName="wrapper-class"
          editorClassName="editor-class"
          toolbarClassName="toolbar-class"
          //   onContentStateChange={this.onContentStateChange}
        />
      </div>
    );
  }
}

export default TextEditor;
