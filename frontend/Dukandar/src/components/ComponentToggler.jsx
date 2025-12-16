import { useState } from "react";

const ComponentToggler = ({ child1, child2 }) => {
  const [childIndex, setChildIndex] = useState(1);

  const showProducts = () => setChildIndex(1);
  const showStores = () => setChildIndex(2);

  return (
    <>
      {childIndex === 1
        ? child1({ showStores })
        : child2({ showProducts })}
    </>
  );
};

export default ComponentToggler;
