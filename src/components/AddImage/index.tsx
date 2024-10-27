import React from "react";
import { IconButton } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import styles from "./styles.module.scss"; // Assuming you're using SCSS/CSS for styles

interface AddImageProps {
  onClick?: () => void; // Optional onClick prop
}

const AddImage: React.FC<AddImageProps> = ({ onClick }) => {
  return (
    <div className={styles["item-container"]}>
      <IconButton onClick={onClick}> {/* Use onClick prop */}
        <AddIcon style={{ fontSize: 80 }} color="primary" />
      </IconButton>
    </div>
  );
};

export default AddImage;
