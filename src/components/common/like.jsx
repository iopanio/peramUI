import React from "react";

const Like = (props) => {
  let classes = "fa fa-check-square-o";
  if (!props.liked) classes = "fa fa-square-o";

  return (
    <i
      onClick={props.onClick}
      style={{ cursor: "pointer" }}
      className={classes}
      aria-hidden="true"
    />
  );
};

export default Like;
