import ProductsContainer from "./ProductContainer"

const PageTest = () => {
      const products = [
    {
      leftTitle: "Nike T-Shirt",
      leftContent: "Comfortable cotton wearnkjcnjkvcnkjrvnjkrnjkqwertyuiopasdfgghjklzxcvbnmqwertyuiop[asdfghjkl;zxcvbnm,",
      leftExtra: (
        <>
          <p>Brand: Nike</p>
          <p>Price: ₹799</p>
        </>
      ),
      buttonText: "Add To Cart",

      cardTitle: "T-Shirt",
      image_url: "/tshirt.png",
      cardDescription: "This is "
    },

    {
      leftTitle: "Adidas Hoodie",
      leftContent: "Warm winter hoodie",
      leftExtra: (
        <>
          <p>Brand: Adidas</p>
          <p>Price: ₹1999</p>
        </>
      ),
      buttonText: "Add To Cart",

      cardTitle: "Hoodie",
      image_url: "/hoodie.png",
      cardDescription: "Premium hoodie"
    }
  ]

  return <ProductsContainer products={products} />
}

export default PageTest