import { createSlice } from "@reduxjs/toolkit";

const storeOffersSlice = createSlice(
{
    name: "storeOffers",
    initialState: {
      list: [
        // {
        //   id: 123,
        //   name: "T-Shirt",
        //   description: "This, is very good t-shirt",
        //   image_url: "https://i5.walmartimages.com/asr/492531f4-6b6c-4aa9-9522-b1d81c2bc493.c7360b4097810e7eede3606cd218764b.jpeg",
        //   brand: "Dukandar",
        //   size: "M"
        // },
        // {
        //   id: 123,
        //   name: "T-Shirt",
        //   description: "This, is very good t-shirt",
        //   image_url: "https://i5.walmartimages.com/asr/492531f4-6b6c-4aa9-9522-b1d81c2bc493.c7360b4097810e7eede3606cd218764b.jpeg",
        //   brand: "Dukandar",
        //   size: "M"
        // }
      ],
    },
    reducers: {
      setStoreOffers(state, action) {
        const newOffers = {
          list: action.payload
        }
        return newOffers;
      },
      clearStoreOffers() {
        return { list: [] }
      }
    }
  }
)

export default storeOffersSlice