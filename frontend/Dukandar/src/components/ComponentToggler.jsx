import { useState } from "react";
import { useSelector } from "react-redux";

const ComponentToggler = ({ child1, child2 }) => {
  let state = useSelector(store => store.toggleContainers);

  return (
    <>
      {state === 1
        ? child1
        : child2}
    </>
  );
};

export default ComponentToggler;
